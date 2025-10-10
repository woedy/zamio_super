#!/usr/bin/env python3
"""
Test script for Staff Management API endpoints
Run this from the zamio_backend directory
"""

import os
import sys
import django
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
import json

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

User = get_user_model()

def test_staff_management_endpoints():
    """Test all staff management endpoints"""
    
    print("Testing Staff Management API Endpoints...")
    
    # Create test client
    client = Client()
    
    # Create or get admin user for testing
    admin_user, created = User.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_admin': True
        }
    )
    if created:
        admin_user.set_password('testpass123')
    admin_user.admin = True
    admin_user.save()
    
    # Create auth token
    from rest_framework.authtoken.models import Token
    token, created = Token.objects.get_or_create(user=admin_user)
    
    # Set authorization header
    headers = {'HTTP_AUTHORIZATION': f'Token {token.key}'}
    
    print(f"Created admin user: {admin_user.email}")
    print(f"Auth token: {token.key}")
    
    # Test 1: Staff Overview
    print("\n1. Testing Staff Overview...")
    response = client.get('/accounts/admin/staff-overview/', **headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
    else:
        print(f"Error: {response.content}")
    
    # Test 2: Get All Staff
    print("\n2. Testing Get All Staff...")
    response = client.get('/accounts/admin/all-staff/', **headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Staff count: {len(data.get('staff', []))}")
        print(f"Pagination: {data.get('pagination', {})}")
    else:
        print(f"Error: {response.content}")
    
    # Test 3: Get Available Permissions
    print("\n3. Testing Available Permissions...")
    response = client.get('/accounts/admin/available-permissions/', **headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Available permissions: {len(data.get('permissions', []))}")
        for perm in data.get('permissions', [])[:3]:  # Show first 3
            print(f"  - {perm['permission']}: {perm['description']}")
    else:
        print(f"Error: {response.content}")
    
    # Test 4: Create Staff Member
    print("\n4. Testing Create Staff Member...")
    create_data = {
        'email': 'newstaff@test.com',
        'first_name': 'New',
        'last_name': 'Staff',
        'password': 'newpass123',
        'user_type': 'Admin',
        'is_staff': True,
        'is_admin': False,
        'permissions': ['manage_users', 'view_analytics']
    }
    response = client.post(
        '/accounts/admin/create-staff/',
        data=json.dumps(create_data),
        content_type='application/json',
        **headers
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"Created staff ID: {data.get('staff_id')}")
        new_staff_id = data.get('staff_id')
    else:
        print(f"Error: {response.content}")
        new_staff_id = None
    
    # Test 5: Get Staff Details
    if new_staff_id:
        print(f"\n5. Testing Get Staff Details for ID: {new_staff_id}...")
        response = client.get(f'/accounts/admin/staff-details/{new_staff_id}/', **headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Staff: {data.get('first_name')} {data.get('last_name')}")
            print(f"Permissions: {len(data.get('permissions', []))}")
        else:
            print(f"Error: {response.content}")
    
    # Test 6: Update Staff Member
    if new_staff_id:
        print(f"\n6. Testing Update Staff Member for ID: {new_staff_id}...")
        update_data = {
            'first_name': 'Updated',
            'permissions': ['manage_users', 'view_analytics', 'manage_staff']
        }
        response = client.put(
            f'/accounts/admin/update-staff/{new_staff_id}/',
            data=json.dumps(update_data),
            content_type='application/json',
            **headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Staff member updated successfully")
        else:
            print(f"Error: {response.content}")
    
    # Test 7: Get Staff Activity Log
    if new_staff_id:
        print(f"\n7. Testing Staff Activity Log for ID: {new_staff_id}...")
        response = client.get(f'/accounts/admin/staff-activity-log/{new_staff_id}/', **headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Activity entries: {len(data.get('activities', []))}")
        else:
            print(f"Error: {response.content}")
    
    print("\n✅ Staff Management API testing completed!")
    
    # Cleanup
    print("\nCleaning up test data...")
    User.objects.filter(email='newstaff@test.com').delete()
    print("Test data cleaned up.")

if __name__ == '__main__':
    test_staff_management_endpoints()