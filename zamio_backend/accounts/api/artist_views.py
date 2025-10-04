import logging
from decimal import Decimal
from django.core.mail import send_mail
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
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


from rest_framework.views import APIView

from accounts.api.serializers import UserRegistrationSerializer
from activities.models import AllActivity
from artists.models import Artist
from bank_account.models import BankAccount
from core.utils import generate_email_token, is_valid_email, is_valid_password
from publishers.models import PublisherProfile

logger = logging.getLogger(__name__)


User = get_user_model()



@api_view(['POST', ])
@permission_classes([])
@authentication_classes([])
def register_artist_view(request):

    payload = {}
    data = {}
    errors = {}

    if request.method == 'POST':
        email = request.data.get('email', "").lower()
        first_name = request.data.get('first_name', "")
        last_name = request.data.get('last_name', "")
        stage_name = request.data.get('stage_name', "")
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
        if not stage_name:
            errors['stage_name'] = ['Stage Name is required.']

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
        if not serializer.is_valid():
            payload['message'] = "Errors"
            payload['errors'] = serializer.errors
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        # Populate additional user fields not handled by serializer
        user.user_type = "Artist"
        user.phone = phone
        if country:
            user.country = country
        if photo:
            user.photo = photo
        user.save()

        # Create artist profile and wallet
        artist_profile = Artist.objects.create(
            user=user,
            stage_name=stage_name
        )
        BankAccount.objects.get_or_create(
            user=user,
            defaults={
                'balance': Decimal('0.00'),
                'currency': "Ghc",
            }
        )

        # Prepare response data
        data["user_id"] = user.user_id
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data['phone'] = user.phone
        data['country'] = user.country
        data['photo'] = user.photo.url if getattr(user.photo, 'url', None) else None

        # Token for client session (email must still be verified to log in)
        token_obj, _ = Token.objects.get_or_create(user=user)
        data['token'] = token_obj.key

        try:
            # Use the new Celery email task system for email verification
            from accounts.email_utils import send_verification_email
            task_id = send_verification_email(user)
            data['email_task_id'] = task_id
            
        except Exception as e:
            # Log the error but don't fail registration
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send verification email during artist registration: {str(e)}")
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
def verify_artist_email(request):
    """
    Verify artist email using verification token (backward compatible).
    
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
        
        # Get artist profile
        artist = Artist.objects.get(user=user)
        
        # Prepare response data (maintain backward compatibility)
        data["user_id"] = user.user_id
        data["artist_id"] = artist.artist_id
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data["photo"] = user.photo.url if user.photo else None
        data["token"] = token.key
        data["country"] = user.country
        data["phone"] = user.phone
        data["next_step"] = artist.onboarding_step
        data["profile_completed"] = artist.profile_completed
        
        payload['message'] = "Successful"
        payload['data'] = data
        
        # Create activity log (maintain backward compatibility)
        new_activity = AllActivity.objects.create(
            user=user,
            subject="Verify Email",
            body=user.email + " just verified their email",
        )
        new_activity.save()
        
    except User.DoesNotExist:
        payload['message'] = "Errors"
        payload['errors'] = {'email': ['Email does not exist.']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    except Artist.DoesNotExist:
        payload['message'] = "Errors"
        payload['errors'] = {'general': ['Artist profile not found']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in verify_artist_email: {str(e)}")
        payload['message'] = "Errors"
        payload['errors'] = {'general': ['An error occurred during verification']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def verify_artist_email_code(request):
    """
    Verify artist email using 4-digit verification code.
    
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
        
        # Get artist profile
        artist = Artist.objects.get(user=user)
        
        # Prepare response data
        data["user_id"] = user.user_id
        data["artist_id"] = artist.artist_id
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data["photo"] = user.photo.url if user.photo else None
        data["token"] = token.key
        data["country"] = user.country
        data["phone"] = user.phone
        data["next_step"] = artist.onboarding_step
        data["profile_completed"] = artist.profile_completed
        
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
    except Artist.DoesNotExist:
        payload['message'] = "Artist profile not found"
        return Response(payload, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in verify_artist_email_code: {str(e)}")
        payload['message'] = "An error occurred during verification"
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)







