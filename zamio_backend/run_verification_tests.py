#!/usr/bin/env python
"""
Test runner for email verification enhancement tests.

This script runs all tests related to the email verification enhancement system
and provides a comprehensive report of the test results.

Usage:
    python run_verification_tests.py
    
Requirements: All requirements validation for email verification enhancement
"""

import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner
from django.core.management import execute_from_command_line

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def run_verification_tests():
    """Run all email verification enhancement tests."""
    
    print("=" * 80)
    print("EMAIL VERIFICATION ENHANCEMENT TEST SUITE")
    print("=" * 80)
    print()
    
    # Test modules to run
    test_modules = [
        'tests.test_email_verification_enhancement',
        'tests.test_verification_api_endpoints',
    ]
    
    print("Running the following test modules:")
    for module in test_modules:
        print(f"  - {module}")
    print()
    
    # Get the Django test runner
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=False, keepdb=False)
    
    # Run the tests
    print("Starting test execution...")
    print("-" * 80)
    
    failures = test_runner.run_tests(test_modules)
    
    print("-" * 80)
    print()
    
    if failures:
        print(f"❌ TESTS FAILED: {failures} test(s) failed")
        print()
        print("Please review the test output above to identify and fix the issues.")
        return False
    else:
        print("✅ ALL TESTS PASSED!")
        print()
        print("The email verification enhancement system is working correctly.")
        print()
        print("Test Coverage Summary:")
        print("- ✅ Code verification endpoints")
        print("- ✅ Email template generation with both methods")
        print("- ✅ Resend functionality and rate limiting")
        print("- ✅ Backward compatibility with existing token system")
        print("- ✅ Password reset enhancements")
        print("- ✅ Security measures and error handling")
        return True

def run_specific_test_class(test_class):
    """Run a specific test class."""
    
    print(f"Running specific test class: {test_class}")
    print("-" * 80)
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=False, keepdb=False)
    
    failures = test_runner.run_tests([test_class])
    
    if failures:
        print(f"❌ Test class {test_class} failed: {failures} test(s) failed")
        return False
    else:
        print(f"✅ Test class {test_class} passed!")
        return True

def run_individual_tests():
    """Run individual test categories for debugging."""
    
    test_classes = [
        'tests.test_email_verification_enhancement.EmailVerificationServiceTestCase',
        'tests.test_email_verification_enhancement.PasswordResetServiceTestCase',
        'tests.test_email_verification_enhancement.EmailTemplateTestCase',
        'tests.test_email_verification_enhancement.SecurityAndRateLimitingTestCase',
        'tests.test_verification_api_endpoints.EmailVerificationAPITestCase',
        'tests.test_verification_api_endpoints.PasswordResetAPITestCase',
        'tests.test_verification_api_endpoints.BackwardCompatibilityAPITestCase',
        'tests.test_verification_api_endpoints.IntegrationTestCase',
    ]
    
    print("Running individual test classes...")
    print("=" * 80)
    
    results = {}
    
    for test_class in test_classes:
        print(f"\n🧪 Testing: {test_class.split('.')[-1]}")
        print("-" * 40)
        
        success = run_specific_test_class(test_class)
        results[test_class] = success
    
    print("\n" + "=" * 80)
    print("INDIVIDUAL TEST RESULTS SUMMARY")
    print("=" * 80)
    
    passed = 0
    failed = 0
    
    for test_class, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        class_name = test_class.split('.')[-1]
        print(f"{status:10} {class_name}")
        
        if success:
            passed += 1
        else:
            failed += 1
    
    print("-" * 80)
    print(f"Total: {passed} passed, {failed} failed")
    
    return failed == 0

def main():
    """Main test runner function."""
    
    if len(sys.argv) > 1:
        if sys.argv[1] == '--individual':
            return run_individual_tests()
        elif sys.argv[1] == '--class':
            if len(sys.argv) > 2:
                return run_specific_test_class(sys.argv[2])
            else:
                print("Error: --class requires a test class name")
                return False
        elif sys.argv[1] == '--help':
            print("Email Verification Enhancement Test Runner")
            print()
            print("Usage:")
            print("  python run_verification_tests.py              # Run all tests")
            print("  python run_verification_tests.py --individual # Run tests by class")
            print("  python run_verification_tests.py --class <name> # Run specific class")
            print("  python run_verification_tests.py --help       # Show this help")
            return True
    
    return run_verification_tests()

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)