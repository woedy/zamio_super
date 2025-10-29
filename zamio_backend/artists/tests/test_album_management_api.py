from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from artists.models import Album, Artist, Genre


User = get_user_model()


class AlbumManagementAPITestCase(TestCase):
    """Integration tests for the artist album management API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='album-manager@example.com',
            first_name='Album',
            last_name='Manager',
            password='strongpass123',
        )
        self.artist = Artist.objects.create(
            user=self.user,
            stage_name='Album Manager',
        )
        self.client.force_authenticate(self.user)

        self.genre = Genre.objects.create(name='Afrobeats')

        self.active_album = Album.objects.create(
            artist=self.artist,
            title='Approved Album',
            genre=self.genre,
            status='Approved',
            release_date=timezone.now().date(),
            active=True,
        )
        self.draft_album = Album.objects.create(
            artist=self.artist,
            title='Pending Album',
            status='Pending',
            active=True,
        )
        self.inactive_album = Album.objects.create(
            artist=self.artist,
            title='Rejected Album',
            status='Rejected',
            active=False,
        )

    def test_list_albums_returns_paginated_payload(self):
        response = self.client.get('/api/artists/api/albums/', {'page': 1, 'page_size': 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        payload = response.data.get('data', {})
        albums = payload.get('albums', [])
        self.assertEqual(len(albums), 3)

        albums_by_title = {album['title']: album for album in albums}
        self.assertEqual(albums_by_title['Approved Album']['status'], 'active')
        self.assertEqual(albums_by_title['Pending Album']['status'], 'draft')
        self.assertEqual(albums_by_title['Rejected Album']['status'], 'inactive')

        pagination = payload.get('pagination', {})
        self.assertEqual(pagination['page'], 1)
        self.assertEqual(pagination['total_count'], 3)

        stats = payload.get('stats', {})
        self.assertEqual(stats['total'], 3)
        self.assertEqual(stats['active'], 2)
        self.assertEqual(stats['draft'], 1)
        self.assertEqual(stats['inactive'], 1)

    def test_create_album_persists_new_record(self):
        response = self.client.post(
            '/api/artists/api/albums/manage/',
            {
                'title': 'New Album',
                'release_date': '2024-01-01',
                'genre_id': self.genre.id,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payload = response.data.get('data', {})
        album_payload = payload.get('album')
        self.assertIsNotNone(album_payload)
        self.assertEqual(album_payload['title'], 'New Album')
        self.assertEqual(album_payload['genre'], 'Afrobeats')

        self.assertTrue(Album.objects.filter(artist=self.artist, title='New Album').exists())

    def test_update_album_applies_changes(self):
        response = self.client.patch(
            f'/api/artists/api/albums/{self.draft_album.id}/',
            {
                'title': 'Updated Pending Album',
                'status': 'Approved',
                'active': True,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.draft_album.refresh_from_db()
        self.assertEqual(self.draft_album.title, 'Updated Pending Album')
        self.assertEqual(self.draft_album.status, 'Approved')
        self.assertTrue(self.draft_album.active)

    def test_delete_album_soft_archives_record(self):
        response = self.client.delete(f'/api/artists/api/albums/{self.inactive_album.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.inactive_album.refresh_from_db()
        self.assertTrue(self.inactive_album.is_archived)
        self.assertFalse(self.inactive_album.active)

