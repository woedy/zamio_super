# Generated manually for stream URL management
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stations', '0003_complaint_complaintupdate_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='station',
            name='stream_url',
            field=models.URLField(blank=True, help_text='Live stream URL for audio monitoring', null=True),
        ),
        migrations.AddField(
            model_name='station',
            name='stream_status',
            field=models.CharField(
                choices=[
                    ('active', 'Active'),
                    ('inactive', 'Inactive'),
                    ('error', 'Error'),
                    ('testing', 'Testing'),
                ],
                default='inactive',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='station',
            name='last_monitored',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='station',
            name='stream_validation_errors',
            field=models.TextField(blank=True, help_text='Last validation error messages', null=True),
        ),
    ]