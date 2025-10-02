#!/usr/bin/env python
"""
Test script to verify email tasks are properly configured and can be imported.

This script can be run to validate the email task system implementation.
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_task_imports():
    """Test that all email tasks can be imported successfully."""
    print("Testing task imports...")
    
    try:
        from accounts.tasks import (
            send_email_verification_task,
            send_password_reset_email_task,
            send_user_invitation_email_task,
            send_notification_email_task,
            send_bulk_notification_email_task
        )
        print("✓ All email tasks imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Failed to import tasks: {e}")
        return False

def test_utility_imports():
    """Test that email utility functions can be imported."""
    print("Testing utility imports...")
    
    try:
        from accounts.email_utils import (
            send_verification_email,
            send_password_reset_email,
            send_invitation_email,
            send_notification_to_users,
            validate_email_configuration
        )
        print("✓ All email utilities imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Failed to import utilities: {e}")
        return False

def test_celery_registration():
    """Test that tasks are registered with Celery."""
    print("Testing Celery task registration...")
    
    try:
        from core.celery import app
        
        # Get registered tasks
        registered_tasks = list(app.tasks.keys())
        
        # Check for our email tasks
        expected_tasks = [
            'accounts.tasks.send_email_verification_task',
            'accounts.tasks.send_password_reset_email_task',
            'accounts.tasks.send_user_invitation_email_task',
            'accounts.tasks.send_notification_email_task',
            'accounts.tasks.send_bulk_notification_email_task'
        ]
        
        missing_tasks = []
        for task in expected_tasks:
            if task not in registered_tasks:
                missing_tasks.append(task)
        
        if missing_tasks:
            print(f"✗ Missing tasks in Celery registry: {missing_tasks}")
            return False
        else:
            print("✓ All email tasks registered with Celery")
            return True
            
    except Exception as e:
        print(f"✗ Failed to check Celery registration: {e}")
        return False

def test_email_configuration():
    """Test email configuration."""
    print("Testing email configuration...")
    
    try:
        from accounts.email_utils import validate_email_configuration
        
        config_status = validate_email_configuration()
        
        print(f"  Email backend configured: {config_status['email_backend_configured']}")
        print(f"  Default from email set: {config_status['default_from_email_set']}")
        print(f"  SMTP configured: {config_status['smtp_configured']}")
        print(f"  File backend configured: {config_status['file_backend_configured']}")
        
        if config_status['email_backend_configured']:
            print("✓ Email configuration appears valid")
            return True
        else:
            print("✗ Email configuration incomplete")
            return False
            
    except Exception as e:
        print(f"✗ Failed to validate email configuration: {e}")
        return False

def test_template_existence():
    """Test that email templates exist."""
    print("Testing email template existence...")
    
    try:
        from django.template.loader import get_template
        
        templates = [
            'emails/email_verification.html',
            'emails/email_verification.txt',
            'emails/password_reset.html',
            'emails/password_reset.txt',
            'emails/user_invitation.html',
            'emails/user_invitation.txt',
            'emails/notification.html',
            'emails/notification.txt',
            'emails/welcome.html',
            'emails/welcome.txt'
        ]
        
        missing_templates = []
        for template in templates:
            try:
                get_template(template)
            except Exception:
                missing_templates.append(template)
        
        if missing_templates:
            print(f"✗ Missing templates: {missing_templates}")
            return False
        else:
            print("✓ All email templates found")
            return True
            
    except Exception as e:
        print(f"✗ Failed to check templates: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 50)
    print("ZamIO Email Task System Validation")
    print("=" * 50)
    
    tests = [
        test_task_imports,
        test_utility_imports,
        test_celery_registration,
        test_email_configuration,
        test_template_existence
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"✗ Test {test.__name__} failed with exception: {e}")
            results.append(False)
        print()
    
    print("=" * 50)
    print("Test Summary:")
    print(f"Passed: {sum(results)}/{len(results)}")
    
    if all(results):
        print("✓ All tests passed! Email task system is properly configured.")
        return 0
    else:
        print("✗ Some tests failed. Please check the configuration.")
        return 1

if __name__ == '__main__':
    sys.exit(main())