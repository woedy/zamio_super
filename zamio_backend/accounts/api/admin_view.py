from celery import chain
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
from activities.models import AllActivity
from django.core.mail import send_mail
from django.contrib.auth import get_user_model, authenticate

from rest_framework.permissions import AllowAny


from rest_framework.views import APIView

from accounts.api.serializers import UserRegistrationSerializer
from activities.models import AllActivity
from core.tasks import send_generic_email
from core.utils import generate_email_token, is_valid_email, is_valid_password
from mr_admin.models import MrAdmin


User = get_user_model()



@api_view(['POST', ])
@permission_classes([])
@authentication_classes([])
def register_admin_view(request):

    payload = {}
    data = {}
    errors = {}

    if request.method == 'POST':
        email = request.data.get('email', "").lower()
        first_name = request.data.get('first_name', "")
        last_name = request.data.get('last_name', "")
        phone = request.data.get('phone', "")
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
            user.phone = phone
            user.user_type = "Admin"
            user.admin = True  # Set admin flag
            user.staff = True  # Set staff flag
            user.save()

            data["user_id"] = user.user_id
            data["email"] = user.email
            data["first_name"] = user.first_name
            data["last_name"] = user.last_name
            data["photo"] = getattr(user.photo, 'url', None)

            # Initialize admin profile with required non-null fields
            admin_profile = MrAdmin.objects.create(
                user=user,
                city='',
                postal_code='',
            )
            admin_profile.save()

            # Log admin registration
            AuditLog.objects.create(
                user=None,  # System action during registration
                action='admin_registered',
                resource_type='user',
                resource_id=str(user.user_id),
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                request_data={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone': phone
                },
                response_data={
                    'success': True,
                    'user_id': str(user.user_id),
                    'admin_id': str(admin_profile.admin_id),
                    'user_type': 'Admin',
                    'admin_flag': True,
                    'staff_flag': True
                },
                status_code=201
            )

            data['phone'] = user.phone
            data['photo'] = getattr(user.photo, 'url', None)

        token = Token.objects.get(user=user).key
        data['token'] = token

        email_token = generate_email_token()

        user = User.objects.get(email=email)
        user.email_token = email_token
        user.save()

        context = {
            'email_token': email_token,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
#
        txt_ = get_template("registration/emails/verify.txt").render(context)
        html_ = get_template("registration/emails/verify.html").render(context)
#
        subject = 'EMAIL CONFIRMATION CODE'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user.email]



        # # Use Celery chain to execute tasks in sequence
        # email_chain = chain(
        #     send_generic_email.si(subject, txt_, from_email, recipient_list, html_),
        # )
        # # Execute the Celery chain asynchronously
        # email_chain.apply_async()

        send_mail(
            subject,
            txt_,
            from_email,
            recipient_list,
            html_message=html_,
            fail_silently=False,
        )


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





def check_email_exist(email):

    qs = User.objects.filter(email=email)
    if qs.exists():
        return True
    else:
        return False


