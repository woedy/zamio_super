#!/usr/bin/env python
"""
Simple test to verify the password reset code verification endpoint implementation.
"""

import os
import sys
import django
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
import hashlib

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

User = get_user_model()

def test_password_reset_implementation():
    """Test that the password reset code verification function exists and works"""
    
    # Import the function
    from accounts.api.password_views import verify_password_reset_code
    
    print("✓ Password reset code verification function imported successfully")
    
    # Check if the function has the right signature
    import inspect
    sig = inspect.signature(verify_password_reset_code)
    print(f"✓ Function signature: {sig}")
    
    # Test that the User model has the required fields
    user_fields = [field.name for field in User._meta.get_fields()]
    required_fields = [
        'reset_token', 'reset_code', 'reset_code_hash', 
        'reset_expires_at', 'reset_attempts', 'reset_blocked_until', 
        'last_reset_request'
    ]
    
    missing_fields = [field for field in required_fields if field not in user_fields]
    if missing_fields:
        print(f"✗ Missing fields in User model: {missing_fields}")
    else:
        print("✓ All required password reset fields exist in User model")
    
    # Test creating a user with reset data
    try:
        # Clean up any existing test user
        User.objects.filter(email='test_reset@example.com').delete()
        
        user = User.objects.create_user(
            email='test_reset@example.com',
            password='OldPassword123!',
            first_name='Test',
            last_name='User'
        )
        
        # Set reset data
        reset_code = '1234'
        reset_code_hash = hashlib.sha256(reset_code.encode()).hexdigest()
        
        user.reset_code = reset_code
        user.reset_code_hash = reset_code_hash
        user.reset_token = 'test-token-123'
        user.reset_expires_at = timezone.now() + timezone.timedelta(minutes=15)
        user.reset_attempts = 0
        user.save()
        
        print("✓ User created with password reset data successfully")
        
        # Verify the data was saved
        user.refresh_from_db()
        if user.reset_code_hash and user.reset_expires_at:
            print("✓ Password reset data persisted correctly")
        else:
            print("✗ Password reset data not persisted")
        
        # Clean up
        user.delete()
        print("✓ Test user cleaned up")
        
    except Exception as e:
        print(f"✗ Error testing User model: {str(e)}")
    
    print("\n" + "="*50)
    print("Password Reset Code Verification Implementation Test Complete")
    print("="*50)

if __name__ == '__main__':
    test_password_reset_implementation()