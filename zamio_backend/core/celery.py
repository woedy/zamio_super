import os
from celery import Celery
from celery.schedules import crontab
from kombu import Queue

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
app = Celery('core')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Explicit task imports to prevent KeyError exceptions
# Import all task modules to ensure proper registration
try:
    # Music monitor tasks
    from music_monitor.tasks import (
        run_matchcache_to_playlog,
        scan_single_station_stream,
        scan_station_streams,
        enhanced_fingerprint_track,
        batch_enhanced_fingerprint,
        auto_fingerprint_new_tracks,
        enhanced_audio_detection,
        cleanup_old_fingerprints,
        acrcloud_identify_audio,
        hybrid_audio_detection,
        sync_pro_catalog,
        update_isrc_metadata,
        batch_update_pro_mappings
    )
    print("Successfully imported music_monitor tasks")
    
    # Disputes tasks
    try:
        from disputes.tasks import (
            auto_escalate_old_disputes,
            send_dispute_reminders,
            cleanup_old_notifications,
            generate_dispute_analytics,
            send_email_notifications,
            auto_assign_disputes
        )
        print("Successfully imported disputes tasks")
    except ImportError as e:
        print(f"Warning: Could not import disputes tasks: {e}")
    
    # Analytics tasks
    try:
        from analytics.tasks import (
            generate_analytics_export,
            create_analytics_snapshots,
            update_realtime_metrics,
            cleanup_analytics_data
        )
        print("Successfully imported analytics tasks")
    except ImportError as e:
        print(f"Warning: Could not import analytics tasks: {e}")
    
    # Core enhanced tasks
    try:
        import core.enhanced_tasks
        print("Successfully imported core enhanced tasks")
    except ImportError as e:
        print(f"Warning: Could not import core enhanced tasks: {e}")
    
    # Royalties tasks (if they exist)
    try:
        import royalties.tasks
        print("Successfully imported royalties tasks")
    except ImportError as e:
        print(f"Info: No royalties tasks found: {e}")
    
    # Accounts tasks (if they exist)
    try:
        import accounts.tasks
        print("Successfully imported accounts tasks")
    except ImportError as e:
        print(f"Info: No accounts tasks found: {e}")
    
    # Notifications tasks (if they exist)
    try:
        import notifications.tasks
        print("Successfully imported notifications tasks")
    except ImportError as e:
        print(f"Info: No notifications tasks found: {e}")
    
    # Artists tasks (if they exist)
    try:
        import artists.tasks
        print("Successfully imported artists tasks")
    except ImportError as e:
        print(f"Info: No artists tasks found: {e}")
    
    # Stations tasks (if they exist)
    try:
        import stations.tasks
        print("Successfully imported stations tasks")
    except ImportError as e:
        print(f"Info: No stations tasks found: {e}")
    
except ImportError as e:
    # Log import errors but don't fail startup
    print(f"Critical error: Could not import core music_monitor tasks: {e}")
    # Re-raise if it's the core music_monitor tasks that failed
    if 'music_monitor.tasks' in str(e):
        raise

# Enhanced Celery configuration for performance optimization
app.conf.update(
    # Task routing and queues
    task_routes={
        'core.enhanced_tasks.enhanced_audio_detection_task': {'queue': 'critical'},
        'core.enhanced_tasks.batch_fingerprint_tracks_task': {'queue': 'high'},
        'core.enhanced_tasks.calculate_royalty_distributions_task': {'queue': 'normal'},
        'core.enhanced_tasks.generate_analytics_report_task': {'queue': 'analytics'},
        'core.enhanced_tasks.cleanup_old_data_task': {'queue': 'low'},
        'music_monitor.tasks.*': {'queue': 'normal'},
        'royalties.tasks.*': {'queue': 'normal'},
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
        'task': 'music_monitor.tasks.auto_fingerprint_new_tracks',
        'schedule': crontab(minute='*/10'),  # every 10 minutes
        'options': {'queue': 'high'}
    },
    'cleanup-old-fingerprints': {
        'task': 'music_monitor.tasks.cleanup_old_fingerprints',
        'schedule': crontab(hour=2, minute=0),  # daily at 2 AM
        'options': {'queue': 'low'}
    },
    'warm-cache-hourly': {
        'task': 'core.enhanced_tasks.warm_cache_task',
        'schedule': crontab(minute=0),  # every hour
        'options': {'queue': 'low'}
    },
    'cleanup-old-data-daily': {
        'task': 'core.enhanced_tasks.cleanup_old_data_task',
        'schedule': crontab(hour=3, minute=0),  # daily at 3 AM
        'options': {'queue': 'low'}
    },
    'update-pro-mappings': {
        'task': 'music_monitor.tasks.batch_update_pro_mappings',
        'schedule': crontab(hour=1, minute=0),  # daily at 1 AM
        'options': {'queue': 'normal'}
    },
}

app.conf.beat_schedule = CELERY_BEAT_SCHEDULE
