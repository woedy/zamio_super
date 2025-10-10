# Generated manually for UserPreferences model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_add_verification_status_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserPreferences',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email_notifications', models.BooleanField(default=True)),
                ('sms_notifications', models.BooleanField(default=False)),
                ('push_notifications', models.BooleanField(default=True)),
                ('marketing_emails', models.BooleanField(default=False)),
                ('royalty_alerts', models.BooleanField(default=True)),
                ('match_notifications', models.BooleanField(default=True)),
                ('weekly_reports', models.BooleanField(default=True)),
                ('sound_notifications', models.BooleanField(default=True)),
                ('privacy_profile_public', models.BooleanField(default=False)),
                ('privacy_show_earnings', models.BooleanField(default=False)),
                ('privacy_show_plays', models.BooleanField(default=True)),
                ('theme_preference', models.CharField(choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System')], default='system', max_length=10)),
                ('language', models.CharField(default='en', max_length=10)),
                ('timezone', models.CharField(default='UTC', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='preferences', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'User Preferences',
                'verbose_name_plural': 'User Preferences',
            },
        ),
    ]