def check_email_exist(email):

    qs = User.objects.filter(email=email)
    if qs.exists():
        return True
    else:
        return False




class ArtistLogin(APIView):
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
                action='artist_login_failed',
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
            artist = Artist.objects.get(user=user)
        except Artist.DoesNotExist:
            # Log failed login attempt - user exists but not an artist
            AuditLog.objects.create(
                user=user,
                action='artist_login_failed',
                resource_type='authentication',
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                request_data={'email': email},
                response_data={'error': 'not_artist'},
                status_code=400
            )
            return Response({'message': 'Errors', 'errors': {'email': ['User is not an artist']}}, status=status.HTTP_400_BAD_REQUEST)

        if not user.email_verified:
            # Log failed login attempt due to unverified email
            AuditLog.objects.create(
                user=user,
                action='artist_login_failed',
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

        # Do not override stored onboarding_step here.
        # It is updated by completion endpoints or explicit skip actions.
        artist.save()

        data = {
            "user_id": user.user_id,
            "artist_id": artist.artist_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "photo": user.photo.url if getattr(user.photo, 'url', None) else None,
            "country": user.country,
            "phone": user.phone,
            "token": token.key,
            "onboarding_step": artist.onboarding_step,
        }

        # Create activity log
        AllActivity.objects.create(user=user, subject="Artist Login", body=f"{user.email} just logged in.")

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




from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def complete_artist_profile_view(request):
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

    artist_id = request.data.get('artist_id', "")
    bio = request.data.get('bio', "")
    country = request.data.get('country', "")
    region = request.data.get('region', "")
    photo = request.FILES.get('photo')

    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id)
        
        # Verify the artist belongs to the authenticated user
        if artist.user != request.user:
            errors['permission'] = ['You can only update your own profile.']
            
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        
        # Log failed profile update attempt
        AuditLog.objects.create(
            user=request.user,
            action='artist_profile_update_failed',
            resource_type='artist_profile',
            resource_id=artist_id,
            ip_address=ip_address,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            request_data={'artist_id': artist_id, 'errors': list(errors.keys())},
            response_data={'error': 'validation_failed'},
            status_code=400
        )
        
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Store old values for audit logging
    old_values = {
        'bio': getattr(artist, 'bio', ''),
        'country': getattr(artist, 'country', ''),
        'region': getattr(artist, 'region', ''),
        'photo': artist.user.photo.name if artist.user.photo else None
    }

    # Apply changes if provided
    changes_made = {}
    if bio and bio != old_values['bio']:
        artist.bio = bio
        changes_made['bio'] = {'old': old_values['bio'], 'new': bio}
    if country and country != old_values['country']:
        artist.country = country
        changes_made['country'] = {'old': old_values['country'], 'new': country}
    if region and region != old_values['region']:
        artist.region = region
        changes_made['region'] = {'old': old_values['region'], 'new': region}
    
    # Handle photo upload
    photo_url = None
    if photo:
        # Delete old photo if it exists and is not the default
        if artist.user.photo and 'default' not in artist.user.photo.name:
            artist.user.photo.delete(save=False)
        # Save new photo
        artist.user.photo = photo
        artist.user.save()
        photo_url = artist.user.photo.url if artist.user.photo else None
        changes_made['photo'] = {'old': old_values['photo'], 'new': artist.user.photo.name}
    
    # Save artist changes
    artist.save()
    # Mark this step as complete (profile)
    artist.profile_completed = True
    artist.save()

    data["artist_id"] = artist.artist_id
    data["next_step"] = artist.onboarding_step
    if photo_url:
        data["photo"] = photo_url

    # Log successful profile update
    AuditLog.objects.create(
        user=request.user,
        action='artist_profile_updated',
        resource_type='artist_profile',
        resource_id=str(artist.artist_id),
        ip_address=ip_address,
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        request_data={
            'artist_id': artist_id,
            'fields_updated': list(changes_made.keys())
        },
        response_data={
            'success': True,
            'changes_made': changes_made,
            'profile_completed': True
        },
        status_code=200
    )

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def skip_artist_onboarding_view(request):
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', "")
    step = request.data.get('step', "")

    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']
    if not step:
        errors['step'] = ['Target step is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found.']
        artist = None

    if artist and step not in dict(Artist.ONBOARDING_STEPS).keys():
        errors['step'] = ['Invalid onboarding step.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Update only the pointer for where to resume onboarding.
    artist.onboarding_step = step
    artist.save()

    data["artist_id"] = artist.artist_id
    data["next_step"] = artist.onboarding_step

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def complete_artist_social_view(request):
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', "")
    facebook = request.data.get('facebook', "")
    twitter = request.data.get('twitter', "")
    instagram = request.data.get('instagram', "")
    youtube = request.data.get('youtube', "")

    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Apply changes if provided
    if facebook:
        artist.facebook = facebook
    if twitter:
        artist.twitter = twitter
    if instagram:
        artist.instagram = instagram
    if youtube:
        artist.youtube = youtube

    # Mark this step as complete
    artist.social_media_added = True

    # Move to next onboarding step
    artist.onboarding_step = artist.get_next_onboarding_step()
    artist.save()

    data["artist_id"] = artist.artist_id
    data["next_step"] = artist.onboarding_step

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def complete_artist_payment_view(request):
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', "")
    momo = request.data.get('momo', "")
    bankAccount = request.data.get('bankAccount', "")

    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Apply changes if provided
    if momo:
        artist.momo_account = momo
    if bankAccount:
        artist.bank_account = bankAccount

    # Mark this step as complete
    artist.payment_info_added = True

    # Move to next onboarding step
    artist.onboarding_step = artist.get_next_onboarding_step()
    artist.save()

    data["artist_id"] = artist.artist_id
    data["next_step"] = artist.onboarding_step

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def complete_artist_publisher_view(request):
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', "")
    publisher_id = request.data.get('publisher_id', "")
    self_publish_raw = request.data.get('self_publish', "")
    # Coerce common truthy string forms to boolean
    truthy = {True, 'true', 'True', '1', 1, 'on', 'yes', 'Yes'}
    falsy = {False, 'false', 'False', '0', 0, 'off', 'no', 'No', None, ''}
    self_publish = True if self_publish_raw in truthy else False if self_publish_raw in falsy else bool(self_publish_raw)

    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Apply changes
    if self_publish is True:
        artist.self_publish = True
        # Clear any previously set publisher if switching to self-publish
        artist.publisher = None
    else:
        artist.self_publish = False
        if publisher_id:
            try:
                publisher = PublisherProfile.objects.get(publisher_id=publisher_id)
                artist.publisher = publisher
            except PublisherProfile.DoesNotExist:
                errors['publisher_id'] = ['Publisher not found.']

        if errors:
            payload['message'] = "Errors"
            payload['errors'] = errors
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
            
    # Mark this step as complete
    artist.publisher_added = True

    # Move to next onboarding step
    artist.onboarding_step = artist.get_next_onboarding_step()
    artist.save()

    data["artist_id"] = artist.artist_id
    data["next_step"] = artist.onboarding_step

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)








