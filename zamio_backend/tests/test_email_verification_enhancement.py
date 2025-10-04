"""
Comprehensive tests for the email verification enhancement system.

This test suite covers:
- Code verification endpoints
- Email template generation with both methods
- Resend functionality and rate limiting
- Backward compatibility with existing token system
- Password reset enhancements
- Security measures and error handling

Requirements: All requirements validation for email verification enhancement
"""

import hashlib
import json
from datetime import timedelta
from unittest.mock import patch, Mock

from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core import mail
from django.template.loader import render_to_string
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from accounts.services import EmailVerificationService, PasswordResetService
from accounts.models import AuditLog
from tests.factories import UserFactory, ArtistUserFactory

User = get_user_model()


class EmailVerificationServiceTestCase(TestCase):
    """
    Test cases for EmailVerificationService class.
    
    Requirements: 3.4, 5.2, 5.3, 12.1, 12.2, 12.3
    """
    
    def setUp(self):
        self.service = EmailVerificationService()
        self.user = UserFactory(
            email='test@example.com',
            email_verified=False,
            is_active=False
        )
    
    def test_hash_verification_code(self):
        """Test that verification codes are properly hashed."""
        code = "1234"
        hashed = self.service.hash_verification_code(code)
        
        # Should be SHA-256 hash
        expected_hash = hashlib.sha256(code.encode()).hexdigest()
        self.assertEqual(hashed, expected_hash)
        
        # Different codes should produce different hashes
        different_hash = self.service.hash_verification_code("5678")
        self.assertNotEqual(hashed, different_hash)
    
    def test_verify_code_success(self):
        """Test successful code verification."""
        # Set up user with verification code
        code = "1234"
        self.user.verification_code = code
        self.user.verification_code_hash = self.service.hash_verification_code(code)
        self.user.verification_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.verification_attempts = 0
        self.user.save()
        
        result = self.service.verify_code(
            email=self.user.email,
            code=code,
            ip_address='127.0.0.1'
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['status_code'], status.HTTP_200_OK)
        self.assertIn('Email verified successfully', result['message'])
        
        # Check user is now verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)
        self.assertTrue(self.user.is_active)
        self.assertIsNone(self.user.verification_code)
        self.assertIsNone(self.user.verification_code_hash)
        
        # Check audit log was created
        audit_log = AuditLog.objects.filter(
            user=self.user,
            action='email_verified_by_code'
        ).first()
        self.assertIsNotNone(audit_log)
    
    def test_verify_code_invalid_code(self):
        """Test verification with invalid code."""
        # Set up user with verification code
        correct_code = "1234"
        self.user.verification_code = correct_code
        self.user.verification_code_hash = self.service.hash_verification_code(correct_code)
        self.user.verification_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.verification_attempts = 0
        self.user.save()
        
        result = self.service.verify_code(
            email=self.user.email,
            code="5678",  # Wrong code
            ip_address='127.0.0.1'
        )
        
        self.assertFalse(result['success'])
        self.assertEqual(result['error_code'], 'INVALID_CODE')
        self.assertEqual(result['status_code'], status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid verification code', result['message'])
        
        # Check user is still not verified
        self.user.refresh_from_db()
        self.assertFalse(self.user.email_verified)
        self.assertEqual(self.user.verification_attempts, 1)
    
    def test_verify_code_expired(self):
        """Test verification with expired code."""
        code = "1234"
        self.user.verification_code = code
        self.user.verification_code_hash = self.service.hash_verification_code(code)
        self.user.verification_expires_at = timezone.now() - timedelta(minutes=1)  # Expired
        self.user.save()
        
        result = self.service.verify_code(
            email=self.user.email,
            code=code,
            ip_address='127.0.0.1'
        )
        
        self.assertFalse(result['success'])
        self.assertEqual(result['error_code'], 'CODE_EXPIRED')
        self.assertIn('expired', result['message'])
    
    def test_verify_code_max_attempts_exceeded(self):
        """Test verification blocked after max attempts."""
        code = "1234"
        self.user.verification_code = code
        self.user.verification_code_hash = self.service.hash_verification_code(code)
        self.user.verification_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.verification_attempts = 5  # At max attempts
        self.user.save()
        
        result = self.service.verify_code(
            email=self.user.email,
            code="wrong",  # Wrong code to trigger blocking
            ip_address='127.0.0.1'
        )
        
        self.assertFalse(result['success'])
        self.assertEqual(result['error_code'], 'MAX_ATTEMPTS_EXCEEDED')
        self.assertEqual(result['status_code'], status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Check user is blocked
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.verification_blocked_until)    

    def test_verify_code_already_verified(self):
        """Test verification when user is already verified."""
        self.user.email_verified = True
        self.user.save()
        
        result = self.service.verify_code(
            email=self.user.email,
            code="1234",
            ip_address='127.0.0.1'
        )
        
        self.assertFalse(result['success'])
        self.assertEqual(result['error_code'], 'ALREADY_VERIFIED')
    
    def test_verify_code_user_not_found(self):
        """Test verification with non-existent user."""
        result = self.service.verify_code(
            email='nonexistent@example.com',
            code="1234",
            ip_address='127.0.0.1'
        )
        
        self.assertFalse(result['success'])
        self.assertEqual(result['error_code'], 'USER_NOT_FOUND')
        self.assertEqual(result['status_code'], status.HTTP_404_NOT_FOUND)
    
    def test_verify_token_success(self):
        """Test successful token verification (backward compatibility)."""
        token = "test-verification-token-123"
        self.user.email_token = token
        self.user.last_verification_request = timezone.now()
        self.user.save()
        
        result = self.service.verify_token(
            email=self.user.email,
            token=token,
            ip_address='127.0.0.1'
        )
        
        self.assertTrue(result['success'])
        self.assertEqual(result['status_code'], status.HTTP_200_OK)
        
        # Check user is now verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)
        self.assertTrue(self.user.is_active)
        self.assertIsNone(self.user.email_token)
        
        # Check audit log was created
        audit_log = AuditLog.objects.filter(
            user=self.user,
            action='email_verified_by_token'
        ).first()
        self.assertIsNotNone(audit_log)
    
    def test_verify_token_invalid_token(self):
        """Test verification with invalid token."""
        self.user.email_token = "correct-token"
        self.user.last_verification_request = timezone.now()
        self.user.save()
        
        result = self.service.verify_token(
            email=self.user.email,
            token="wrong-token",
            ip_address='127.0.0.1'
        )
        
        self.assertFalse(result['success'])
        self.assertEqual(result['error_code'], 'INVALID_TOKEN')
    
    def test_verify_token_expired(self):
        """Test verification with expired token."""
        token = "test-token"
        self.user.email_token = token
        self.user.last_verification_request = timezone.now() - timedelta(hours=2)  # Expired
        self.user.verification_expires_at = timezone.now() - timedelta(minutes=30)
        self.user.save()
        
        result = self.service.verify_token(
            email=self.user.email,
            token=token,
            ip_address='127.0.0.1'
        )
        
        self.assertFalse(result['success'])
        self.assertEqual(result['error_code'], 'TOKEN_EXPIRED')
    
    def test_can_resend_success(self):
        """Test that user can resend when conditions are met."""
        result = self.service.can_resend(self.user)
        
        self.assertTrue(result['can_resend'])
        self.assertEqual(result['resend_count'], 0)
        self.assertEqual(result['max_resends'], 3)
    
    def test_can_resend_blocked_user(self):
        """Test that blocked user cannot resend."""
        self.user.verification_blocked_until = timezone.now() + timedelta(minutes=30)
        self.user.save()
        
        result = self.service.can_resend(self.user)
        
        self.assertFalse(result['can_resend'])
        self.assertEqual(result['reason'], 'blocked')
        self.assertIn('retry_after_seconds', result)
    
    def test_can_resend_cooldown_period(self):
        """Test cooldown period between resends."""
        # Set last request to 1 minute ago (less than 2-minute cooldown)
        self.user.last_verification_request = timezone.now() - timedelta(minutes=1)
        self.user.save()
        
        result = self.service.can_resend(self.user)
        
        self.assertFalse(result['can_resend'])
        self.assertEqual(result['reason'], 'cooldown')
        self.assertIn('cooldown_seconds', result)
    
    @patch('accounts.services.AuditLog.objects.filter')
    def test_can_resend_rate_limit_exceeded(self, mock_filter):
        """Test rate limiting when max resends per hour exceeded."""
        # Mock 3 recent resends in the last hour
        mock_queryset = Mock()
        mock_queryset.count.return_value = 3
        mock_filter.return_value = mock_queryset
        
        result = self.service.can_resend(self.user)
        
        self.assertFalse(result['can_resend'])
        self.assertEqual(result['reason'], 'rate_limit')
        self.assertEqual(result['resend_count'], 3)
        self.assertEqual(result['max_resends'], 3)
    
    @patch('accounts.email_utils.send_verification_email')
    def test_resend_verification_success(self, mock_send_email):
        """Test successful resend verification."""
        mock_send_email.return_value = 'task-id-123'
        
        result = self.service.resend_verification(self.user, method='code')
        
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['method'], 'code')
        self.assertIn('task_id', result)
        
        # Check user method was updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.verification_method, 'code')
        
        # Check audit log was created
        audit_log = AuditLog.objects.filter(
            user=self.user,
            action='verification_resent'
        ).first()
        self.assertIsNotNone(audit_log)
    
    def test_resend_verification_blocked_user(self):
        """Test resend fails for blocked user."""
        self.user.verification_blocked_until = timezone.now() + timedelta(minutes=30)
        self.user.save()
        
        result = self.service.resend_verification(self.user)
        
        self.assertEqual(result['status'], 'error')
        self.assertIn('blocked', result['message'])


