from django.contrib.auth import get_user_model
import json
from types import SimpleNamespace
from unittest.mock import patch

from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from artists.models import Artist, UploadProcessingStatus, Album, Genre, Track


User = get_user_model()


class UploadManagementAPITestCase(TestCase):
    """Integration tests for the artist upload management API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='artist@example.com',
            first_name='Upload',
            last_name='Tester',
            password='securepass123'
        )
        self.artist = Artist.objects.create(
            user=self.user,
            stage_name='Upload Tester'
        )
        self.client.force_authenticate(user=self.user)

        self.pending_upload = UploadProcessingStatus.objects.create(
            upload_id='pending_upload_id',
            user=self.user,
            upload_type='track_audio',
            original_filename='pending-track.mp3',
            file_size=2048,
            mime_type='audio/mpeg',
            status='pending',
            progress_percentage=10,
            metadata={
                'title': 'Pending Track',
                'album_title': 'Album Beta',
                'artist_name': 'Upload Tester',
            },
        )
        self.processing_upload = UploadProcessingStatus.objects.create(
            upload_id='processing_upload_id',
            user=self.user,
            upload_type='track_audio',
            original_filename='processing-track.mp3',
            file_size=4096,
            mime_type='audio/mpeg',
            status='processing',
            progress_percentage=55,
            metadata={
                'title': 'Processing Track',
                'album_title': 'Album Alpha',
                'artist_name': 'Upload Tester',
            },
        )
        self.completed_upload = UploadProcessingStatus.objects.create(
            upload_id='completed_upload_id',
            user=self.user,
            upload_type='track_audio',
            original_filename='completed-track.mp3',
            file_size=8192,
            mime_type='audio/mpeg',
            status='completed',
            progress_percentage=100,
            entity_type='track',
            metadata={
                'title': 'Completed Track',
                'album_title': 'Album Alpha',
                'artist_name': 'Upload Tester',
            },
        )
        self.failed_upload = UploadProcessingStatus.objects.create(
            upload_id='failed_upload_id',
            user=self.user,
            upload_type='track_audio',
            original_filename='failed-track.mp3',
            file_size=1024,
            mime_type='audio/mpeg',
            status='failed',
            progress_percentage=20,
            error_message='Transcoding failed',
            metadata={
                'title': 'Failed Track',
                'album_title': 'Album Gamma',
                'artist_name': 'Upload Tester',
            },
        )

    def test_get_user_uploads_returns_expected_payload(self):
        response = self.client.get('/api/artists/api/uploads/', {'page': 1, 'page_size': 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        payload = response.data.get('data', {})
        uploads = payload.get('uploads', [])
        self.assertEqual(len(uploads), 4)

        uploads_by_id = {item['upload_id']: item for item in uploads}
        self.assertEqual(uploads_by_id['pending_upload_id']['status'], 'uploading')
        self.assertEqual(uploads_by_id['processing_upload_id']['status'], 'processing')
        self.assertEqual(uploads_by_id['completed_upload_id']['status'], 'completed')
        self.assertEqual(uploads_by_id['failed_upload_id']['status'], 'failed')

        stats = payload.get('stats', {})
        self.assertEqual(stats['total'], 4)
        self.assertEqual(stats['uploading'], 1)
        self.assertEqual(stats['processing'], 1)
        self.assertEqual(stats['completed'], 1)
        self.assertEqual(stats['failed'], 1)

        filters = payload.get('filters', {})
        self.assertIn('Album Alpha', filters.get('albums', []))
        self.assertIn('Album Beta', filters.get('albums', []))
        self.assertIn('Album Gamma', filters.get('albums', []))

        pagination = payload.get('pagination', {})
        self.assertEqual(pagination['page'], 1)
        self.assertEqual(pagination['total_count'], 4)

    def test_cancel_upload_marks_record_cancelled(self):
        response = self.client.delete('/api/artists/api/upload/processing_upload_id/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.processing_upload.refresh_from_db()
        self.assertEqual(self.processing_upload.status, 'cancelled')

    def test_delete_upload_removes_failed_record(self):
        response = self.client.delete('/api/artists/api/upload/failed_upload_id/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(
            UploadProcessingStatus.objects.filter(upload_id='failed_upload_id').exists()
        )

    def test_get_user_uploads_infers_file_type_when_missing(self):
        legacy_upload = UploadProcessingStatus.objects.create(
            upload_id='legacy_upload_id',
            user=self.user,
            upload_type='track_audio',
            original_filename='legacy-track.wav',
            file_size=1234,
            mime_type='',
            status='completed',
            progress_percentage=100,
            metadata={
                'title': 'Legacy Track',
                'file_type': 'audio/wav',
            },
        )

        response = self.client.get('/api/artists/api/uploads/', {'page': 1, 'page_size': 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        uploads = response.data['data']['uploads']
        uploads_by_id = {item['upload_id']: item for item in uploads}
        self.assertEqual(uploads_by_id[legacy_upload.upload_id]['file_type'], 'audio/wav')

    def test_get_upload_status_infers_mime_type_when_missing(self):
        UploadProcessingStatus.objects.create(
            upload_id='detail_legacy_upload',
            user=self.user,
            upload_type='track_audio',
            original_filename='detail-track.aac',
            file_size=3210,
            mime_type='',
            status='processing',
            progress_percentage=40,
            metadata={'file_type': 'audio/aac'},
        )

        response = self.client.get('/api/artists/api/upload-status/detail_legacy_upload/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['mime_type'], 'audio/aac')

    def test_create_album_for_uploads_creates_or_updates_album(self):
        payload = {
            'title': 'Fresh Album',
            'release_date': '2024-05-01',
            'genre': 'Highlife',
        }

        response = self.client.post('/api/artists/api/albums/create/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        album = Album.objects.get(artist=self.artist, title='Fresh Album')
        self.assertEqual(album.genre.name, 'Highlife')

        # Update the release date to ensure endpoint handles updates
        payload['release_date'] = '2024-06-15'
        response = self.client.post('/api/artists/api/albums/create/', payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        album.refresh_from_db()
        self.assertEqual(str(album.release_date), '2024-06-15')

    @patch('artists.api.upload_status_views.process_track_upload.delay')
    def test_initiate_upload_creates_processing_record(self, mocked_delay):
        mocked_delay.return_value = SimpleNamespace(id='task-123')

        genre = Genre.objects.create(name='Highlife')
        audio_bytes = b'ID3' + b'\x00' * 128
        audio_file = SimpleUploadedFile(
            'demo-track.mp3',
            audio_bytes,
            content_type='audio/mpeg',
        )

        contributors = [
            {
                'name': 'Upload Tester',
                'email': 'artist@example.com',
                'role': 'Artist',
                'royaltyPercentage': 100,
            }
        ]

        response = self.client.post(
            '/api/artists/api/upload/initiate/',
            {
                'upload_type': 'track_audio',
                'title': 'Sunrise Jam',
                'genre_id': str(genre.id),
                'album_title': 'Morning Energy',
                'release_date': '2024-07-01',
                'contributors': json.dumps(contributors),
                'file': audio_file,
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        payload = response.data.get('data', {})
        upload_id = payload.get('upload_id')
        self.assertIsNotNone(upload_id)
        track_id = payload.get('track_id')
        self.assertIsNotNone(track_id)

        mocked_delay.assert_called_once()
        kwargs = mocked_delay.call_args.kwargs
        stored_file_path = kwargs['source_file_path']
        self.assertTrue(stored_file_path.startswith('temp/'))
        self.assertTrue(stored_file_path.endswith('.mp3'))
        self.assertTrue(default_storage.exists(stored_file_path))
        with default_storage.open(stored_file_path, 'rb') as stored_file:
            self.assertEqual(stored_file.read(), audio_bytes)

        upload_status = UploadProcessingStatus.objects.get(upload_id=upload_id)
        self.assertEqual(upload_status.status, 'queued')
        self.assertEqual(upload_status.metadata.get('title'), 'Sunrise Jam')
        self.assertEqual(
            upload_status.metadata.get('internal_temp_storage_path'),
            stored_file_path,
        )
        stored_contributors = upload_status.metadata.get('contributors', [])
        self.assertEqual(len(stored_contributors), 1)
        self.assertEqual(stored_contributors[0]['name'], 'Upload Tester')
        self.assertEqual(stored_contributors[0]['percent_split'], 100.0)

        track = Track.objects.get(id=upload_status.entity_id)
        self.assertEqual(track.processing_status, 'queued')
        self.assertEqual(track.title, 'Sunrise Jam')

        # Clean up temporary file created during the test
        default_storage.delete(stored_file_path)

    def test_upload_support_data_accepts_jwt_bearer_auth(self):
        genre = Genre.objects.create(name='Highlife Supreme')
        Album.objects.create(artist=self.artist, title='Support Album', genre=genre)

        jwt_client = APIClient()
        refresh = RefreshToken.for_user(self.user)
        jwt_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        response = jwt_client.get(
            '/api/artists/get-upload-track-support-data/',
            {'artist_id': self.artist.artist_id},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data.get('data', {})
        genres = payload.get('genres', [])
        albums = payload.get('albums', [])

        self.assertTrue(any(item['id'] == genre.id for item in genres))
        self.assertTrue(any(item['title'] == 'Support Album' for item in albums))