@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def onboard_artist_view(request):
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', "")
    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id)
    except Artist.DoesNotExist:
        errors['artist'] = ['Artist not found.']

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
            setattr(artist, field, value)

    artist.save()


    # Check if fields are not null to complete profile
    if not artist.name or not artist.stage_name or not artist.bio or not artist.profile_image:
        errors['profile'] = ['Please complete your profile.']
    if not artist.spotify_url or not artist.shazam_url:
        errors['links'] = ['Please provide your Spotify and Shazam links.'] 
    if not artist.instagram or not artist.twitter:
        errors['social'] = ['Please provide your Instagram and Twitter links.']
    if not artist.contact_email:
        errors['contact_email'] = ['Contact email is required.']
    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    artist.profile_completed = True
    artist.save()

    
    data["user_id"] = artist.user.user_id
    data["email"] = artist.user.email
    data["artist_id"] = artist.artist_id
    data["name"] = artist.stage_name

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload)





@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def logout_artist_view(request):
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
        # Get the artist associated with the authenticated user
        artist = Artist.objects.get(user=request.user)
    except Artist.DoesNotExist:
        errors['user'] = ['User is not an artist.']
        payload['message'] = "Errors"
        payload['errors'] = errors
        
        # Log failed logout attempt
        AuditLog.objects.create(
            user=request.user,
            action='artist_logout_failed',
            resource_type='authentication',
            ip_address=ip_address,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            response_data={'error': 'not_artist'},
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
        subject="Artist Log out",
        body=f"{request.user.email} just logged out of the account."
    )

    # Log successful logout
    AuditLog.objects.create(
        user=request.user,
        action='artist_logout_success',
        resource_type='authentication',
        resource_id=str(artist.artist_id),
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

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)





