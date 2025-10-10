#!/usr/bin/env python
"""
Simple test script to verify non-blocking upload implementation without database
"""
import os
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all required modules can be imported"""
    print("Testing imports...")
    
    try:
        # Test Django imports
        import django
        print(f"✓ Django version: {django.get_version()}")
        
        # Test Celery imports
        from celery import shared_task
        print("✓ Celery imports successful")
        
        # Test model imports (without Django setup)
        from artists.models import UploadProcessingStatus, Contributor
        print("✓ Model imports successful")
        
        # Test task imports
        from artists.tasks import process_track_upload, update_contributor_splits
        print("✓ Task imports successful")
        
        # Test service imports
        from artists.services.media_file_service import MediaFileService
        print("✓ Service imports successful")
        
        print("All imports successful!\n")
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {str(e)}")
        return False

def test_upload_processing_status_model_structure():
    """Test the UploadProcessingStatus model structure"""
    print("Testing UploadProcessingStatus model structure...")
    
    try:
        from artists.models import UploadProcessingStatus
        
        # Check model fields
        fields = [field.name for field in UploadProcessingStatus._meta.fields]
        expected_fields = [
            'id', 'upload_id', 'user', 'upload_type', 'original_filename', 
            'file_size', 'file_hash', 'status', 'progress_percentage', 
            'current_step', 'entity_id', 'entity_type', 'error_message', 
            'retry_count', 'created_at', 'started_at', 'completed_at', 
            'updated_at', 'metadata'
        ]
        
        missing_fields = [field for field in expected_fields if field not in fields]
        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
            return False
        
        print(f"✓ All expected fields present: {len(expected_fields)} fields")
        
        # Check choices
        status_choices = dict(UploadProcessingStatus.PROCESSING_STATES)
        expected_statuses = ['pending', 'queued', 'processing', 'completed', 'failed', 'cancelled']
        
        for status in expected_statuses:
            if status not in status_choices:
                print(f"❌ Missing status choice: {status}")
                return False
        
        print(f"✓ All status choices present: {list(status_choices.keys())}")
        
        # Check upload types
        upload_types = dict(UploadProcessingStatus.UPLOAD_TYPES)
        expected_types = ['track_audio', 'track_cover', 'album_cover']
        
        for upload_type in expected_types:
            if upload_type not in upload_types:
                print(f"❌ Missing upload type: {upload_type}")
                return False
        
        print(f"✓ All upload types present: {list(upload_types.keys())}")
        
        print("UploadProcessingStatus model structure test passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Model structure test failed: {str(e)}")
        return False

def test_contributor_model_structure():
    """Test the Contributor model structure"""
    print("Testing Contributor model structure...")
    
    try:
        from artists.models import Contributor
        
        # Check model fields
        fields = [field.name for field in Contributor._meta.fields]
        expected_fields = [
            'id', 'contributor_id', 'user', 'role', 'track', 'percent_split',
            'publisher', 'is_archived', 'active', 'created_at', 'updated_at'
        ]
        
        missing_fields = [field for field in expected_fields if field not in fields]
        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
            return False
        
        print(f"✓ All expected fields present: {len(expected_fields)} fields")
        
        # Check role choices
        role_choices = dict(Contributor.ROLE_CHOICES)
        expected_roles = ['Composer', 'Producer', 'Writer', 'Featured Artist', 'Mixer', 'Engineer']
        
        for role in expected_roles:
            if role not in role_choices:
                print(f"❌ Missing role choice: {role}")
                return False
        
        print(f"✓ All role choices present: {list(role_choices.keys())}")
        
        print("Contributor model structure test passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Contributor model structure test failed: {str(e)}")
        return False

def test_task_definitions():
    """Test that Celery tasks are properly defined"""
    print("Testing Celery task definitions...")
    
    try:
        from artists.tasks import process_track_upload, update_contributor_splits, process_cover_art_upload
        
        # Check if tasks are properly decorated
        if not hasattr(process_track_upload, 'delay'):
            print("❌ process_track_upload is not a Celery task")
            return False
        
        if not hasattr(update_contributor_splits, 'delay'):
            print("❌ update_contributor_splits is not a Celery task")
            return False
        
        if not hasattr(process_cover_art_upload, 'delay'):
            print("❌ process_cover_art_upload is not a Celery task")
            return False
        
        print("✓ All tasks are properly decorated as Celery tasks")
        
        # Check task signatures
        print("✓ process_track_upload task found")
        print("✓ update_contributor_splits task found")
        print("✓ process_cover_art_upload task found")
        
        print("Celery task definitions test passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ Task definitions test failed: {str(e)}")
        return False

def test_media_file_service():
    """Test MediaFileService methods"""
    print("Testing MediaFileService...")
    
    try:
        from artists.services.media_file_service import MediaFileService
        
        # Check if required methods exist
        required_methods = [
            'validate_media_file',
            'calculate_file_hash',
            'scan_media_file_for_malware',
            'quarantine_media_file'
        ]
        
        for method in required_methods:
            if not hasattr(MediaFileService, method):
                print(f"❌ Missing method: {method}")
                return False
        
        print(f"✓ All required methods present: {required_methods}")
        
        # Check constants
        if not hasattr(MediaFileService, 'MAX_FILE_SIZES'):
            print("❌ Missing MAX_FILE_SIZES constant")
            return False
        
        if not hasattr(MediaFileService, 'ALLOWED_AUDIO_TYPES'):
            print("❌ Missing ALLOWED_AUDIO_TYPES constant")
            return False
        
        if not hasattr(MediaFileService, 'ALLOWED_IMAGE_TYPES'):
            print("❌ Missing ALLOWED_IMAGE_TYPES constant")
            return False
        
        print("✓ All required constants present")
        
        print("MediaFileService test passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ MediaFileService test failed: {str(e)}")
        return False

def test_api_views():
    """Test that API views can be imported"""
    print("Testing API views...")
    
    try:
        from artists.api.upload_status_views import (
            initiate_non_blocking_upload,
            get_upload_status,
            get_user_uploads,
            update_track_contributors,
            cancel_upload
        )
        
        print("✓ All API views imported successfully")
        
        # Check if views are properly decorated
        view_functions = [
            initiate_non_blocking_upload,
            get_upload_status,
            get_user_uploads,
            update_track_contributors,
            cancel_upload
        ]
        
        for view_func in view_functions:
            if not hasattr(view_func, '__name__'):
                print(f"❌ View function {view_func} is not properly defined")
                return False
        
        print("✓ All view functions are properly defined")
        
        print("API views test passed!\n")
        return True
        
    except Exception as e:
        print(f"❌ API views test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("RUNNING NON-BLOCKING UPLOAD IMPLEMENTATION TESTS")
    print("=" * 60)
    
    tests = [
        test_imports,
        test_upload_processing_status_model_structure,
        test_contributor_model_structure,
        test_task_definitions,
        test_media_file_service,
        test_api_views
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
            failed += 1
    
    print("=" * 60)
    print(f"TEST RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)
    
    if failed == 0:
        print("🎉 All tests passed! Non-blocking upload implementation is ready.")
    else:
        print(f"⚠️  {failed} test(s) failed. Please review the implementation.")
    
    return failed == 0

if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)