import os
from celery import Celery
from celery.schedules import crontab
from kombu import Queue

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
app = Celery('core')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Task discovery and registration
# Celery will automatically discover tasks from all installed Django apps
# This prevents circular import issues during Django startup
app.autodiscover_tasks()

# Function to ensure critical tasks are registered
@app.on_after_configure.connect
def ensure_task_registration(sender, **kwargs):
    """Ensure critical tasks are properly registered after Celery configuration."""
    try:
        # Import tasks to ensure they're registered
        from music_monitor.tasks import run_matchcache_to_playlog
        from accounts.tasks import (
            send_email_verification_task,
            send_password_reset_email_task,
            send_user_invitation_email_task,
            send_notification_email_task,
            send_bulk_notification_email_task
        )
        # Import enhanced tasks
        from core.enhanced_tasks import (
            warm_cache_task,
            enhanced_audio_detection_task,
            batch_fingerprint_tracks_task,
            calculate_royalty_distributions_task,
            generate_analytics_report_task,
            cleanup_old_data_task
        )
    except ImportError as e:
        # Log import errors but don't fail startup
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Could not import some tasks during registration check: {e}")

# Enhanced Celery configuration for performance optimization
app.conf.update(
    # Task routing and queues
    task_routes={
        'core.enhanced_tasks.enhanced_audio_detection_task': {'queue': 'critical'},
        'core.enhanced_tasks.batch_fingerprint_tracks_task': {'queue': 'high'},
        'core.enhanced_tasks.calculate_royalty_distributions_task': {'queue': 'normal'},
        'core.enhanced_tasks.generate_analytics_report_task': {'queue': 'analytics'},
        'core.enhanced_tasks.cleanup_old_data_task': {'queue': 'low'},
        'core.enhanced_tasks.warm_cache_task': {'queue': 'low'},
        'music_monitor.tasks.*': {'queue': 'normal'},
        'royalties.tasks.*': {'queue': 'normal'},
        # Email tasks routing
        'accounts.tasks.send_email_verification_task': {'queue': 'high'},
        'accounts.tasks.send_password_reset_email_task': {'queue': 'high'},
        'accounts.tasks.send_user_invitation_email_task': {'queue': 'normal'},
        'accounts.tasks.send_notification_email_task': {'queue': 'normal'},
        'accounts.tasks.send_bulk_notification_email_task': {'queue': 'low'},
    },
    
    # Queue definitions with priorities
    task_queues=(
        Queue('critical', routing_key='critical', priority=10),
        Queue('high', routing_key='high', priority=8),
        Queue('normal', routing_key='normal', priority=5),
        Queue('analytics', routing_key='analytics', priority=3),
        Queue('low', routing_key='low', priority=1),
    ),
    
    # Performance optimizations
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_reject_on_worker_lost=True,
    
    # Result backend configuration
    result_expires=3600,  # 1 hour
    result_persistent=True,
    
    # Task execution settings
    task_soft_time_limit=300,  # 5 minutes
    task_time_limit=600,       # 10 minutes
    
    # Monitoring and logging
    worker_send_task_events=True,
    task_send_sent_event=True,
    
    # Serialization
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    
    # Timezone
    timezone='UTC',
    enable_utc=True,
)

# Enhanced beat schedule with performance monitoring
CELERY_BEAT_SCHEDULE = {
    # Existing tasks
    'convert-matches-every-2-minutes': {
        'task': 'music_monitor.tasks.run_matchcache_to_playlog',
        'schedule': crontab(minute='*/2'),
        'options': {'queue': 'normal'}
    },
    'scan-station-streams-every-2-minutes': {
        'task': 'music_monitor.scan_station_streams',
        'schedule': crontab(minute='*/2'),
        'options': {'queue': 'normal'}
    },
    
    # New enhanced tasks
    'auto-fingerprint-new-tracks': {
        'task': 'music_monitor.auto_fingerprint_new_tracks',
        'schedule': crontab(minute='*/10'),  # every 10 minutes
        'options': {'queue': 'high'}
    },
    'cleanup-old-fingerprints': {
        'task': 'music_monitor.cleanup_old_fingerprints',
        'schedule': crontab(hour=2, minute=0),  # daily at 2 AM
        'options': {'queue': 'low'}
    },
    'update-pro-mappings': {
        'task': 'music_monitor.batch_update_pro_mappings',
        'schedule': crontab(hour=1, minute=0),  # daily at 1 AM
        'options': {'queue': 'normal'}
    },
    'warm-cache-hourly': {
        'task': 'core.enhanced_tasks.warm_cache_task',
        'schedule': crontab(minute=0),  # every hour at minute 0
        'options': {'queue': 'low'}
    },
}

app.conf.beat_schedule = CELERY_BEAT_SCHEDULE
