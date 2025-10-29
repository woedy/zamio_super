from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from artists.models import Artist, UploadProcessingStatus, Album


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
