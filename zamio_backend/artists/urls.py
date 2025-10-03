from django.urls import path, include

from artists.views.albums_views import add_album, archive_album, delete_album, edit_album, get_album_details_view, get_all_albums_view, get_all_archived_albums_view, unarchive_album
from artists.views.artist_analytics_view import get_artist_analytics_view
from artists.views.artist_hompage import get_artist_homedata
from artists.views.artist_playlog_views import get_all_track_playlog_view
from artists.views.artist_views import add_artist, archive_artist, edit_artist, get_all_archived_artists_view, get_all_artists_view, get_artist_details_view, get_artist_profile_view, unarchive_artist
from artists.views.contributions_views import add_contributor, archive_contributor, delete_contributor, edit_contributor, get_all_archived_contributors_view, get_all_contributors_view, get_contributor_details_view, unarchive_contributor, get_artist_contributor_choices_view
from artists.views.genre_views import add_genre, archive_genre, delete_genre, edit_genre, get_all_archived_genres_view, get_all_genres_view, unarchive_genre
from artists.views.platforms_views import add_platform_availability, delete_platform_availability, get_all_platform_availability_view, get_platform_availability_details_view
from artists.views.tracks_views import add_track, archive_track, delete_track, edit_track, get_all_archived_tracks_view, get_all_tracks_admin_view, get_all_tracks_view, get_edit_track_support_data_view, get_track_details_view, get_upload_track_support_data_view, unarchive_track, upload_track_cover_view

app_name = "artists"

urlpatterns = [

    # 🎤 Artists
    path('add/', add_artist, name='add_artist'),
    path('get-all-artists/', get_all_artists_view, name='get_all_artists'),
    path('get-artist-details/', get_artist_details_view, name='get_artist_details'),
    path('edit-artist/', edit_artist, name='edit_artist'),
    path('archive-artist/', archive_artist, name='archive_artist'),
    path('unarchive-artist/', unarchive_artist, name='unarchive_artist'),
    # path('delete/', delete_artist, name='delete_artist'),
    path('get-all-archived-artists/', get_all_archived_artists_view, name='archived_artists'),

    path('get-artist-profile/', get_artist_profile_view, name='get_artist_profile_view'),

    # 🎧 Genres
    path('add-genre/', add_genre, name='add_genre'),
    path('get-all-genre/', get_all_genres_view,  name='get_all_genres'),
    # path('details/', get_genre_details_view, name='get_genre_details'),
    path('edit-genre/', edit_genre, name='edit_genre'),
    path('archive-genre/', archive_genre, name='archive_genre'),
    path('unarchive-genre/', unarchive_genre, name='unarchive_genre'),
    path('delete-genre/', delete_genre, name='delete_genre'),
    path('get-all-archived-genres/', get_all_archived_genres_view, name='archived_genres'),
# 
    # # 💿 Albums
    path('add-album/', add_album, name='add_album'),
    path('get-all-albums/', get_all_albums_view, name='get_all_albums'),
    path('get-album-details/', get_album_details_view, name='get_album_details'),
    path('edit-album/', edit_album, name='edit_album'),
    path('archive-album/', archive_album, name='archive_album'),
    path('unarchive-album/', unarchive_album, name='unarchive_album'),
    path('delete-album/', delete_album, name='delete_album'),
    path('get-all-archived-albums/', get_all_archived_albums_view, name='archived_albums'),
# 
    # # 🎵 Tracks
    path('add-track/', add_track, name='add_track'),
    path('get-upload-track-support-data/', get_upload_track_support_data_view, name='get_upload_track_support_data_view'),
    path('get-edit-track-support-data/', get_edit_track_support_data_view, name='get_edit_track_support_data_view'),
    path('get-all-tracks/', get_all_tracks_view, name='get_all_tracks'),
    path('get-all-tracks-admin/', get_all_tracks_admin_view, name='get_all_tracks_admin_view'),
    path('get-track-details/', get_track_details_view, name='get_track_details'),
    path('edit-track/', edit_track, name='edit_track'),
    path('archive-track/', archive_track, name='archive_track'),
    path('unarchive-track/', unarchive_track, name='unarchive_track'),
    path('delete-track/', delete_track, name='delete_track'),
    path('get-all-archived-tracks/', get_all_archived_tracks_view, name='archived_tracks'),
    path('upload-track-coverart/', upload_track_cover_view, name='upload_track_cover_view'),
# 
    # # 👥 Contributors
    path('add-contributor/', add_contributor, name='add_contributor'),
    path('get-artist-contributor-choices/', get_artist_contributor_choices_view, name='get_artist_contributor_choices_view'),
    path('get-all-contributors/', get_all_contributors_view, name='get_all_contributors'),
    path('get-contributor-details/', get_contributor_details_view, name='get_contributor_details'),
    path('edit-contributor/', edit_contributor, name='edit_contributor'),
    path('archive-contributor/', archive_contributor, name='archive_contributor'),
    path('unarchive-contributor/', unarchive_contributor, name='unarchive_contributor'),
    path('delete-contributor/', delete_contributor, name='delete_contributor'),
    path('get-all-archived-contributors/', get_all_archived_contributors_view, name='archived_contributors'),
# 
    # # 🌐 Platform Availability
    path('add-track-platform-availability/', add_platform_availability, name='add_platform_availability'),
    path('get-all-platform-availability/', get_all_platform_availability_view, name='get_all_platform_availability'),
    path('get-track-platform-availability-details/', get_platform_availability_details_view, name='get_platform_availability_details'),
    # path('edit/', edit_platform_availability, name='edit_platform_availability'),
    # path('archive/', archive_platform_availability, name='archive_platform_availability'),
    # path('unarchive/', unarchive_platform_availability, name='unarchive_platform_availability'),
    path('delete-platform-availability/', delete_platform_availability, name='delete_platform_availability'),
    # path('archived/', get_all_archived_platform_availability_view, name='archived_platform_availability'),
    
    path('dashboard/', get_artist_homedata, name='get_artist_homedata'),
    path('playlogs/', get_all_track_playlog_view, name='get_all_track_playlog_view'),
    path('analytics/', get_artist_analytics_view, name='get_artist_analytics_view'),
    
    # Enhanced secure media file endpoints
    path('api/', include('artists.api.media_urls')),
]
