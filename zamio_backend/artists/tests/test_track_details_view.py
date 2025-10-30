import io

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from artists.models import Artist, Track


class TrackDetailsViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            email='details@example.com',
            password='strong-pass-123',
            first_name='Detail',
            last_name='Tester',
        )
        self.artist = Artist.objects.create(
            user=self.user,
            stage_name='Detail Tester',
        )
        self.track_without_code = Track.objects.create(
            artist=self.artist,
            title='Primary Key Track',
            audio_file=self._build_audio_file('pk-track.wav'),
            audio_file_mp3=self._build_audio_file('pk-track.mp3'),
            processing_status='completed',
        )
        self.track_with_code = Track.objects.create(
            artist=self.artist,
            title='Legacy ID Track',
            track_id='TRACK-LEGACY-001',
            audio_file=self._build_audio_file('legacy-track.wav'),
            audio_file_mp3=self._build_audio_file('legacy-track.mp3'),
            processing_status='completed',
        )
        self.client.force_authenticate(user=self.user)

    def tearDown(self):
        for track in (self.track_without_code, self.track_with_code):
            if track.audio_file:
                track.audio_file.delete(save=False)
            if track.audio_file_mp3:
                track.audio_file_mp3.delete(save=False)
        super().tearDown()

    def _build_audio_file(self, name: str) -> SimpleUploadedFile:
        return SimpleUploadedFile(name, io.BytesIO(b"audio-bytes").getvalue(), content_type='audio/mpeg')

    def test_fetch_track_details_using_primary_key(self):
        response = self.client.get(
            '/api/artists/get-track-details/',
            {'track_id': self.track_without_code.id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data.get('data', {})
        self.assertEqual(payload.get('title'), self.track_without_code.title)
        self.assertEqual(payload.get('artist_name'), self.artist.stage_name)
        self.assertEqual(payload.get('plays'), 0)

    def test_fetch_track_details_using_legacy_identifier(self):
        response = self.client.get(
            '/api/artists/get-track-details/',
            {'track_id': self.track_with_code.track_id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data.get('data', {})
        self.assertEqual(payload.get('title'), self.track_with_code.title)
        self.assertEqual(payload.get('artist_name'), self.artist.stage_name)

    def test_fetch_track_details_returns_error_for_unknown_track(self):
        response = self.client.get(
            '/api/artists/get-track-details/',
            {'track_id': 999999},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('track', response.data.get('errors', {}))
