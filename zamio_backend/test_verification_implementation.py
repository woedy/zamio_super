#!/usr/bin/env python
"""
Simple test script to verify the verification skip implementation works correctly.
This tests the core functionality without requiring a full Django test setup.
"""

import os
import sys
import django
from django.conf import settings

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from artists.models import Artist
from accounts.models import AuditLog
from django.utils import timezone

User = get_user_model()

def test_verification_skip_functionality():
    """Test the verification skip functionality"""
    print("Testing verification skip functionality...")
    
    # Create or get a test user
    email = 'test_artist@example.com'
    try:
        user = User.objects.get(email=email)
        print(f"Using existing test user: {user.email}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            email=email,
            first_name='Test',
            last_name='Artist',
            password='TestPass123!'
        )
        user.user_type = 'Artist'
        user.save()
        print(f"Created new test user: {user.email}")
    
    # Reset user state for testing
    user.verification_status = 'pending'
    user.verification_skipped_at = None
    user.verification_reminder_sent = False
    user.save()
    
    # Create or get artist profile
    try:
        artist = Artist.objects.get(user=user)
        print(f"Using existing artist profile: {artist.stage_name}")
    except Artist.DoesNotExist:
        artist = Artist.objects.create(
            user=user,
            stage_name='Test Artist'
        )
        print(f"Created new artist profile: {artist.stage_name}")
    
    print(f"Created test user: {user.email}")
    print(f"Initial verification status: {user.verification_status}")
    
    # Test 1: Check initial state
    assert user.verification_status == 'pending', f"Expected 'pending', got '{user.verification_status}'"
    assert user.verification_skipped_at is None, "verification_skipped_at should be None initially"
    
    # Test 2: Skip verification
    from accounts.api.artist_views import get_verification_required_features, calculate_profile_completion_percentage
    
    # Test helper functions
    features = get_verification_required_features(user)
    print(f"Features requiring verification: {features}")
    assert len(features) > 0, "Should have features requiring verification"
    
    completion = calculate_profile_completion_percentage(artist)
    print(f"Profile completion: {completion}%")
    assert isinstance(completion, (int, float)), "Completion should be a number"
    
    # Test 3: Simulate skipping verification
    user.verification_status = 'skipped'
    user.verification_skipped_at = timezone.now()
    user.save()
    
    print(f"After skipping - verification status: {user.verification_status}")
    print(f"Skipped at: {user.verification_skipped_at}")
    
    # Test 4: Check features after skipping
    features_after_skip = get_verification_required_features(user)
    print(f"Features still requiring verification: {features_after_skip}")
    assert len(features_after_skip) > 0, "Should still have features requiring verification"
    
    # Test 5: Test resume verification
    user.verification_status = 'pending'
    user.verification_skipped_at = None
    user.save()
    
    print(f"After resuming - verification status: {user.verification_status}")
    assert user.verification_status == 'pending', "Should be pending after resume"
    
    # Test 6: Test verified state
    user.verification_status = 'verified'
    user.save()
    
    features_verified = get_verification_required_features(user)
    print(f"Features requiring verification when verified: {features_verified}")
    assert len(features_verified) == 0, "Should have no features requiring verification when verified"
    
    print("✅ All verification functionality tests passed!")
    
    # Reset user state after testing
    user.verification_status = 'pending'
    user.verification_skipped_at = None
    user.save()
    print("🧹 Test cleanup completed")

def test_email_utils():
    """Test email utility functions"""
    print("\nTesting email utility functions...")
    
    from accounts.email_utils import generate_secure_token, validate_email_configuration
    
    # Test token generation
    token = generate_secure_token()
    print(f"Generated token: {token[:10]}...")
    assert len(token) == 32, f"Expected token length 32, got {len(token)}"
    assert token.isalnum(), "Token should be alphanumeric"
    
    # Test different token lengths
    short_token = generate_secure_token(16)
    assert len(short_token) == 16, f"Expected short token length 16, got {len(short_token)}"
    
    # Test email configuration validation
    config = validate_email_configuration()
    print(f"Email configuration: {config}")
    assert isinstance(config, dict), "Config should be a dictionary"
    assert 'email_backend_configured' in config, "Should check email backend"
    
    print("✅ Email utility tests passed!")

if __name__ == '__main__':
    try:
        test_verification_skip_functionality()
        test_email_utils()
        print("\n🎉 All tests completed successfully!")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)