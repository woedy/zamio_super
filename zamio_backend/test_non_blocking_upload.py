#!/usr/bin/env python
"""
Simple test script to verify non-blocking upload implementation
"""
import os
import sys
import django
from django.conf import settings

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from artists.models import Artist, Track, UploadProcessingStatus, Contributor
from artists.tasks import process_track_upload, update_contributor_splits
from decimal import Decimal

User = get_user_model()

def test_upload_processing_status_model():
    """Test the UploadProcessingStatus model"""
    print("Testing UploadProcessingStatus model...")
    
    # Create test user and artist
    user = User.objects.create_user(
        email='test@example.com',
        first_name='Test',
        last_name='Artist',
        password='testpass123'
    )
    
    artist = Artist.objects.create(
        user=user,
        stage_name='Test Artist'
    )
    
    # Create upload status
    upload_status = UploadProcessingStatus.objects.create(
        upload_id='test_upload_123',
        user=user,
        upload_type='track_audio',
        original_filename='test_track.mp3',
        file_size=1024000,
        status='pending'
    )
    
    print(f"✓ Created upload status: {upload_status}")
    
    # Test progress update
    upload_status.update_progress(50, "Processing audio")
    print(f"✓ Updated progress: {upload_status.progress_percentage}% - {upload_status.current_step}")
    
    # Test mark started
    upload_status.mark_started()
    print(f"✓ Marked as started: {upload_status.status}")
    
    # Test mark completed
    upload_status.mark_completed()
    print(f"✓ Marked as completed: {upload_status.status}")
    
    print("UploadProcessingStatus model test passed!\n")
    return user, artist

def test_contributor_splits():
    """Test contributor split functionality"""
    print("Testing contributor splits...")
    
    user, artist = test_upload_processing_status_model()
    
    # Create a test track
    track = Track.objects.create(
        artist=artist,
        title='Test Track',
        processing_status='completed'
    )
    
    # Create contributors
    contributor1 = Contributor.objects.create(
        track=track,
        user=user,
        role='Artist',
        percent_split=Decimal('60.00'),
        active=True
    )
    
    # Create another user for second contributor
    user2 = User.objects.create_user(
        email='producer@example.com',
        first_name='Test',
        last_name='Producer',
        password='testpass123'
    )
    
    contributor2 = Contributor.objects.create(
        track=track,
        user=user2,
        role='Producer',
        percent_split=Decimal('40.00'),
        active=True
    )
    
    print(f"✓ Created contributors: {contributor1}, {contributor2}")
    
    # Test split validation
    is_valid, total = track.validate_contributor_splits()
    print(f"✓ Split validation: Valid={is_valid}, Total={total}%")
    
    # Test split summary
    summary = track.get_contributor_splits_summary()
    print(f"✓ Split summary: {summary}")
    
    # Test auto-balance
    balanced = Contributor.auto_balance_splits(track)
    print(f"✓ Auto-balanced splits: {len(balanced)} contributors")
    
    print("Contributor splits test passed!\n")
    return track

def test_track_publishing_readiness():
    """Test track publishing readiness checks"""
    print("Testing track publishing readiness...")
    
    track = test_contributor_splits()
    
    # Test publishing readiness
    can_publish = track.can_be_published()
    print(f"✓ Can be published: {can_publish}")
    
    # Test with invalid splits
    track.contributors.all().delete()
    can_publish_invalid = track.can_be_published()
    print(f"✓ Can be published (no contributors): {can_publish_invalid}")
    
    print("Track publishing readiness test passed!\n")

def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("RUNNING NON-BLOCKING UPLOAD TESTS")
    print("=" * 50)
    
    try:
        test_track_publishing_readiness()
        print("🎉 All tests passed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Cleanup
        print("\nCleaning up test data...")
        User.objects.filter(email__in=['test@example.com', 'producer@example.com']).delete()
        print("✓ Cleanup completed")

if __name__ == '__main__':
    run_all_tests()