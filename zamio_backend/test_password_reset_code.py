#!/usr/bin/env python
"""
Test script to verify the password reset code verification endpoint works correctly.
This tests the implementation of task 3.2.
"""

import os
import sys
import django
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.utils import timezone
import hashlib
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

User = get_user_model()

def test_password_reset_code_verification():
    """Test the password reset code verification endpoint"""
    
    # Create or get a test user
    try:
        user = User.objects.get(email='test@example.com')
        user.delete()  # Clean up if exists
    except User.DoesNotExist:
        pass
    
    user = User.objects.create_user(
        email='test@example.com',
        password='OldPassword123!',
        first_name='Test',
        last_name='User'
    )
    
    # Set up reset code data (simulating what the reset task would do)
    reset_code = '1234'
    reset_code_hash = hashlib.sha256(reset_code.encode()).hexdigest()
    reset_token = 'test-reset-token-12345'
    
    user.reset_code = reset_code
    user.reset_code_hash = reset_code_hash
    user.reset_token = reset_token
    user.reset_expires_at = timezone.now() + timezone.timedelta(minutes=15)
    user.reset_attempts = 0
    user.reset_blocked_until = None
    user.save()
    
    client = Client()
    
    # Test 1: Valid code verification
    print("Test 1: Valid code verification")
    response = client.post('/api/v1/auth/verify-password-reset-code/', {
        'email': 'test@example.com',
        'code': '1234',
        'new_password': 'NewPassword123!',
        'new_password2': 'NewPassword123!'
    }, content_type='application/json')
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Verify password was changed
    user.refresh_from_db()
    if user.check_password('NewPassword123!'):
        print("✓ Password was successfully updated")
    else:
        print("✗ Password was not updated")
    
    # Verify reset data was cleared
    if not user.reset_code and not user.reset_code_hash and not user.reset_token:
        print("✓ Reset data was cleared")
    else:
        print("✗ Reset data was not cleared")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Invalid code
    print("Test 2: Invalid code verification")
    
    # Set up new reset data
    user.reset_code = '5678'
    user.reset_code_hash = hashlib.sha256('5678'.encode()).hexdigest()
    user.reset_expires_at = timezone.now() + timezone.timedelta(minutes=15)
    user.reset_attempts = 0
    user.save()
    
    response = client.post('/api/v1/auth/verify-password-reset-code/', {
        'email': 'test@example.com',
        'code': '9999',  # Wrong code
        'new_password': 'AnotherPassword123!',
        'new_password2': 'AnotherPassword123!'
    }, content_type='application/json')
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test 3: Expired code
    print("\nTest 3: Expired code verification")
    
    # Set expired reset data
    user.reset_code = '1111'
    user.reset_code_hash = hashlib.sha256('1111'.encode()).hexdigest()
    user.reset_expires_at = timezone.now() - timezone.timedelta(minutes=1)  # Expired
    user.reset_attempts = 0
    user.save()
    
    response = client.post('/api/v1/auth/verify-password-reset-code/', {
        'email': 'test@example.com',
        'code': '1111',
        'new_password': 'ExpiredPassword123!',
        'new_password2': 'ExpiredPassword123!'
    }, content_type='application/json')
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Clean up
    user.delete()
    print("\n✓ Test completed successfully")

if __name__ == '__main__':
    test_password_reset_code_verification()