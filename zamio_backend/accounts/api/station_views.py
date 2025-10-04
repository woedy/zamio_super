import logging
from decimal import Decimal
from django.core.mail import send_mail
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from django.conf import settings
from django.contrib.auth import get_user_model
from django.template.loader import get_template
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from accounts.api.serializers import UserRegistrationSerializer
from accounts.models import AuditLog
from accounts.api.enhanced_auth import SecurityEventHandler
from accounts.services import EmailVerificationService
from activities.models import AllActivity
from django.core.mail import send_mail
from django.contrib.auth import get_user_model, authenticate


from rest_framework.views import APIView

from accounts.api.serializers import UserRegistrationSerializer
from activities.models import AllActivity
from bank_account.models import BankAccount
from stations.models import Station, StationStaff, ROLE_CHOICES
from core.utils import generate_email_token, is_valid_email, is_valid_password

logger = logging.getLogger(__name__)


User = get_user_model()



@api_view(['POST', ])
@permission_classes([])
@authentication_classes([])
def register_station_view(request):

    payload = {}
    data = {}
    errors = {}

    if request.method == 'POST':
        email = request.data.get('email', "").lower()
        first_name = request.data.get('first_name', "")
        last_name = request.data.get('last_name', "")
        station_name = request.data.get('station_name', "")
        phone = request.data.get('phone', "")
        photo = request.FILES.get('photo')
        country = request.data.get('country', "")
        password = request.data.get('password', "")
        password2 = request.data.get('password2', "")


        if not email:
            errors['email'] = ['User Email is required.']
        elif not is_valid_email(email):
            errors['email'] = ['Valid email required.']
        elif check_email_exist(email):
            errors['email'] = ['Email already exists in our database.']

        if not first_name:
            errors['first_name'] = ['First Name is required.']

        if not last_name:
            errors['last_name'] = ['last Name is required.']

        if not station_name:
            errors['station_name'] = ['Staion Name is required.']

        if not phone:
            errors['phone'] = ['Phone number is required.']

        if not password:
            errors['password'] = ['Password is required.']

        if not password2:
            errors['password2'] = ['Password2 is required.']

        if password != password2:
            errors['password'] = ['Passwords dont match.']

        if not is_valid_password(password):
            errors['password'] = ['Password must be at least 8 characters long\n- Must include at least one uppercase letter,\n- One lowercase letter, one digit,\n- And one special character']

        if errors:
            payload['message'] = "Errors"
            payload['errors'] = errors
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            data["user_id"] = user.user_id
            data["email"] = user.email
            data["first_name"] = user.first_name
            data["last_name"] = user.last_name
            data["photo"] = user.photo

            if country:
                data["country"] = user.country


            user.user_type = "Station"
            user.phone = phone

            user.save()

            station_profile = Station.objects.create(
                user=user,
                name=station_name

            )
            station_profile.save()

            account = BankAccount.objects.get_or_create(
                user=user, 
                balance=Decimal('0.00'),
                currency="Ghc"
            )


            data['phone'] = user.phone
            data['country'] = user.country
            data['photo'] = user.photo.url

        token = Token.objects.get(user=user).key
        data['token'] = token

        try:
            # Use the new Celery email task system for email verification
            from accounts.email_utils import send_verification_email
            task_id = send_verification_email(user)
            data['email_task_id'] = task_id
            
        except Exception as e:
            # Log the error but don't fail registration
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send verification email during station registration: {str(e)}")
            # Continue with registration even if email fails



#
        new_activity = AllActivity.objects.create(
            user=user,
            subject="User Registration",
            body=user.email + " Just created an account."
        )
        new_activity.save()

        payload['message'] = "Successful"
        payload['data'] = data

    return Response(payload)



