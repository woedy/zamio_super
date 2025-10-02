"""
API views for email-related operations.

This module demonstrates how to use the email task system in API endpoints.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from accounts.email_utils import (
    send_verification_email,
    send_password_reset_email,
    send_invitation_email,
    send_notification_to_users,
    send_notification_to_user_types,
    send_welcome_email,
    send_account_verification_complete_email
)

User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
    """
    Resend email verification to the current user.
    
    Requirements: 1.1 - Email verification queued using Celery
    """
    user = request.user
    
    if user.email_verified:
        return Response({
            'error': 'Email is already verified'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        task_id = send_verification_email(user)
        
        return Response({
            'message': 'Verification email sent successfully',
            'task_id': task_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to send verification email: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([])
def resend_verification_email_by_email(request):
    """
    Resend email verification by email address (for users not logged in).
    
    Requirements: 1.1 - Email verification queued using Celery
    """
    email = request.data.get('email', '').lower()
    
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email, is_active=True)
        
        if user.email_verified:
            return Response({
                'message': 'Email is already verified'
            }, status=status.HTTP_200_OK)
        
        task_id = send_verification_email(user)
        
        return Response({
            'message': 'Verification email sent successfully',
            'task_id': task_id
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Return success to prevent email enumeration
        return Response({
            'message': 'If an account with this email exists, a verification email has been sent'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Failed to send verification email'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def request_password_reset(request):
    """
    Request password reset email.
    
    Requirements: 1.2 - Password reset tokens processed as background tasks
    """
    email = request.data.get('email')
    
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email, is_active=True)
        task_id = send_password_reset_email(user)
        
        # Always return success to prevent email enumeration
        return Response({
            'message': 'If an account with this email exists, a password reset link has been sent',
            'task_id': task_id
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Return the same message to prevent email enumeration
        return Response({
            'message': 'If an account with this email exists, a password reset link has been sent'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Failed to process password reset request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_user_invitation(request):
    """
    Send invitation email to a new user.
    
    Requirements: 1.3 - User invites handled asynchronously via Celery
    """
    invitee_email = request.data.get('email')
    user_type = request.data.get('user_type', 'Artist')
    
    if not invitee_email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already exists
    if User.objects.filter(email=invitee_email).exists():
        return Response({
            'error': 'User with this email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate user type
    valid_user_types = ['Artist', 'Station', 'Publisher', 'Admin']
    if user_type not in valid_user_types:
        return Response({
            'error': f'Invalid user type. Must be one of: {", ".join(valid_user_types)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        task_id = send_invitation_email(
            inviter=request.user,
            invitee_email=invitee_email,
            user_type=user_type
        )
        
        return Response({
            'message': f'Invitation sent to {invitee_email}',
            'task_id': task_id,
            'user_type': user_type
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to send invitation: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_notification_to_specific_users(request):
    """
    Send notification email to specific users.
    
    Requirements: 1.4 - Email notifications queued for background processing
    """
    user_ids = request.data.get('user_ids', [])
    subject = request.data.get('subject', '')
    message = request.data.get('message', '')
    email_type = request.data.get('email_type', 'notification')
    
    if not user_ids:
        return Response({
            'error': 'user_ids is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not subject or not message:
        return Response({
            'error': 'subject and message are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        task_id = send_notification_to_users(
            user_ids=user_ids,
            subject=subject,
            message=message,
            email_type=email_type
        )
        
        return Response({
            'message': f'Notification queued for {len(user_ids)} users',
            'task_id': task_id,
            'user_count': len(user_ids)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to queue notification: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_notification_to_user_type(request):
    """
    Send notification email to users of specific types.
    
    Requirements: 1.5 - Proper queuing for notification email tasks
    """
    user_types = request.data.get('user_types', [])
    subject = request.data.get('subject', '')
    message = request.data.get('message', '')
    email_type = request.data.get('email_type', 'notification')
    
    if not user_types:
        return Response({
            'error': 'user_types is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not subject or not message:
        return Response({
            'error': 'subject and message are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate user types
    valid_user_types = ['Artist', 'Station', 'Publisher', 'Admin']
    invalid_types = [ut for ut in user_types if ut not in valid_user_types]
    if invalid_types:
        return Response({
            'error': f'Invalid user types: {", ".join(invalid_types)}. Valid types: {", ".join(valid_user_types)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        task_ids = send_notification_to_user_types(
            user_types=user_types,
            subject=subject,
            message=message,
            email_type=email_type
        )
        
        return Response({
            'message': f'Notifications queued for user types: {", ".join(user_types)}',
            'task_ids': task_ids,
            'user_types': user_types
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to queue notifications: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_welcome_email_to_user(request):
    """
    Send welcome email to a user (typically called after successful registration).
    """
    user_id = request.data.get('user_id')
    
    if not user_id:
        # Send to current user if no user_id provided
        user = request.user
    else:
        # Only admins can send welcome emails to other users
        if not request.user.is_staff:
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, id=user_id)
    
    try:
        task_id = send_welcome_email(user)
        
        return Response({
            'message': f'Welcome email sent to {user.email}',
            'task_id': task_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to send welcome email: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_email_verified(request):
    """
    Mark user's email as verified and send confirmation email.
    """
    user = request.user
    verification_token = request.data.get('token')
    
    if not verification_token:
        return Response({
            'error': 'Verification token is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # In a real implementation, you would validate the token here
    # For this example, we'll just check if it matches the stored token
    if user.email_token != verification_token:
        return Response({
            'error': 'Invalid verification token'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Mark email as verified
        user.email_verified = True
        user.email_token = None  # Clear the token
        user.save(update_fields=['email_verified', 'email_token'])
        
        # Send confirmation email
        task_id = send_account_verification_complete_email(user)
        
        return Response({
            'message': 'Email verified successfully',
            'task_id': task_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to verify email: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def email_system_status(request):
    """
    Get email system configuration status.
    """
    from accounts.email_utils import validate_email_configuration
    
    try:
        config_status = validate_email_configuration()
        
        return Response({
            'email_system_status': config_status,
            'message': 'Email system status retrieved successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to get email system status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)