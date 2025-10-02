#!/usr/bin/env python
"""
Verification script for Celery task registration
Run this script to verify that all tasks are properly registered
"""
import os
import sys
import subprocess

def run_celery_inspect():
    """Run celery inspect registered command to check task registration"""
    try:
        print("Running 'celery -A core inspect registered' to check task registration...")
        result = subprocess.run(
            ['celery', '-A', 'core', 'inspect', 'registered'],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            output = result.stdout
            if 'music_monitor.tasks.run_matchcache_to_playlog' in output:
                print("✅ SUCCESS: run_matchcache_to_playlog task is registered!")
                return True
            else:
                print("❌ ERROR: run_matchcache_to_playlog task is NOT registered!")
                print("Registered tasks output:")
                print(output)
                return False
        else:
            print(f"❌ ERROR: Celery inspect command failed with return code {result.returncode}")
            print(f"Error output: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ ERROR: Celery inspect command timed out")
        return False
    except FileNotFoundError:
        print("❌ ERROR: Celery command not found. Make sure Celery is installed and in PATH")
        return False
    except Exception as e:
        print(f"❌ ERROR: Unexpected error running celery inspect: {e}")
        return False

def check_task_definition():
    """Check if the task is properly defined in the code"""
    try:
        with open('music_monitor/tasks.py', 'r') as f:
            content = f.read()
        
        checks = [
            ('Task function definition', 'def run_matchcache_to_playlog'),
            ('Task decorator', '@shared_task(name=\'music_monitor.tasks.run_matchcache_to_playlog\')'),
            ('MatchCache query', 'MatchCache.objects.filter'),
            ('PlayLog creation', 'PlayLog.objects.create'),
            ('Transaction usage', 'transaction.atomic'),
        ]
        
        all_passed = True
        for check_name, check_string in checks:
            if check_string in content:
                print(f"✅ {check_name}: Found")
            else:
                print(f"❌ {check_name}: NOT found")
                all_passed = False
        
        return all_passed
        
    except FileNotFoundError:
        print("❌ ERROR: music_monitor/tasks.py file not found")
        return False
    except Exception as e:
        print(f"❌ ERROR: Error reading tasks file: {e}")
        return False

def check_celery_config():
    """Check if Celery configuration is correct"""
    try:
        with open('core/celery.py', 'r') as f:
            content = f.read()
        
        checks = [
            ('Task import', 'run_matchcache_to_playlog'),
            ('Beat schedule entry', 'convert-matches-every-2-minutes'),
            ('Beat schedule task', 'music_monitor.tasks.run_matchcache_to_playlog'),
            ('Beat schedule timing', 'crontab(minute=\'*/2\')'),
        ]
        
        all_passed = True
        for check_name, check_string in checks:
            if check_string in content:
                print(f"✅ {check_name}: Found")
            else:
                print(f"❌ {check_name}: NOT found")
                all_passed = False
        
        return all_passed
        
    except FileNotFoundError:
        print("❌ ERROR: core/celery.py file not found")
        return False
    except Exception as e:
        print(f"❌ ERROR: Error reading celery config: {e}")
        return False

def main():
    """Main verification function"""
    print("=== Celery Task Registration Verification ===")
    print()
    
    print("1. Checking task definition...")
    task_def_ok = check_task_definition()
    print()
    
    print("2. Checking Celery configuration...")
    celery_config_ok = check_celery_config()
    print()
    
    print("3. Testing Celery task registration...")
    celery_inspect_ok = run_celery_inspect()
    print()
    
    if task_def_ok and celery_config_ok:
        print("🎉 SUCCESS: Task definition and configuration are correct!")
        
        if celery_inspect_ok:
            print("🎉 SUCCESS: Task is properly registered with Celery!")
            print()
            print("The run_matchcache_to_playlog task is ready to use.")
            print("It will run every 2 minutes as configured in the beat schedule.")
        else:
            print("⚠️  WARNING: Task definition is correct but Celery registration failed.")
            print("This might be due to:")
            print("- Celery worker not running")
            print("- Missing dependencies")
            print("- Database connection issues")
            print()
            print("To start Celery worker and beat scheduler:")
            print("1. celery -A core worker --loglevel=info")
            print("2. celery -A core beat --loglevel=info")
    else:
        print("❌ FAILURE: Task definition or configuration has issues.")
        print("Please check the errors above and fix them.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())