class PasswordResetServiceTestCase(TestCase):
    """
    Test cases for PasswordResetService class.
    
    Requirements: 13.1, 13.2, 13.3, 12.1, 12.2
    """
    
    def setUp(self):
        self.service = PasswordResetService()
        self.user = UserFactory(email='test@example.com')
    
    def test_hash_reset_code(self):
        """Test that reset codes are properly hashed."""
        code = "1234"
        hashed = self.service.hash_reset_code(code)
        
        # Should be SHA-256 hash
        expected_hash = hashlib.sha256(code.encode()).hexdigest()
        self.assertEqual(hashed, expected_hash)
    
    @patch('accounts.email_utils.send_password_reset_email')
    def test_create_reset_request_success(self, mock_send_email):
        """Test successful password reset request creation."""
        mock_send_email.return_value = 'task-id-123'
        
        result = self.service.create_reset_request(self.user, method='code')
        
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['method'], 'code')
        self.assertIn('task_id', result)
        
        # Check audit log was created
        audit_log = AuditLog.objects.filter(
            user=self.user,
            action='password_reset_requested'
        ).first()
        self.assertIsNotNone(audit_log)
    
    def test_can_resend_reset_success(self):
        """Test that user can resend reset when conditions are met."""
        result = self.service.can_resend_reset(self.user)
        
        self.assertTrue(result['can_resend'])
        self.assertEqual(result['resend_count'], 0)
        self.assertEqual(result['max_resends'], 3)
    
    def test_can_resend_reset_blocked_user(self):
        """Test that blocked user cannot resend reset."""
        self.user.reset_blocked_until = timezone.now() + timedelta(minutes=30)
        self.user.save()
        
        result = self.service.can_resend_reset(self.user)
        
        self.assertFalse(result['can_resend'])
        self.assertEqual(result['reason'], 'blocked')
    
    def test_can_resend_reset_cooldown_period(self):
        """Test cooldown period between reset resends."""
        # Set last request to 1 minute ago (less than 2-minute cooldown)
        self.user.last_reset_request = timezone.now() - timedelta(minutes=1)
        self.user.save()
        
        result = self.service.can_resend_reset(self.user)
        
        self.assertFalse(result['can_resend'])
        self.assertEqual(result['reason'], 'cooldown')
    
    @patch('accounts.email_utils.send_password_reset_email')
    def test_resend_reset_success(self, mock_send_email):
        """Test successful resend password reset."""
        mock_send_email.return_value = 'task-id-123'
        
        result = self.service.resend_reset(self.user, method='link')
        
        self.assertEqual(result['status'], 'success')
        self.assertEqual(result['method'], 'link')
        self.assertIn('task_id', result)
        
        # Check audit log was created
        audit_log = AuditLog.objects.filter(
            user=self.user,
            action='password_reset_resent'
        ).first()
        self.assertIsNotNone(audit_log)