# Enhanced Artist Onboarding API Endpoints

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def artist_onboarding_status_view(request, artist_id):
    """Get current onboarding status for an artist"""
    payload = {}
    data = {}
    errors = {}

    try:
        artist = Artist.objects.get(artist_id=artist_id, user=request.user)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found or access denied.']
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_404_NOT_FOUND)

    # Get user KYC status
    user = artist.user
    
    data = {
        "artist_id": artist.artist_id,
        "onboarding_step": artist.onboarding_step,
        "profile_completed": artist.profile_completed,
        "social_media_added": artist.social_media_added,
        "payment_info_added": artist.payment_info_added,
        "publisher_added": artist.publisher_added,
        "track_uploaded": artist.track_uploaded,
        "kyc_status": user.kyc_status,
        "kyc_documents": user.kyc_documents,
        "self_published": artist.self_published,
        "publisher_relationship_status": artist.publisher_relationship_status,
        "royalty_collection_method": artist.royalty_collection_method,
        "profile_complete_percentage": calculate_profile_completion_percentage(artist),
        "next_recommended_step": get_next_recommended_step(artist),
        "required_fields": get_required_fields_status(artist),
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def update_onboarding_status_view(request):
    """Update specific onboarding step status"""
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', "")
    step = request.data.get('step', "")
    completed = request.data.get('completed', False)

    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']
    if not step:
        errors['step'] = ['Step is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id, user=request.user)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found or access denied.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Update the specific step status
    step_mapping = {
        'profile': 'profile_completed',
        'social-media': 'social_media_added',
        'payment': 'payment_info_added',
        'publisher': 'publisher_added',
        'track': 'track_uploaded',
    }

    if step in step_mapping:
        setattr(artist, step_mapping[step], completed)
        if completed:
            artist.onboarding_step = artist.get_next_onboarding_step()
        artist.save()

    data = {
        "artist_id": artist.artist_id,
        "step": step,
        "completed": completed,
        "next_step": artist.onboarding_step,
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def complete_artist_onboarding_view(request):
    """Mark artist onboarding as complete and set self-published status"""
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', "")

    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id, user=request.user)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found or access denied.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Mark onboarding as complete
    artist.onboarding_step = 'done'
    
    # Ensure self-published status is set correctly
    if not artist.publisher:
        artist.self_published = True
        artist.royalty_collection_method = 'direct'
        artist.publisher_relationship_status = 'independent'
    
    artist.save()

    # Update user profile completion status
    user = artist.user
    user.profile_complete = True
    user.save()

    data = {
        "artist_id": artist.artist_id,
        "onboarding_complete": True,
        "self_published": artist.self_published,
        "royalty_collection_method": artist.royalty_collection_method,
        "publisher_relationship_status": artist.publisher_relationship_status,
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def set_self_published_status_view(request):
    """Explicitly set artist self-published status"""
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', "")
    self_published = request.data.get('self_published', True)

    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']

    try:
        artist = Artist.objects.get(artist_id=artist_id, user=request.user)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found or access denied.']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Update self-published status and related fields
    artist.update_publisher_relationship(
        publisher=None if self_published else artist.publisher,
        relationship_type='independent' if self_published else 'signed'
    )

    data = {
        "artist_id": artist.artist_id,
        "self_published": artist.self_published,
        "royalty_collection_method": artist.royalty_collection_method,
        "publisher_relationship_status": artist.publisher_relationship_status,
    }

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def upload_kyc_documents_view(request):
    """Enhanced KYC document upload with proper file handling and security"""
    from accounts.services.file_upload_service import FileUploadService
    from accounts.models import AuditLog
    
    payload = {}
    data = {}
    errors = {}

    user = request.user
    document_type = request.data.get('document_type', '')
    document_file = request.FILES.get('document_file')
    notes = request.data.get('notes', '')

    # Validate required fields
    if not document_type:
        errors['document_type'] = ['Document type is required.']
    if not document_file:
        errors['document_file'] = ['Document file is required.']

    if errors:
        payload['message'] = "Validation errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Upload document using the service
        kyc_document = FileUploadService.upload_kyc_document(
            user=user,
            document_type=document_type,
            file=document_file,
            notes=notes
        )
        
        # Log the upload action
        AuditLog.objects.create(
            user=user,
            action='kyc_document_upload',
            resource_type='KYCDocument',
            resource_id=str(kyc_document.id),
            request_data={
                'document_type': document_type,
                'filename': kyc_document.original_filename,
                'file_size': kyc_document.file_size
            }
        )
        
        data = {
            "document_id": kyc_document.id,
            "document_type": document_type,
            "document_type_display": kyc_document.get_document_type_display(),
            "status": kyc_document.status,
            "original_filename": kyc_document.original_filename,
            "file_size": kyc_document.file_size,
            "uploaded_at": kyc_document.uploaded_at,
            "kyc_status": user.kyc_status,
        }

        payload['message'] = "Document uploaded successfully"
        payload['data'] = data
        return Response(payload, status=status.HTTP_201_CREATED)
        
    except ValidationError as e:
        errors['file'] = e.messages if hasattr(e, 'messages') else [str(e)]
        payload['message'] = "File validation failed"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        payload['message'] = "Upload failed"
        payload['errors'] = {'general': [str(e)]}
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_kyc_documents_view(request):
    """Get all KYC documents for the authenticated user"""
    from accounts.services.file_upload_service import FileUploadService
    
    try:
        user = request.user
        documents_data = FileUploadService.get_user_documents(user)
        
        payload = {
            'message': 'Documents retrieved successfully',
            'data': documents_data
        }
        return Response(payload, status=status.HTTP_200_OK)
        
    except Exception as e:
        payload = {
            'message': 'Failed to retrieve documents',
            'errors': {'general': [str(e)]}
        }
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_kyc_document_view(request, document_id):
    """Delete a KYC document (only if not approved)"""
    from accounts.services.file_upload_service import FileUploadService
    
    try:
        user = request.user
        success = FileUploadService.delete_document(user, document_id)
        
        if success:
            # Log the deletion
            AuditLog.objects.create(
                user=user,
                action='kyc_document_delete',
                resource_type='KYCDocument',
                resource_id=str(document_id)
            )
            
            payload = {
                'message': 'Document deleted successfully'
            }
            return Response(payload, status=status.HTTP_200_OK)
        else:
            payload = {
                'message': 'Document not found or cannot be deleted',
                'errors': {'document': ['Document not found or already approved']}
            }
            return Response(payload, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        payload = {
            'message': 'Failed to delete document',
            'errors': {'general': [str(e)]}
        }
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def download_kyc_document_view(request, document_id):
    """Download a KYC document with enhanced access control"""
    from accounts.services.file_access_service import FileAccessService
    from django.core.exceptions import PermissionDenied
    from django.http import Http404
    
    try:
        user = request.user
        token = request.GET.get('token')  # Optional secure token
        
        # Use the secure file access service
        response = FileAccessService.serve_secure_file(user, document_id, token)
        return response
        
    except Http404 as e:
        payload = {
            'message': 'Document not found',
            'errors': {'document': [str(e)]}
        }
        return Response(payload, status=status.HTTP_404_NOT_FOUND)
        
    except PermissionDenied as e:
        payload = {
            'message': 'Access denied',
            'errors': {'permission': [str(e)]}
        }
        return Response(payload, status=status.HTTP_403_FORBIDDEN)
        
    except Exception as e:
        payload = {
            'message': 'Failed to download document',
            'errors': {'general': [str(e)]}
        }
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_secure_download_url_view(request, document_id):
    """Get a secure download URL for a KYC document"""
    from accounts.services.file_access_service import FileAccessService
    from django.core.exceptions import PermissionDenied
    from django.http import Http404
    
    try:
        user = request.user
        
        # Generate secure download URL
        download_info = FileAccessService.get_secure_download_url(user, document_id)
        
        payload = {
            'message': 'Secure download URL generated successfully',
            'data': download_info
        }
        return Response(payload, status=status.HTTP_200_OK)
        
    except Http404 as e:
        payload = {
            'message': 'Document not found',
            'errors': {'document': [str(e)]}
        }
        return Response(payload, status=status.HTTP_404_NOT_FOUND)
        
    except PermissionDenied as e:
        payload = {
            'message': 'Access denied',
            'errors': {'permission': [str(e)]}
        }
        return Response(payload, status=status.HTTP_403_FORBIDDEN)
        
    except Exception as e:
        payload = {
            'message': 'Failed to generate download URL',
            'errors': {'general': [str(e)]}
        }
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def secure_download_view(request, document_id):
    """Secure file download with token verification"""
    from accounts.services.file_access_service import FileAccessService
    from django.core.exceptions import PermissionDenied
    from django.http import Http404
    
    try:
        user = request.user
        token = request.GET.get('token')
        
        if not token:
            payload = {
                'message': 'Access token required',
                'errors': {'token': ['Token parameter is required']}
            }
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        # Use the secure file access service with token verification
        response = FileAccessService.serve_secure_file(user, document_id, token)
        return response
        
    except Http404 as e:
        payload = {
            'message': 'Document not found',
            'errors': {'document': [str(e)]}
        }
        return Response(payload, status=status.HTTP_404_NOT_FOUND)
        
    except PermissionDenied as e:
        payload = {
            'message': 'Access denied',
            'errors': {'permission': [str(e)]}
        }
        return Response(payload, status=status.HTTP_403_FORBIDDEN)
        
    except Exception as e:
        payload = {
            'message': 'Failed to download file',
            'errors': {'general': [str(e)]}
        }
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def calculate_profile_completion_percentage(artist):
    """Calculate profile completion percentage"""
    total_fields = 6  # profile, social, payment, publisher, kyc, track
    completed_fields = 0

    if artist.profile_completed:
        completed_fields += 1
    if artist.social_media_added:
        completed_fields += 1
    if artist.payment_info_added:
        completed_fields += 1
    if artist.publisher_added or artist.self_published:
        completed_fields += 1
    if artist.user.kyc_status in ['verified', 'uploaded']:
        completed_fields += 1
    if artist.track_uploaded:
        completed_fields += 1

    return round((completed_fields / total_fields) * 100)


def get_next_recommended_step(artist):
    """Get the next recommended step for the artist"""
    if not artist.profile_completed:
        return 'profile'
    elif artist.user.kyc_status == 'pending':
        return 'kyc'
    elif not artist.social_media_added:
        return 'social-media'
    elif not artist.payment_info_added:
        return 'payment'
    elif not artist.publisher_added and not artist.self_published:
        return 'publisher'
    elif not artist.track_uploaded:
        return 'track'
    return 'done'


def get_required_fields_status(artist):
    """Get status of required fields for profile completion"""
    user = artist.user
    
    return {
        'basic_info': {
            'completed': bool(user.first_name and user.last_name and artist.stage_name),
            'fields': ['first_name', 'last_name', 'stage_name']
        },
        'profile_details': {
            'completed': bool(artist.bio and artist.country and user.photo),
            'fields': ['bio', 'country', 'photo']
        },
        'contact_info': {
            'completed': bool(user.email and user.phone),
            'fields': ['email', 'phone']
        },
        'kyc_verification': {
            'completed': user.kyc_status in ['verified', 'uploaded'],
            'status': user.kyc_status,
            'required_documents': ['id_card', 'utility_bill']
        },
        'payment_info': {
            'completed': bool(artist.momo_account or artist.bank_account),
            'fields': ['momo_account', 'bank_account']
        }
    }