@api_view(['POST', ])
@permission_classes([])
@authentication_classes([])
def verify_station_email(request):
    """
    Verify station email using verification token (backward compatible).
    
    Requirements: 5.3, 10.1, 10.2 - Token verification with backward compatibility
    """
    payload = {}
    data = {}
    
    email = request.data.get('email', '').lower().strip()
    email_token = request.data.get('email_token', '').strip()
    
    # Get client IP for audit logging
    ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
    
    # Validate input
    if not email:
        payload['message'] = "Errors"
        payload['errors'] = {'email': ['Email is required.']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    
    if not email_token:
        payload['message'] = "Errors"
        payload['errors'] = {'email_token': ['Token is required.']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    
    # Use verification service for consistent handling
    verification_service = EmailVerificationService()
    result = verification_service.verify_token(email, email_token, ip_address)
    
    if not result['success']:
        # Maintain backward compatibility with old error format
        errors = {}
        if result['error_code'] == 'USER_NOT_FOUND':
            errors['email'] = ['Email does not exist.']
        elif result['error_code'] == 'INVALID_TOKEN':
            errors['email_token'] = ['Invalid Token.']
        elif result['error_code'] == 'ALREADY_VERIFIED':
            errors['email'] = ['Email is already verified.']
        else:
            errors['general'] = [result['message']]
        
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    
    # Verification successful - get user and prepare response
    try:
        user = User.objects.get(email=email)
        
        # Get or create auth token
        try:
            token = Token.objects.get(user=user)
        except Token.DoesNotExist:
            token = Token.objects.create(user=user)
        
        # Get station profile
        station = Station.objects.get(user=user)
        
        # Prepare response data (maintain backward compatibility)
        data["user_id"] = user.user_id
        data["station_id"] = station.station_id
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data["photo"] = user.photo.url if user.photo else None
        data["token"] = token.key
        data["country"] = user.country
        data["phone"] = user.phone
        data["next_step"] = station.onboarding_step
        data["profile_completed"] = station.profile_completed
        
        payload['message'] = "Successful"
        payload['data'] = data
        
        # Create activity log (maintain backward compatibility)
        new_activity = AllActivity.objects.create(
            user=user,
            subject="Verify Email",
            body=user.email + " just verified their email",
        )
        new_activity.save()
        
        return Response(payload, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        payload['message'] = "Errors"
        payload['errors'] = {'email': ['Email does not exist.']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    except Station.DoesNotExist:
        payload['message'] = "Errors"
        payload['errors'] = {'general': ['Station profile not found']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in verify_station_email: {str(e)}")
        payload['message'] = "Errors"
        payload['errors'] = {'general': ['An error occurred during verification']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def verify_station_email_code(request):
    """
    Verify station email using 4-digit verification code.
    
    Requirements: 3.4, 5.2, 5.3 - Code verification with proper error handling
    """
    payload = {}
    data = {}
    
    email = request.data.get('email', '').lower().strip()
    code = request.data.get('code', '').strip()
    
    # Get client IP for audit logging
    ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
    
    # Validate input
    if not email:
        payload['message'] = "Email is required"
        payload['errors'] = {'email': ['Email is required']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    
    if not code:
        payload['message'] = "Verification code is required"
        payload['errors'] = {'code': ['Verification code is required']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate code format (4 digits)
    if not code.isdigit() or len(code) != 4:
        payload['message'] = "Invalid code format"
        payload['errors'] = {'code': ['Verification code must be 4 digits']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    
    # Use verification service
    verification_service = EmailVerificationService()
    result = verification_service.verify_code(email, code, ip_address)
    
    if not result['success']:
        payload['message'] = result['message']
        payload['error_code'] = result['error_code']
        
        # Add specific error details for client handling
        if 'attempts_remaining' in result:
            payload['attempts_remaining'] = result['attempts_remaining']
        if 'retry_after' in result:
            payload['retry_after'] = result['retry_after']
        
        return Response(payload, status=result['status_code'])
    
    # Verification successful - get user and prepare response
    try:
        user = User.objects.get(email=email)
        
        # Get or create auth token
        try:
            token = Token.objects.get(user=user)
        except Token.DoesNotExist:
            token = Token.objects.create(user=user)
        
        # Get station profile
        station = Station.objects.get(user=user)
        
        # Prepare response data
        data["user_id"] = user.user_id
        data["station_id"] = station.station_id
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data["photo"] = user.photo.url if user.photo else None
        data["token"] = token.key
        data["country"] = user.country
        data["phone"] = user.phone
        data["next_step"] = station.onboarding_step
        data["profile_completed"] = station.profile_completed
        
        payload['message'] = "Email verified successfully"
        payload['data'] = data
        
        # Create activity log
        AllActivity.objects.create(
            user=user,
            subject="Verify Email",
            body=f"{user.email} verified their email using verification code",
        )
        
        return Response(payload, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        payload['message'] = "User not found"
        return Response(payload, status=status.HTTP_404_NOT_FOUND)
    except Station.DoesNotExist:
        payload['message'] = "Station profile not found"
        return Response(payload, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in verify_station_email_code: {str(e)}")
        payload['message'] = "An error occurred during verification"
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



def check_email_exist(email):

    qs = User.objects.filter(email=email)
    if qs.exists():
        return True
    else:
        return False



class StationLogin(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')
        fcm_token = request.data.get('fcm_token', '')
        payload = {}
        errors = {}

        # Get client IP for audit logging
        ip_address = self.get_client_ip(request)

        if not email:
            errors['email'] = ['Email is required.']
        if not password:
            errors['password'] = ['Password is required.']
        if not fcm_token:
            errors['fcm_token'] = ['FCM token is required.']

        if errors:
            # Log failed login attempt due to missing fields
            AuditLog.objects.create(
                user=None,
                action='station_login_failed',
                resource_type='authentication',
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                request_data={'email': email, 'errors': list(errors.keys())},
                response_data={'error': 'validation_failed'},
                status_code=400
            )
            return Response({'message': 'Errors', 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(email=email, password=password)

        if not user:
            # Handle failed login with security measures
            security_result = SecurityEventHandler.handle_failed_login(
                user_email=email,
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                reason='invalid_credentials'
            )
            
            error_message = 'Invalid credentials'
            if security_result.get('account_locked'):
                error_message = f'Account locked due to multiple failed attempts. Try again after {security_result.get("locked_until")}'
            
            return Response({
                'message': 'Errors', 
                'errors': {'email': [error_message]},
                'security_info': {
                    'failed_attempts': security_result.get('failed_attempts', 0),
                    'account_locked': security_result.get('account_locked', False)
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            station = Station.objects.get(user=user)
        except Station.DoesNotExist:
            # Log failed login attempt - user exists but not a station
            AuditLog.objects.create(
                user=user,
                action='station_login_failed',
                resource_type='authentication',
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                request_data={'email': email},
                response_data={'error': 'not_station'},
                status_code=400
            )
            return Response({'message': 'Errors', 'errors': {'email': ['User is not a station']}}, status=status.HTTP_400_BAD_REQUEST)

        if not user.email_verified:
            # Log failed login attempt due to unverified email
            AuditLog.objects.create(
                user=user,
                action='station_login_failed',
                resource_type='authentication',
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                request_data={'email': email},
                response_data={'error': 'email_not_verified'},
                status_code=400
            )
            return Response({'message': 'Errors', 'errors': {'email': ['Please check your email to confirm your account or resend confirmation email.']}}, status=status.HTTP_400_BAD_REQUEST)

        # Handle successful login with security measures
        SecurityEventHandler.handle_successful_login(
            user=user,
            ip_address=ip_address,
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Token and FCM token
        token, _ = Token.objects.get_or_create(user=user)
        user.fcm_token = fcm_token
        user.save(update_fields=['fcm_token'])

        # Align stored onboarding_step with computed next step, but never regress.
        try:
            step_order = ['profile', 'staff', 'report', 'payment', 'done']
            computed = station.get_next_onboarding_step()
            cur_idx = step_order.index(station.onboarding_step) if station.onboarding_step in step_order else 0
            cmp_idx = step_order.index(computed) if computed in step_order else 0
            new_step = step_order[max(cur_idx, cmp_idx)]
            if new_step != station.onboarding_step:
                station.onboarding_step = new_step
                station.save()
        except Exception:
            station.save()

        data = {
            "user_id": user.user_id,
            "station_id": station.station_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "photo": user.photo.url if user.photo else None,
            "country": user.country,
            "phone": user.phone,
            "token": token.key,
            "onboarding_step": station.onboarding_step,
        }

        # Create activity log
        AllActivity.objects.create(user=user, subject="Station Login", body=f"{user.email} just logged in.")

        return Response({'message': 'Successful', 'data': data}, status=status.HTTP_200_OK)

    def get_client_ip(self, request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip



def check_password(email, password):

    try:
        user = User.objects.get(email=email)
        return user.check_password(password)
    except User.DoesNotExist:
        return False





from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def complete_station_profile_view(request):
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    bio = request.data.get('bio', "")
    country = request.data.get('country', "")
    region = request.data.get('region', "")
    photo = request.data.get('photo', "")

    if not station_id:
        errors['station_id'] = ['Station ID is required.']

    try:
        station = Station.objects.get(station_id=station_id)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Apply changes if provided
    if bio:
        station.bio = bio
    if country:
        station.country = country
    if region:
        station.region = region

    # Handle photo upload
    photo_url = None
    if photo:
        # Delete old photo if it exists and is not the default
        if station.user.photo and 'default' not in station.user.photo.name:
            station.user.photo.delete(save=False)
        # Save new photo
        station.user.photo = photo
        station.user.save()
        photo_url = station.user.photo.url if station.user.photo else None
    
    # Mark this step as complete (profile)
    station.profile_completed = True

    # Move to next onboarding step
    station.onboarding_step = station.get_next_onboarding_step()
    station.save()

    data["station_id"] = station.station_id
    data["next_step"] = station.onboarding_step
    if photo_url:
        data["photo"] = photo_url

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def complete_add_staff_view(request):
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    staff_payload = request.data.get('staff', [])

    if not station_id:
        errors['station_id'] = ['Station ID is required.']

    try:
        station = Station.objects.get(station_id=station_id)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Normalize staff payload (allow JSON string or list)
    import json
    if isinstance(staff_payload, str):
        try:
            staff_payload = json.loads(staff_payload)
        except Exception:
            staff_payload = []

    if not isinstance(staff_payload, list):
        staff_payload = []

    # Validate and collect staff entries
    valid_roles = [c[0] for c in ROLE_CHOICES]
    to_create = []
    for item in staff_payload:
        try:
            name = (item.get('name') or '').strip()
            email = (item.get('email') or '').strip() or None
            role = (item.get('role') or '').strip()
        except AttributeError:
            continue
        if not name or role not in valid_roles:
            continue
        to_create.append(StationStaff(station=station, name=name, email=email, role=role))

    if to_create:
        StationStaff.objects.bulk_create(to_create)

    # Mark this step as complete when at least one entry is present; otherwise keep current state
    if to_create:
        station.staff_completed = True

    # Move to next onboarding step
    station.onboarding_step = station.get_next_onboarding_step()
    station.save()

    data["station_id"] = station.station_id
    data["next_step"] = station.onboarding_step

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def complete_report_method_view(request):
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    bio = request.data.get('bio', "")
    country = request.data.get('country', "")
    region = request.data.get('region', "")
    photo = request.data.get('photo', "")

    if not station_id:
        errors['station_id'] = ['Station ID is required.']

    try:
        station = Station.objects.get(station_id=station_id)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Apply changes if provided
    if bio:
        station.bio = bio
    if country:
        station.country = country
    if region:
        station.region = region
    if photo:
        station.photo = photo

    # Mark this step as complete (report method)
    station.report_completed = True

    # Move to next onboarding step
    station.onboarding_step = station.get_next_onboarding_step()
    station.save()

    data["station_id"] = station.station_id
    data["next_step"] = station.onboarding_step

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def onboard_station_view(request):
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    if not station_id:
        errors['station_id'] = ['Station ID is required.']

    try:
        station = Station.objects.get(station_id=station_id)
    except Station.DoesNotExist:
        errors['station'] = ['Station not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    fields_to_update = [
        'name', 'stage_name', 'bio', 'profile_image', 'spotify_url',
        'shazam_url', 'instagram', 'twitter', 'website', 'contact_email', 'active'
    ]
    for field in fields_to_update:
        value = request.data.get(field)
        if value is not None:
            setattr(station, field, value)

    station.save()

    # Check if fields are not null to complete profile
    profile_fields = [
        'name', 'photo', 'phone', 'country', 'region',
        'location_name', 'lat', 'lng', 'about'
    ]
    profile_complete = all(getattr(station, field) is not None for field in profile_fields)
    station.profile_completed = profile_complete
    station.save()

    data["station_id"] = station.id
    data["name"] = station.name

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def complete_station_payment_view(request):
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    momo = request.data.get('momo', "")
    bankAccount = request.data.get('bankAccount', "")

    if not station_id:
        errors['station_id'] = ['Station ID is required.']

    try:
        station = Station.objects.get(station_id=station_id)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Apply changes if provided
    if momo:
        station.momo_account = momo
    if bankAccount:
        station.bank_account = bankAccount

    # Mark this step as complete
    station.payment_info_added = True

    # Move to next onboarding step
    station.onboarding_step = station.get_next_onboarding_step()
    station.save()

    data["station_id"] = station.station_id
    data["next_step"] = station.onboarding_step

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)
@api_view(['POST'])
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def logout_station_view(request):
    payload = {}
    data = {}
    errors = {}

    # Get client IP for audit logging
    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    ip_address = get_client_ip(request)

    try:
        # Get the station associated with the authenticated user
        station = Station.objects.get(user=request.user)
    except Station.DoesNotExist:
        errors['user'] = ['User is not a station.']
        payload['message'] = "Errors"
        payload['errors'] = errors
        
        # Log failed logout attempt
        AuditLog.objects.create(
            user=request.user,
            action='station_logout_failed',
            resource_type='authentication',
            ip_address=ip_address,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            response_data={'error': 'not_station'},
            status_code=400
        )
        
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Clear FCM token for security
    request.user.fcm_token = None
    request.user.save()

    # Delete the authentication token to invalidate the session
    try:
        token = Token.objects.get(user=request.user)
        token.delete()
    except Token.DoesNotExist:
        pass  # Token already deleted or doesn't exist

    # Create activity log
    new_activity = AllActivity.objects.create(
        user=request.user,
        type="Authentication",
        subject="Station Log out",
        body=f"{request.user.email} just logged out of the account."
    )

    # Log successful logout
    AuditLog.objects.create(
        user=request.user,
        action='station_logout_success',
        resource_type='authentication',
        resource_id=str(station.station_id),
        ip_address=ip_address,
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        response_data={'success': True, 'session_invalidated': True},
        status_code=200
    )

    data = {
        'message': 'Successfully logged out',
        'session_invalidated': True,
        'timestamp': timezone.now().isoformat()
    }

    payload['message'] = "Successfully logged out"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def skip_station_onboarding_view(request):
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    step = request.data.get('step', "")

    if not station_id:
        errors['station_id'] = ['Station ID is required.']
    if not step:
        errors['step'] = ['Target step is required.']

    try:
        station = Station.objects.get(station_id=station_id)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found.']
        station = None

    if station and step not in dict(Station.ONBOARDING_STEPS).keys():
        errors['step'] = ['Invalid onboarding step.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    station.onboarding_step = step
    station.save()

    data['station_id'] = station.station_id
    data['next_step'] = station.onboarding_step

    payload['message'] = 'Successful'
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def station_onboarding_status_view(request):
    payload = {}
    data = {}
    errors = {}

    station_id = request.query_params.get('station_id', "")
    if not station_id:
        errors['station_id'] = ['Station ID is required.']
        payload['message'] = 'Errors'
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    try:
        station = Station.objects.get(station_id=station_id)
    except Station.DoesNotExist:
        payload['message'] = 'Errors'
        payload['errors'] = {'station_id': ['Station not found.']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    data['station_id'] = station.station_id
    data['onboarding_step'] = station.onboarding_step
    data['profile_completed'] = station.profile_completed
    data['staff_completed'] = station.staff_completed
    data['report_completed'] = station.report_completed
    data['payment_info_added'] = station.payment_info_added

    payload['message'] = 'Successful'
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)

# Enhanced Station Onboarding API Endpoints

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def enhanced_station_onboarding_status_view(request, station_id):
    """Get enhanced onboarding status for a station"""
    payload = {}
    data = {}
    errors = {}

    try:
        station = Station.objects.get(station_id=station_id, user=request.user)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found or access denied.']
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_404_NOT_FOUND)

    # Get user KYC status
    user = station.user
    
    data = {
        "station_id": station.station_id,
        "onboarding_step": station.onboarding_step,
        "profile_completed": station.profile_completed,
        "staff_completed": station.staff_completed,
        "payment_info_added": station.payment_info_added,
        "kyc_status": user.kyc_status,
        "kyc_documents": user.kyc_documents,
        "station_name": station.name,
        "station_class": station.station_class,
        "station_type": station.station_type,
        "license_number": station.license_number,
        "coverage_area": station.coverage_area,
        "estimated_listeners": station.estimated_listeners,
        "country": station.country,
        "region": station.region,
        "profile_complete_percentage": calculate_station_completion_percentage(station),
        "next_recommended_step": get_station_next_recommended_step(station),
        "required_fields": get_station_required_fields_status(station),
        "compliance_setup": get_station_compliance_status(station),
        "stream_links": get_station_stream_links(station),
        "staff_members": get_station_staff_summary(station),
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def update_station_onboarding_status_view(request):
    """Update specific station onboarding step status"""
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    step = request.data.get('step', "")
    completed = request.data.get('completed', False)

    if not station_id:
        errors['station_id'] = ['Station ID is required.']
    if not step:
        errors['step'] = ['Step is required.']

    try:
        station = Station.objects.get(station_id=station_id, user=request.user)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found or access denied.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Update the specific step status
    step_mapping = {
        'profile': 'profile_completed',
        'staff': 'staff_completed',
        'payment': 'payment_info_added',
    }

    if step in step_mapping:
        setattr(station, step_mapping[step], completed)
        if completed:
            station.onboarding_step = station.get_next_onboarding_step()
        station.save()

    data = {
        "station_id": station.station_id,
        "step": step,
        "completed": completed,
        "next_step": station.onboarding_step,
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def complete_station_onboarding_view(request):
    """Mark station onboarding as complete"""
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")

    if not station_id:
        errors['station_id'] = ['Station ID is required.']

    try:
        station = Station.objects.get(station_id=station_id, user=request.user)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found or access denied.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Mark onboarding as complete
    station.onboarding_step = 'done'
    station.active = True  # Activate the station
    station.save()

    # Update user profile completion status
    user = station.user
    user.profile_complete = True
    user.save()

    # Create admin notification
    AllActivity.objects.create(
        user=user,
        subject="Station Onboarding Complete",
        body=f"Station {station.name} has completed onboarding and is now active."
    )

    data = {
        "station_id": station.station_id,
        "onboarding_complete": True,
        "station_active": station.active,
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def update_station_stream_links_view(request):
    """Update station stream links with validation"""
    from stations.models import StationStreamLink
    import requests
    
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    stream_links = request.data.get('stream_links', [])

    if not station_id:
        errors['station_id'] = ['Station ID is required.']

    try:
        station = Station.objects.get(station_id=station_id, user=request.user)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found or access denied.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Validate and create stream links
    validated_links = []
    for link_data in stream_links:
        link_url = link_data.get('link', '').strip()
        if not link_url:
            continue
            
        # Basic URL validation
        if not (link_url.startswith('http://') or link_url.startswith('https://')):
            errors.setdefault('stream_links', []).append(f'Invalid URL format: {link_url}')
            continue
        
        # Optional: Test connectivity (can be disabled for performance)
        is_active = True
        try:
            response = requests.head(link_url, timeout=5)
            is_active = response.status_code < 400
        except:
            is_active = False
        
        validated_links.append({
            'link': link_url,
            'active': is_active
        })

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Clear existing links and create new ones
    StationStreamLink.objects.filter(station=station).delete()
    
    for link_data in validated_links:
        StationStreamLink.objects.create(
            station=station,
            link=link_data['link'],
            active=link_data['active']
        )

    data = {
        "station_id": station.station_id,
        "stream_links_updated": len(validated_links),
        "stream_links": validated_links,
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def update_station_compliance_setup_view(request):
    """Update station compliance and regulatory setup"""
    payload = {}
    data = {}
    errors = {}

    station_id = request.data.get('station_id', "")
    license_number = request.data.get('license_number', "")
    station_class = request.data.get('station_class', "")
    station_type = request.data.get('station_type', "")
    coverage_area = request.data.get('coverage_area', "")
    estimated_listeners = request.data.get('estimated_listeners', None)
    regulatory_bodies = request.data.get('regulatory_bodies', [])

    if not station_id:
        errors['station_id'] = ['Station ID is required.']

    try:
        station = Station.objects.get(station_id=station_id, user=request.user)
    except Station.DoesNotExist:
        errors['station_id'] = ['Station not found or access denied.']

    # Validate station class and type
    valid_classes = [choice[0] for choice in Station.STATION_CLASSES]
    valid_types = [choice[0] for choice in Station.STATION_TYPES]
    
    if station_class and station_class not in valid_classes:
        errors['station_class'] = [f'Invalid station class. Must be one of: {", ".join(valid_classes)}']
    
    if station_type and station_type not in valid_types:
        errors['station_type'] = [f'Invalid station type. Must be one of: {", ".join(valid_types)}']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Update station fields
    if license_number:
        station.license_number = license_number
    if station_class:
        station.station_class = station_class
    if station_type:
        station.station_type = station_type
    if coverage_area:
        station.coverage_area = coverage_area
    if estimated_listeners is not None:
        try:
            station.estimated_listeners = int(estimated_listeners)
        except (ValueError, TypeError):
            pass

    station.save()

    data = {
        "station_id": station.station_id,
        "license_number": station.license_number,
        "station_class": station.station_class,
        "station_type": station.station_type,
        "coverage_area": station.coverage_area,
        "estimated_listeners": station.estimated_listeners,
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


def calculate_station_completion_percentage(station):
    """Calculate station profile completion percentage"""
    total_fields = 3  # profile, staff, payment
    completed_fields = 0

    if station.profile_completed:
        completed_fields += 1
    if station.staff_completed:
        completed_fields += 1
    if station.payment_info_added:
        completed_fields += 1

    return round((completed_fields / total_fields) * 100)


def get_station_next_recommended_step(station):
    """Get the next recommended step for the station"""
    if not station.profile_completed:
        return 'profile'
    elif not station.staff_completed:
        return 'staff'
    elif not station.payment_info_added:
        return 'payment'
    return 'done'


def get_station_required_fields_status(station):
    """Get status of required fields for station profile completion"""
    user = station.user
    
    return {
        'basic_info': {
            'completed': bool(user.first_name and user.last_name and station.name),
            'fields': ['first_name', 'last_name', 'station_name']
        },
        'station_details': {
            'completed': bool(station.country and station.region and user.photo),
            'fields': ['country', 'region', 'photo']
        },
        'contact_info': {
            'completed': bool(user.email and user.phone),
            'fields': ['email', 'phone']
        },
        'compliance_info': {
            'completed': bool(station.license_number and station.station_class and station.station_type),
            'fields': ['license_number', 'station_class', 'station_type']
        },
        'payment_info': {
            'completed': bool(station.momo_account or station.bank_account),
            'fields': ['momo_account', 'bank_account']
        }
    }


def get_station_compliance_status(station):
    """Get station compliance setup status"""
    return {
        'license_number': station.license_number,
        'station_class': station.station_class,
        'station_type': station.station_type,
        'coverage_area': station.coverage_area,
        'estimated_listeners': station.estimated_listeners,
        'compliance_complete': bool(
            station.license_number and 
            station.station_class and 
            station.station_type
        )
    }


def get_station_stream_links(station):
    """Get station stream links with status"""
    from stations.models import StationStreamLink
    
    links = StationStreamLink.objects.filter(station=station, is_archived=False)
    return [
        {
            'id': link.id,
            'link': link.link,
            'active': link.active,
            'created_at': link.created_at
        }
        for link in links
    ]


def get_station_staff_summary(station):
    """Get station staff summary"""
    staff_members = StationStaff.objects.filter(station=station, is_archived=False, active=True)
    return [
        {
            'id': staff.id,
            'name': staff.name,
            'email': staff.email,
            'role': staff.role,
            'created_at': staff.created_at
        }
        for staff in staff_members
    ]