class EmailTemplateTestCase(TestCase):
    """
    Test cases for email template generation with both methods.
    
    Requirements: 4.1, 4.2, 4.3, 4.4, 13.1
    """
    
    def setUp(self):
        self.user = UserFactory(
            email='test@example.com',
            first_name='John',
            last_name='Doe'
        )
    
    def test_email_verification_template_with_both_methods(self):
        """Test email verification template includes both code and link."""
        context = {
            'user': self.user,
            'verification_code': '123456',
            'verification_url': 'https://example.com/verify?token=abc123',
            'code_expires_minutes': 15,
            'link_expires_minutes': 60,
            'current_year': 2024
        }
        
        # Test HTML template
        html_content = render_to_string('emails/email_verification.html', context)
        
        # Should contain both verification methods
        self.assertIn('123456', html_content)  # Verification code
        self.assertIn('https://example.com/verify?token=abc123', html_content)  # Verification URL
        self.assertIn('Option 1: Verification Code', html_content)
        self.assertIn('Option 2: Verification Link', html_content)
        self.assertIn('15 minutes', html_content)  # Code expiry
        self.assertIn('60 minutes', html_content)  # Link expiry
        self.assertIn('John', html_content)  # User's first name
        
        # Test text template
        text_content = render_to_string('emails/email_verification.txt', context)
        self.assertIn('123456', text_content)
        self.assertIn('https://example.com/verify?token=abc123', text_content)
    
    def test_password_reset_template_with_both_methods(self):
        """Test password reset template includes both code and link."""
        context = {
            'user': self.user,
            'reset_code': '123456',
            'reset_url': 'https://example.com/reset?token=def456',
            'code_expires_minutes': 15,
            'link_expires_minutes': 60,
            'current_year': 2024
        }
        
        # Test HTML template
        html_content = render_to_string('emails/password_reset.html', context)
        
        # Should contain both reset methods
        self.assertIn('123456', html_content)  # Reset code
        self.assertIn('https://example.com/reset?token=def456', html_content)  # Reset URL
        self.assertIn('Option 1: Reset Code', html_content)
        self.assertIn('Option 2: Reset Link', html_content)
        self.assertIn('15 minutes', html_content)  # Code expiry
        self.assertIn('60 minutes', html_content)  # Link expiry
        self.assertIn('John', html_content)  # User's first name
        
        # Test text template
        text_content = render_to_string('emails/password_reset.txt', context)
        self.assertIn('123456', text_content)
        self.assertIn('https://example.com/reset?token=def456', text_content)
    
    def test_email_template_security_notices(self):
        """Test that email templates include proper security notices."""
        context = {
            'user': self.user,
            'verification_code': '123456',
            'verification_url': 'https://example.com/verify?token=abc123',
            'code_expires_minutes': 15,
            'link_expires_minutes': 60,
            'current_year': 2024
        }
        
        html_content = render_to_string('emails/email_verification.html', context)
        
        # Should contain security notice
        self.assertIn('Security Notice', html_content)
        self.assertIn("didn't create an account", html_content)
        self.assertIn('ignore this email', html_content)
    
    def test_password_reset_template_security_warnings(self):
        """Test that password reset template includes security warnings."""
        context = {
            'user': self.user,
            'reset_code': '123456',
            'reset_url': 'https://example.com/reset?token=def456',
            'code_expires_minutes': 15,
            'link_expires_minutes': 60,
            'current_year': 2024
        }
        
        html_content = render_to_string('emails/password_reset.html', context)
        
        # Should contain security warnings
        self.assertIn('Security Notice', html_content)
        self.assertIn("didn't request this password reset", html_content)
        self.assertIn('Important Security Information', html_content)
        self.assertIn('existing sessions will be logged out', html_content)