class AdminLogin(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        payload = {}
        data = {}
        errors = {}

        # Get client IP for audit logging
        ip_address = self.get_client_ip(request)

        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')
        fcm_token = request.data.get('fcm_token', '')

        if not email:
            errors['email'] = ['Email is required.']

        if not password:
            errors['password'] = ['Password is required.']

        if not fcm_token:
            errors['fcm_token'] = ['FCM device token is required.']

        try:
            qs = User.objects.filter(email=email)
        except User.DoesNotExist:
            errors['email'] = ['User does not exist.']

        if qs.exists():
            not_active = qs.filter(email_verified=False)
            if not_active:
                errors['email'] = ["Please check your email to confirm your account or resend confirmation email."]

        try:
            admin = MrAdmin.objects.get(user__email=email)
        except:
            errors['email'] = ['User is not an Admin']

        if not check_password(email, password):
            errors['password'] = ['Invalid Credentials']

        user = authenticate(email=email, password=password)

        if not user:
            errors['email'] = ['Invalid Credentials']

        if errors:
            payload['message'] = "Errors"
            payload['errors'] = errors
            
            # Log failed admin login attempt
            AuditLog.objects.create(
                user=user if user else None,
                action='admin_login_failed',
                resource_type='authentication',
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                request_data={'email': email, 'errors': list(errors.keys())},
                response_data={'error': 'authentication_failed'},
                status_code=400
            )
            
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = Token.objects.get(user=user)
        except Token.DoesNotExist:
            token = Token.objects.create(user=user)

        user.fcm_token = fcm_token
        user.last_activity = timezone.now()
        user.failed_login_attempts = 0  # Reset failed attempts on successful login
        user.save()

        data["user_id"] = user.user_id
        data["admin_id"] = admin.admin_id
        data["email"] = user.email
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data["photo"] = getattr(user.photo, 'url', None)
        data["country"] = user.country
        data["phone"] = user.phone
        data["token"] = token.key
        needs_profile = not (admin.city and admin.postal_code)
        data["next_step"] = 'profile' if needs_profile else 'done'
        data["profile"] = {
            'address': admin.address,
            'city': admin.city,
            'postal_code': admin.postal_code,
            'active': admin.active,
        }

        payload['message'] = "Successful"
        payload['data'] = data

        # Create activity log
        new_activity = AllActivity.objects.create(
            user=user,
            subject="Admin Login",
            body=user.email + " Just logged in."
        )

        # Log successful admin login
        AuditLog.objects.create(
            user=user,
            action='admin_login_success',
            resource_type='authentication',
            resource_id=str(admin.admin_id),
            ip_address=ip_address,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            request_data={'email': email},
            response_data={'success': True, 'admin_id': str(admin.admin_id)},
            status_code=200
        )

        return Response(payload, status=status.HTTP_200_OK)

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





@api_view(['POST', ])
@permission_classes([AllowAny])
@authentication_classes([])
def resend_email_verification(request):
    payload = {}
    data = {}
    errors = {}
    email_errors = []


    email = request.data.get('email', '').lower()

    if not email:
        email_errors.append('Email is required.')
    if email_errors:
        errors['email'] = email_errors
        payload['message'] = "Error"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_404_NOT_FOUND)

    qs = User.objects.filter(email=email)
    if not qs.exists():
        email_errors.append('Email does not exist.')
        if email_errors:
            errors['email'] = email_errors
            payload['message'] = "Error"
            payload['errors'] = errors
            return Response(payload, status=status.HTTP_404_NOT_FOUND)

    user = User.objects.filter(email=email).first()
    otp_code = generate_email_token()
    user.email_token = otp_code
    user.save()



     ##### SEND SMS

    # _msg = f'Your Weekend Chef OTP code is {otp_code}'
    # url = f"https://apps.mnotify.net/smsapi"
    # api_key = settings.MNOTIFY_KEY  # Replace with your actual API key
    # print(api_key)
    # response = requests.post(url,
    # data={
    #     "key": api_key,
    #     "to": user.phone,
    #     "msg": _msg,
    #     "sender_id": settings.MNOTIFY_SENDER_ID,
    #     })
    # if response.status_code == 200:
    #     print('##########################')
    #     print(response.content)
    #     payload['message'] = "Successful"
    # else:
    #     errors['user_id'] = ['Failed to send SMS']
    #     ######################


    context = {
        'email_token': otp_code,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name
    }
#
    txt_ = get_template("registration/emails/verify.txt").render(context)
    html_ = get_template("registration/emails/verify.html").render(context)
