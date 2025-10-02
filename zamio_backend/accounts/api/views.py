"""
Enhanced Authentication and Session Management Views
Implements comprehensive logout, session cleanup, audit logging, and error handling
"""

import uuid
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
try:
    from rest_framework_simplejwt.tokens import RefreshToken
    from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False

from accounts.models import AuditLog, UserPermission
from activities.models import AllActivity

User = get_user_model()


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def create_audit_log(user, action, resource_type=None, resource_id=None, 
                    request_data=None, response_data=None, status_code=None,
                    ip_address=None, user_agent=None, trace_id=None):
    """Create comprehensive audit log entry"""
    try:
        AuditLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type or 'authentication',
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            request_data=request_data or {},
            response_data=response_data or {},
            status_code=status_code,
            trace_id=trace_id or uuid.uuid4()
        )
    except Exception as e:
        # Log audit creation failure but don't break the main flow
        print(f"Failed to create audit log: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def logout_view(request):
    """
    Enhanced logout endpoint with comprehensive session cleanup and audit logging
    Supports both Token and JWT authentication
    """
    payload = {}
    data = {}
    errors = {}
    
    # Extract request metadata
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    trace_id = uuid.uuid4()
    
    try:
        with transaction.atomic():
            user = request.user
            
            # Validate user is active
            if not user.is_active:
                errors['user'] = ['Account is deactivated']
                payload['message'] = 'Error'
                payload['errors'] = errors
                
                create_audit_log(
                    user=user,
                    action='logout_failed',
                    request_data={'reason': 'account_deactivated'},
                    response_data={'error': 'account_deactivated'},
                    status_code=400,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    trace_id=trace_id
                )
                
                return Response(payload, status=status.HTTP_400_BAD_REQUEST)
            
            # Session cleanup operations
            cleanup_results = {
                'token_invalidated': False,
                'jwt_blacklisted': False,
                'fcm_cleared': False,
                'session_data_cleared': False
            }
            
            # 1. Invalidate DRF Token
            try:
                token = Token.objects.get(user=user)
                token.delete()
                cleanup_results['token_invalidated'] = True
            except Token.DoesNotExist:
                pass  # Token already deleted or doesn't exist
            
            # 2. Blacklist JWT tokens if using JWT
            jwt_token = request.data.get('refresh_token')
            if jwt_token and JWT_AVAILABLE:
                try:
                    refresh_token = RefreshToken(jwt_token)
                    refresh_token.blacklist()
                    cleanup_results['jwt_blacklisted'] = True
                except Exception as e:
                    # Log JWT blacklist failure but continue
                    create_audit_log(
                        user=user,
                        action='jwt_blacklist_failed',
                        request_data={'error': str(e)},
                        ip_address=ip_address,
                        user_agent=user_agent,
                        trace_id=trace_id
                    )
            
            # 3. Clear FCM token for security
            if user.fcm_token:
                user.fcm_token = None
                cleanup_results['fcm_cleared'] = True
            
            # 4. Clear sensitive session data
            user.otp_code = None
            user.email_token = None
            user.last_activity = timezone.now()
            user.save(update_fields=['fcm_token', 'otp_code', 'email_token', 'last_activity'])
            cleanup_results['session_data_cleared'] = True
            
            # 5. Create activity log
            try:
                AllActivity.objects.create(
                    user=user,
                    type="Authentication",
                    subject="User Logout",
                    body=f"{user.email} successfully logged out from {ip_address}"
                )
            except Exception as e:
                # Log activity creation failure but continue
                print(f"Failed to create activity log: {str(e)}")
            
            # Prepare response data
            data = {
                'message': 'Successfully logged out',
                'user_id': str(user.user_id) if user.user_id else None,
                'email': user.email,
                'logout_timestamp': timezone.now().isoformat(),
                'session_cleanup': cleanup_results,
                'trace_id': str(trace_id)
            }
            
            # Create comprehensive audit log
            create_audit_log(
                user=user,
                action='logout_success',
                resource_id=str(user.user_id) if user.user_id else None,
                request_data={
                    'user_type': user.user_type,
                    'jwt_provided': bool(jwt_token)
                },
                response_data={
                    'success': True,
                    'cleanup_results': cleanup_results
                },
                status_code=200,
                ip_address=ip_address,
                user_agent=user_agent,
                trace_id=trace_id
            )
            
            payload['message'] = 'Successful'
            payload['data'] = data
            
            return Response(payload, status=status.HTTP_200_OK)
            
    except Exception as e:
        # Handle unexpected errors
        error_message = str(e)
        
        create_audit_log(
            user=getattr(request, 'user', None),
            action='logout_error',
            request_data={'error': error_message},
            response_data={'system_error': True},
            status_code=500,
            ip_address=ip_address,
            user_agent=user_agent,
            trace_id=trace_id
        )
        
        return Response({
            'message': 'Error',
            'errors': {'system': ['An unexpected error occurred during logout']},
            'trace_id': str(trace_id)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def invalidate_all_sessions_view(request):
    """
    Invalidate all active sessions for the current user
    Useful for security incidents or when user wants to log out from all devices
    """
    payload = {}
    data = {}
    
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    trace_id = uuid.uuid4()
    
    try:
        with transaction.atomic():
            user = request.user
            
            # Track what was invalidated
            invalidation_results = {
                'tokens_deleted': 0,
                'jwt_tokens_blacklisted': 0,
                'fcm_cleared': False,
                'session_data_cleared': False
            }
            
            # 1. Delete all DRF tokens for this user
            deleted_tokens = Token.objects.filter(user=user).delete()
            invalidation_results['tokens_deleted'] = deleted_tokens[0] if deleted_tokens[0] else 0
            
            # 2. Blacklist all outstanding JWT tokens
            if JWT_AVAILABLE:
                try:
                    outstanding_tokens = OutstandingToken.objects.filter(user=user)
                    for token in outstanding_tokens:
                        if not BlacklistedToken.objects.filter(token=token).exists():
                            BlacklistedToken.objects.create(token=token)
                            invalidation_results['jwt_tokens_blacklisted'] += 1
                except Exception as e:
                    # JWT blacklist might not be available
                    pass
            
            # 3. Clear all session-related data
            user.fcm_token = None
            user.otp_code = None
            user.email_token = None
            user.last_activity = timezone.now()
            user.save(update_fields=['fcm_token', 'otp_code', 'email_token', 'last_activity'])
            
            invalidation_results['fcm_cleared'] = True
            invalidation_results['session_data_cleared'] = True
            
            # Create activity log
            try:
                AllActivity.objects.create(
                    user=user,
                    type="Security",
                    subject="All Sessions Invalidated",
                    body=f"{user.email} invalidated all active sessions from {ip_address}"
                )
            except Exception:
                pass
            
            data = {
                'message': 'All sessions invalidated successfully',
                'user_id': str(user.user_id) if user.user_id else None,
                'invalidation_results': invalidation_results,
                'timestamp': timezone.now().isoformat(),
                'trace_id': str(trace_id)
            }
            
            # Create audit log
            create_audit_log(
                user=user,
                action='invalidate_all_sessions',
                resource_id=str(user.user_id) if user.user_id else None,
                request_data={'initiated_by': 'user'},
                response_data=invalidation_results,
                status_code=200,
                ip_address=ip_address,
                user_agent=user_agent,
                trace_id=trace_id
            )
            
            payload['message'] = 'Successful'
            payload['data'] = data
            
            return Response(payload, status=status.HTTP_200_OK)
            
    except Exception as e:
        create_audit_log(
            user=getattr(request, 'user', None),
            action='invalidate_all_sessions_error',
            request_data={'error': str(e)},
            status_code=500,
            ip_address=ip_address,
            user_agent=user_agent,
            trace_id=trace_id
        )
        
        return Response({
            'message': 'Error',
            'errors': {'system': ['Failed to invalidate sessions']},
            'trace_id': str(trace_id)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def session_status_view(request):
    """
    Get current session status and security information
    """
    payload = {}
    data = {}
    
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    trace_id = uuid.uuid4()
    
    try:
        user = request.user
        
        # Get session information
        session_info = {
            'user_id': str(user.user_id) if user.user_id else None,
            'email': user.email,
            'user_type': user.user_type,
            'is_active': user.is_active,
            'email_verified': user.email_verified,
            'profile_complete': user.profile_complete,
            'kyc_status': user.kyc_status,
            'two_factor_enabled': user.two_factor_enabled,
            'last_activity': user.last_activity.isoformat() if user.last_activity else None,
            'account_locked_until': user.account_locked_until.isoformat() if user.account_locked_until else None,
            'failed_login_attempts': user.failed_login_attempts,
            'current_ip': ip_address,
            'session_valid': True
        }
        
        # Get active tokens count
        active_tokens = Token.objects.filter(user=user).count()
        session_info['active_token_sessions'] = active_tokens
        
        # Get recent login activity (last 10 entries)
        recent_logins = AuditLog.objects.filter(
            user=user,
            action__in=['login_success', 'logout_success', 'login_failed']
        ).order_by('-timestamp')[:10]
        
        session_info['recent_activity'] = [
            {
                'action': log.action,
                'timestamp': log.timestamp.isoformat(),
                'ip_address': log.ip_address,
                'status_code': log.status_code
            }
            for log in recent_logins
        ]
        
        data = session_info
        payload['message'] = 'Successful'
        payload['data'] = data
        
        # Log session status check
        create_audit_log(
            user=user,
            action='session_status_check',
            resource_id=str(user.user_id) if user.user_id else None,
            response_data={'session_valid': True},
            status_code=200,
            ip_address=ip_address,
            user_agent=user_agent,
            trace_id=trace_id
        )
        
        return Response(payload, status=status.HTTP_200_OK)
        
    except Exception as e:
        create_audit_log(
            user=getattr(request, 'user', None),
            action='session_status_error',
            request_data={'error': str(e)},
            status_code=500,
            ip_address=ip_address,
            user_agent=user_agent,
            trace_id=trace_id
        )
        
        return Response({
            'message': 'Error',
            'errors': {'system': ['Failed to retrieve session status']},
            'trace_id': str(trace_id)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def authentication_audit_logs_view(request):
    """
    Get authentication-related audit logs for the current user
    """
    payload = {}
    data = {}
    
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    trace_id = uuid.uuid4()
    
    try:
        user = request.user
        
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 20)), 100)  # Max 100 per page
        
        # Get authentication-related logs
        auth_actions = [
            'login_success', 'login_failed', 'logout_success', 'logout_failed',
            'password_reset', 'password_changed', 'email_verified',
            'two_factor_enabled', 'two_factor_disabled', 'account_locked',
            'session_status_check', 'invalidate_all_sessions'
        ]
        
        logs_queryset = AuditLog.objects.filter(
            user=user,
            action__in=auth_actions
        ).order_by('-timestamp')
        
        # Simple pagination
        start = (page - 1) * per_page
        end = start + per_page
        logs = logs_queryset[start:end]
        total_count = logs_queryset.count()
        
        # Format logs
        formatted_logs = []
        for log in logs:
            formatted_logs.append({
                'id': log.id,
                'action': log.action,
                'timestamp': log.timestamp.isoformat(),
                'ip_address': log.ip_address,
                'user_agent': log.user_agent[:100] if log.user_agent else None,  # Truncate for readability
                'status_code': log.status_code,
                'resource_type': log.resource_type,
                'success': log.status_code and log.status_code < 400
            })
        
        data = {
            'logs': formatted_logs,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page,
                'has_next': end < total_count,
                'has_previous': page > 1
            }
        }
        
        payload['message'] = 'Successful'
        payload['data'] = data
        
        # Log audit access
        create_audit_log(
            user=user,
            action='view_auth_audit_logs',
            resource_id=str(user.user_id) if user.user_id else None,
            request_data={'page': page, 'per_page': per_page},
            response_data={'logs_returned': len(formatted_logs)},
            status_code=200,
            ip_address=ip_address,
            user_agent=user_agent,
            trace_id=trace_id
        )
        
        return Response(payload, status=status.HTTP_200_OK)
        
    except Exception as e:
        create_audit_log(
            user=getattr(request, 'user', None),
            action='view_auth_audit_logs_error',
            request_data={'error': str(e)},
            status_code=500,
            ip_address=ip_address,
            user_agent=user_agent,
            trace_id=trace_id
        )
        
        return Response({
            'message': 'Error',
            'errors': {'system': ['Failed to retrieve audit logs']},
            'trace_id': str(trace_id)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)