class SecurityAndRateLimitingTestCase(APITestCase):
    """
    Test cases for security measures and rate limiting.
    
    Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 12.1, 12.2, 12.3
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory(email='test@example.com')
    
    def test_verification_code_hashing(self):
        """Test that verification codes are stored as hashes, not plain text."""
        service = EmailVerificationService()
        code = "1234"
        
        # Set up user with verification code
        self.user.verification_code = code
        self.user.verification_code_hash = service.hash_verification_code(code)
        self.user.save()
        
        # Code should be hashed in database
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.verification_code_hash, code)
        self.assertEqual(len(self.user.verification_code_hash), 64)  # SHA-256 length
    
    def test_rate_limiting_verification_attempts(self):
        """Test rate limiting for verification attempts."""
        service = EmailVerificationService()
        code = "1234"
        
        # Set up user with verification code
        self.user.verification_code = code
        self.user.verification_code_hash = service.hash_verification_code(code)
        self.user.verification_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.verification_attempts = 0
        self.user.save()
        
        # Make 5 failed attempts
        for i in range(5):
            result = service.verify_code(
                email=self.user.email,
                code="wrong",
                ip_address='127.0.0.1'
            )
            self.assertFalse(result['success'])
        
        # 6th attempt should be blocked
        result = service.verify_code(
            email=self.user.email,
            code="wrong",
            ip_address='127.0.0.1'
        )
        
        self.assertEqual(result['error_code'], 'MAX_ATTEMPTS_EXCEEDED')
        self.assertEqual(result['status_code'], status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Check user is blocked
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.verification_blocked_until)
    
    def test_audit_logging_for_verification_events(self):
        """Test that verification events are properly logged."""
        service = EmailVerificationService()
        code = "1234"
        
        # Set up user with verification code
        self.user.verification_code = code
        self.user.verification_code_hash = service.hash_verification_code(code)
        self.user.verification_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.save()
        
        # Successful verification should create audit log
        result = service.verify_code(
            email=self.user.email,
            code=code,
            ip_address='127.0.0.1'
        )
        
        self.assertTrue(result['success'])
        
        # Check audit log was created
        audit_log = AuditLog.objects.filter(
            user=self.user,
            action='email_verified_by_code',
            ip_address='127.0.0.1'
        ).first()
        
        self.assertIsNotNone(audit_log)
        self.assertEqual(audit_log.resource_type, 'verification')
        self.assertEqual(audit_log.status_code, 200)
    
    def test_failed_verification_audit_logging(self):
        """Test that failed verification attempts are logged."""
        service = EmailVerificationService()
        code = "1234"
        
        # Set up user with verification code
        self.user.verification_code = code
        self.user.verification_code_hash = service.hash_verification_code(code)
        self.user.verification_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.save()
        
        # Failed verification should create audit log
        result = service.verify_code(
            email=self.user.email,
            code="wrong",
            ip_address='192.168.1.1'
        )
        
        self.assertFalse(result['success'])
        
        # Check audit log was created
        audit_log = AuditLog.objects.filter(
            user=self.user,
            action='verification_code_failed',
            ip_address='192.168.1.1'
        ).first()
        
        self.assertIsNotNone(audit_log)
        self.assertEqual(audit_log.status_code, 400)
    
    @patch('accounts.services.AuditLog.objects.filter')
    def test_resend_rate_limiting(self, mock_filter):
        """Test rate limiting for resend requests."""
        # Mock 3 recent resends (at limit)
        mock_queryset = Mock()
        mock_queryset.count.return_value = 3
        mock_filter.return_value = mock_queryset
        
        service = EmailVerificationService()
        result = service.can_resend(self.user)
        
        self.assertFalse(result['can_resend'])
        self.assertEqual(result['reason'], 'rate_limit')
        self.assertEqual(result['resend_count'], 3)
        self.assertEqual(result['max_resends'], 3)
    
    def test_cooldown_period_between_resends(self):
        """Test cooldown period enforcement between resends."""
        # Set last request to 1 minute ago (less than 2-minute cooldown)
        self.user.last_verification_request = timezone.now() - timedelta(minutes=1)
        self.user.save()
        
        service = EmailVerificationService()
        result = service.can_resend(self.user)
        
        self.assertFalse(result['can_resend'])
        self.assertEqual(result['reason'], 'cooldown')
        self.assertGreater(result['cooldown_seconds'], 0)
    
    def test_password_reset_security_measures(self):
        """Test security measures for password reset."""
        service = PasswordResetService()
        
        # Test that reset codes are hashed
        code = "1234"
        hashed = service.hash_reset_code(code)
        self.assertNotEqual(hashed, code)
        self.assertEqual(len(hashed), 64)  # SHA-256 length
        
        # Test rate limiting applies to password reset too
        result = service.can_resend_reset(self.user)
        self.assertTrue(result['can_resend'])
        self.assertEqual(result['max_resends'], 3)