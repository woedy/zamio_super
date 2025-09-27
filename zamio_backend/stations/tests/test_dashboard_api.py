from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from artists.models import Artist, Genre, Track
from music_monitor.models import PlayLog
from stations.models import Station


@override_settings(SECURE_SSL_REDIRECT=False)
class StationDashboardAPITestCase(TestCase):
    def setUp(self) -> None:
        user_model = get_user_model()

        self.station_user = user_model.objects.create_user(
            email='station@example.com',
            password='strong-password',
            first_name='Station',
            last_name='User',
        )
        self.station_user.user_type = 'Station'
        self.station_user.save(update_fields=['user_type'])

        self.token, _ = Token.objects.get_or_create(user=self.station_user)

        self.station = Station.objects.create(
            user=self.station_user,
            name='Test Station',
            station_id='ST-TEST-001',
            country='Ghana',
            region='Greater Accra',
            active=True,
        )

        genre = Genre.objects.create(name='Afrobeats', color='#facc15')

        artist_user = user_model.objects.create_user(
            email='artist@example.com',
            password='strong-password',
            first_name='Artist',
            last_name='User',
        )
        artist_user.user_type = 'Artist'
        artist_user.save(update_fields=['user_type'])

        artist = Artist.objects.create(
            user=artist_user,
            stage_name='Test Artist',
            country='Ghana',
            region='Greater Accra',
        )

        audio_file = SimpleUploadedFile('track.mp3', b'fake-mp3-data', content_type='audio/mpeg')
        self.track = Track.objects.create(
            artist=artist,
            title='Test Track',
            audio_file=audio_file,
            genre=genre,
            duration=timedelta(minutes=3),
            royalty_amount=Decimal('12.50'),
        )

        now = timezone.now()
        PlayLog.objects.create(
            track=self.track,
            station=self.station,
            source='Radio',
            played_at=now - timedelta(hours=1),
            royalty_amount=Decimal('2.50'),
            avg_confidence_score=Decimal('0.82'),
            flagged=False,
        )
        PlayLog.objects.create(
            track=self.track,
            station=self.station,
            source='Radio',
            played_at=now - timedelta(days=2),
            royalty_amount=Decimal('1.25'),
            avg_confidence_score=Decimal('0.91'),
            flagged=True,
        )

        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_dashboard_endpoint_returns_station_metrics(self) -> None:
        url = reverse('stations:get_station_dashboard_data')
        response = self.client.get(
            url,
            {
                'station_id': self.station.station_id,
                'period': 'weekly',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn('data', payload)

        data = payload['data']
        self.assertEqual(data['stationName'], self.station.name)
        self.assertEqual(data['totalSongs'], 1)
        self.assertEqual(data['totalPlays'], 2)
        self.assertEqual(data['disputeSummary']['disputed'], 1)
        self.assertEqual(data['disputeSummary']['undisputed'], 1)
        self.assertGreater(len(data['airplayData']), 0)
        self.assertGreater(len(data['trendData']), 0)