#
    subject = 'OTP CODE'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

     # Use Celery chain to execute tasks in sequence
    # email_chain = chain(
    #      send_generic_email.si(subject, txt_, from_email, recipient_list, html_),
    #   )
    #  # Execute the Celery chain asynchronously
    # email_chain.apply_async()

    send_mail(
        subject,
        txt_,
        from_email,
        recipient_list,
        html_message=html_,
        fail_silently=False,
    )

    #data["otp_code"] = otp_code
    data["email"] = user.email
    data["user_id"] = user.user_id

    new_activity = AllActivity.objects.create(
        user=user,
        subject="Email verification sent",
        body="Email verification sent to " + user.email,
    )
    new_activity.save()

    payload['message'] = "Successful"
    payload['data'] = data

    return Response(payload, status=status.HTTP_200_OK)


# ---------- Admin Email Verification ----------
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication


@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def verify_admin_email(request):
    payload = {}
    data = {}
    errors = {}

    email_errors = []
    token_errors = []

    email = request.data.get('email', '').lower()
    email_token = request.data.get('email_token', '')

    if not email:
        email_errors.append('Email is required.')

    qs = User.objects.filter(email=email)
    if not qs.exists():
        email_errors.append('Email does not exist.')

    if email_errors:
        errors['email'] = email_errors

    if not email_token:
        token_errors.append('Token is required.')

    user = None
    if qs.exists():
        user = qs.first()
        if email_token != user.email_token:
            token_errors.append('Invalid Token.')

    if token_errors:
        errors['email_token'] = token_errors

    if email_errors or token_errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = Token.objects.get(user=user)
    except Token.DoesNotExist:
        token = Token.objects.create(user=user)

    user.is_active = True
    user.email_verified = True
    user.save()

    admin = MrAdmin.objects.filter(user=user).first()

    data["user_id"] = user.user_id
    if admin:
        data["admin_id"] = admin.admin_id
    data["email"] = user.email
    data["first_name"] = user.first_name
    data["last_name"] = user.last_name
    data["photo"] = user.photo.url if getattr(user.photo, 'url', None) else None
    data["token"] = token.key
    data["country"] = user.country
    data["phone"] = user.phone

    payload['message'] = "Successful"
    payload['data'] = data

    new_activity = AllActivity.objects.create(
        user=user,
        subject="Verify Email",
        body=user.email + " just verified their email",
    )
    new_activity.save()

    return Response(payload, status=status.HTTP_200_OK)


# ---------- Admin Onboarding ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def admin_onboarding_status_view(request):
    payload = {}
    data = {}

    user = request.user
    admin = MrAdmin.objects.filter(user=user).first()
    if not admin:
        return Response({
            'message': 'Errors',
            'errors': {'admin': ['Admin profile not found.']}
        }, status=status.HTTP_404_NOT_FOUND)

    # Determine next step: require city and postal_code at minimum
    needs_profile = not (admin.city and admin.postal_code)
    next_step = 'profile' if needs_profile else 'done'

    data["user_id"] = user.user_id
    data["admin_id"] = admin.admin_id
    data["next_step"] = next_step
    data["profile"] = {
        'address': admin.address,
        'city': admin.city,
        'postal_code': admin.postal_code,
        'active': admin.active,
    }

    payload['message'] = 'Successful'
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def complete_admin_profile_view(request):
    payload = {}
    data = {}
    errors = {}

    address = request.data.get('address', '')
    city = request.data.get('city', '')
    postal_code = request.data.get('postal_code', '')

    if not city:
        errors['city'] = ['City is required.']
    if not postal_code:
        errors['postal_code'] = ['Postal code is required.']

    admin = MrAdmin.objects.filter(user=request.user).first()
    if not admin:
        errors['admin'] = ['Admin profile not found.']

    if errors:
        payload['message'] = 'Errors'
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    if address:
        admin.address = address
    admin.city = city
    admin.postal_code = postal_code
    admin.active = True
    admin.save()

    data['admin_id'] = admin.admin_id
    data['next_step'] = 'done'
    data['profile'] = {
        'address': admin.address,
        'city': admin.city,
        'postal_code': admin.postal_code,
        'active': admin.active,
    }

    payload['message'] = 'Successful'
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)
