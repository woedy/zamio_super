"""
Tests for existing verification endpoints to ensure backward compatibility.

This test suite verifies that existing verification endpoints continue to work
after the email verification enhancement implementation.

Requirements: Backward compatibility validation
"""

from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

User = get_user_model()


class SimpleUserFactory:
    """Simple user factory without external dependencies."""
    
    @staticmethod
    def create(**kwargs):
        defaults = {
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'user_type': 'Artist',
            'is_active': True,
            'email_verified': False
        }
        defaults.update(kwargs)
        
        user = User.objects.create_user(
            email=defaults['email'],
            first_name=defaults['first_name'],
            last_name=defaults['last_name'],
            password='testpass123'
        )
        
        # Set additional fields
        for key, value in defaults.items():
            if hasattr(user, key) and key not in ['email', 'first_name', 'last_name']:
                setattr(user, key, value)
        
        user.save()
        return user


class ExistingVerificationEndpointsTestCase(APITestCase):
    """
    Test cases for existing verification endpoints.
    
    Requirements: 10.1, 10.2, 5.3 - Backward compatibility
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = SimpleUserFactory.create(
            email='test@example.com',
            email_verified=False,
            is_active=False,
            user_type='Artist'
        )
    
    def test_existing_artist_verification_endpoint(self):
        """Test that existing artist verification endpoint still works."""
        # Set up user with email token (legacy style)
        token = "legacy-verification-token"
        self.user.email_token = token
        self.user.save()
        
        url = reverse('accounts:verify_artist_email')
        data = {
            'email': self.user.email,
            'email_token': token
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should work with existing endpoint
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('message'), 'Successful')
        
        # Check user is verified
        self.user.refresh_from_db()
        self.assertTrue(self.user.email_verified)
        self.assertTrue(self.user.is_active)
    
    def test_existing_artist_verification_invalid_token(self):
        """Test existing endpoint with invalid token."""
        # Set up user with email token
        self.user.email_token = "correct-token"
        self.user.save()
        
        url = reverse('accounts:verify_artist_email')
        data = {
            'email': self.user.email,
            'email_token': 'wrong-token'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should fail appropriately
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Check user is still not verified
        self.user.refresh_from_db()
        self.assertFalse(self.user.email_verified)
    
    def test_existing_artist_verification_missing_token(self):
        """Test existing endpoint with missing token."""
        url = reverse('accounts:verify_artist_email')
        data = {
            'email': self.user.email,
            # Missing email_token
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should fail with validation error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_existing_artist_verification_nonexistent_user(self):
        """Test existing endpoint with non-existent user."""
        url = reverse('accounts:verify_artist_email')
        data = {
            'email': 'nonexistent@example.com',
            'email_token': 'some-token'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should fail appropriately
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ExistingPasswordResetEndpointsTestCase(APITestCase):
    """
    Test cases for existing password reset endpoints.
    
    Requirements: Backward compatibility for password reset
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = SimpleUserFactory.create(email='test@example.com')
    
    @patch('accounts.email_utils.send_password_reset_email')
    def test_existing_password_reset_request(self, mock_send_email):
        """Test that existing password reset request endpoint works."""
        mock_send_email.return_value = 'task-id-123'
        
        # Test the existing PasswordResetView
        url = reverse('accounts:password_reset')
        data = {
            'email': self.user.email
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should work with existing endpoint
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('message'), 'Successful')
        self.assertIn('email', response.data.get('data', {}))
    
    def test_existing_password_reset_nonexistent_user(self):
        """Test existing password reset with non-existent user."""
        url = reverse('accounts:password_reset')
        data = {
            'email': 'nonexistent@example.com'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should fail appropriately
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_existing_otp_confirmation_endpoint(self):
        """Test that existing OTP confirmation endpoint works."""
        # Set up user with OTP code (legacy style)
        otp_code = "123456"
        self.user.otp_code = otp_code
        self.user.save()
        
        url = reverse('accounts:confirm_otp_password')
        data = {
            'email': self.user.email,
            'otp_code': otp_code
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should work with existing endpoint
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('message'), 'Successful')
    
    def test_existing_otp_confirmation_invalid_code(self):
        """Test existing OTP confirmation with invalid code."""
        # Set up user with OTP code
        self.user.otp_code = "123456"
        self.user.save()
        
        url = reverse('accounts:confirm_otp_password')
        data = {
            'email': self.user.email,
            'otp_code': '654321'  # Wrong code
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should fail appropriately
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    @patch('accounts.email_utils.send_password_reset_email')
    def test_existing_resend_password_otp(self, mock_send_email):
        """Test that existing resend password OTP endpoint works."""
        mock_send_email.return_value = 'task-id-123'
        
        url = reverse('accounts:resend_password_otp')
        data = {
            'email': self.user.email
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should work with existing endpoint
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Password reset OTP sent successfully', response.data.get('message', ''))


class EnhancedVerificationEndpointsTestCase(APITestCase):
    """
    Test cases for enhanced verification endpoints.
    
    Requirements: New verification endpoints functionality
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = SimpleUserFactory.create(
            email='test@example.com',
            email_verified=False,
            is_active=False
        )
    
    def test_verify_password_reset_code_endpoint(self):
        """Test the new password reset code verification endpoint."""
        # Set up user with reset code
        code = "1234"
        import hashlib
        self.user.reset_code = code
        self.user.reset_code_hash = hashlib.sha256(code.encode()).hexdigest()
        self.user.reset_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.reset_attempts = 0
        self.user.save()
        
        url = reverse('accounts:verify_password_reset_code')
        data = {
            'email': self.user.email,
            'code': code,
            'new_password': 'NewSecurePass123!',
            'new_password2': 'NewSecurePass123!'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should work with new endpoint
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('message'), 'Success')
        
        # Check password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewSecurePass123!'))
    
    def test_verify_password_reset_token_endpoint(self):
        """Test the new password reset token verification endpoint."""
        # Set up user with reset token
        token = "test-reset-token"
        self.user.reset_token = token
        self.user.reset_expires_at = timezone.now() + timedelta(minutes=15)
        self.user.save()
        
        url = reverse('accounts:verify_password_reset_token')
        data = {
            'email': self.user.email,
            'token': token,
            'new_password': 'NewSecurePass123!',
            'new_password2': 'NewSecurePass123!'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should work with new endpoint
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('message'), 'Success')
        
        # Check password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewSecurePass123!'))
    
    @patch('accounts.services.EmailVerificationService.can_resend')
    @patch('accounts.email_utils.send_verification_email')
    def test_resend_verification_email_endpoint(self, mock_send_email, mock_can_resend):
        """Test the enhanced resend verification email endpoint."""
        mock_can_resend.return_value = {
            'can_resend': True,
            'resend_count': 0,
            'max_resends': 3,
            'remaining_resends': 3
        }
        mock_send_email.return_value = 'task-id-123'
        
        self.client.force_authenticate(user=self.user)
        
        url = reverse('accounts:resend_verification_email')
        data = {'method': 'code'}
        
        response = self.client.post(url, data, format='json')
        
        # Should work with enhanced endpoint
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['method'], 'code')
    
    @patch('accounts.services.PasswordResetService.create_reset_request')
    def test_request_password_reset_endpoint(self, mock_create_request):
        """Test the enhanced password reset request endpoint."""
        mock_create_request.return_value = {
            'status': 'success',
            'method': 'code',
            'task_id': 'task-id-123'
        }
        
        url = reverse('accounts:request_password_reset')
        data = {
            'email': self.user.email,
            'method': 'code'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should work with enhanced endpoint
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['method'], 'code')


# Test runner configuration for this specific test file
if __name__ == '__main__':
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    django.setup()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['tests.test_existing_verification_endpoints'])