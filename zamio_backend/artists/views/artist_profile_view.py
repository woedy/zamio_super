"""
Artist Profile View
Provides comprehensive profile data for artists with proper JWT authentication
"""

from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from artists.models import Artist, Track, Contributor
from music_monitor.models import PlayLog
from royalties.models import RoyaltyWithdrawal


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_artist_profile_view(request):
    """
    Get comprehensive profile data for an artist
    
    Query Parameters:
        - artist_id (required): Artist's unique identifier
    """
    payload = {}
    data = {}
    errors = {}

    artist_id = request.query_params.get('artist_id', '')

    # Validate artist_id
    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Get artist
    try:
        artist = Artist.objects.get(artist_id=artist_id)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found.']
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_404_NOT_FOUND)

    # Basic profile info
    profile = {
        'artist_id': artist.artist_id,
        'stage_name': artist.stage_name or '',
        'bio': artist.bio or '',
        'profile_image': artist.profile_image or None,
        'cover_image': None,  # Add if field exists
        'verified': artist.verified if hasattr(artist, 'verified') else False,
        'join_date': artist.created_at.isoformat() if artist.created_at else None,
        'location': None,  # Add if field exists
        'genres': [],  # Will populate from tracks
    }

    # Contact information
    contact = {
        'email': artist.contact_email or '',
        'phone': None,  # Add if field exists
        'instagram': artist.instagram or '',
        'twitter': artist.twitter or '',
        'facebook': None,  # Add if field exists
        'website': artist.website or '',
        'spotify_url': artist.spotify_url or '',
        'shazam_url': artist.shazam_url or '',
    }

    # Get all tracks for this artist
    tracks = Track.objects.filter(
        Q(artist=artist) | Q(contributors__artist=artist)
    ).distinct()

    # Get genres from tracks
    genres = list(tracks.exclude(genre__isnull=True).values_list('genre__name', flat=True).distinct()[:5])
    profile['genres'] = genres

    # Calculate statistics
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    # Total plays and earnings
    total_plays = PlayLog.objects.filter(track__in=tracks).count()
    
    # Total earnings from royalty withdrawals
    total_earnings = RoyaltyWithdrawal.objects.filter(
        artist=artist,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0.0

    # Monthly stats
    monthly_plays = PlayLog.objects.filter(
        track__in=tracks,
        detected_at__gte=thirty_days_ago
    ).count()

    monthly_earnings = RoyaltyWithdrawal.objects.filter(
        artist=artist,
        status='completed',
        created_at__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0.0

    # Radio coverage (unique stations)
    radio_coverage = PlayLog.objects.filter(
        track__in=tracks
    ).values('station').distinct().count()

    # Total songs
    total_songs = tracks.count()

    stats = {
        'total_plays': total_plays,
        'total_earnings': float(total_earnings),
        'monthly_plays': monthly_plays,
        'monthly_earnings': float(monthly_earnings),
        'new_followers': 0,  # Implement if follower system exists
        'radio_coverage': radio_coverage,
        'avg_rating': 0.0,  # Implement if rating system exists
        'total_songs': total_songs,
        'followers': 0,  # Implement if follower system exists
    }

    # Top tracks (by plays)
    top_tracks_data = []
    top_tracks = tracks.annotate(
        play_count=Count('playlogs')
    ).order_by('-play_count')[:5]

    for track in top_tracks:
        # Estimate earnings based on play count (₵0.50 per play as example rate)
        track_earnings = track.play_count * 0.50

        top_tracks_data.append({
            'track_id': track.track_id,
            'title': track.title,
            'duration': track.duration or '0:00',
            'release_date': track.release_date.isoformat() if track.release_date else None,
            'total_plays': track.play_count,
            'total_earnings': float(track_earnings),
            'status': 'Active' if track.active else 'Inactive',
            'album': track.album.title if track.album else None,
            'genre': track.genre.name if track.genre else None,
        })

    # Recent activity (last 10 play logs)
    recent_activity = []
    recent_plays = PlayLog.objects.filter(
        track__in=tracks
    ).select_related('track', 'station').order_by('-detected_at')[:10]

    for play in recent_plays:
        recent_activity.append({
            'id': play.id,
            'track_title': play.track.title,
            'station_name': play.station.name if play.station else 'Unknown',
            'detected_at': play.detected_at.isoformat() if play.detected_at else None,
            'confidence_score': float(play.confidence_score) if play.confidence_score else 0.0,
        })

    # Achievements (placeholder - implement based on business logic)
    achievements = []
    if total_earnings >= 10000:
        achievements.append({
            'title': 'Gold Artist',
            'description': 'Earned ₵10,000+ in royalties',
            'icon': 'Crown',
            'color': 'text-yellow-500'
        })
    if total_plays >= 1000000:
        achievements.append({
            'title': 'Rising Star',
            'description': '1M+ total plays milestone',
            'icon': 'Star',
            'color': 'text-blue-500'
        })
    if radio_coverage >= 10:
        achievements.append({
            'title': 'Radio Favorite',
            'description': 'Featured on 10+ radio stations',
            'icon': 'Radio',
            'color': 'text-purple-500'
        })

    # Build response
    data['profile'] = profile
    data['contact'] = contact
    data['stats'] = stats
    data['top_tracks'] = top_tracks_data
    data['recent_activity'] = recent_activity
    data['achievements'] = achievements

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_artist_profile_view(request):
    """
    Update artist profile information
    
    Body Parameters:
        - artist_id (required): Artist's unique identifier
        - stage_name (optional): Stage name
        - bio (optional): Biography
        - contact_email (optional): Contact email
        - instagram (optional): Instagram handle
        - twitter (optional): Twitter handle
        - website (optional): Website URL
        - spotify_url (optional): Spotify profile URL
        - shazam_url (optional): Shazam profile URL
    """
    payload = {}
    data = {}
    errors = {}

    artist_id = request.data.get('artist_id', '')

    # Validate artist_id
    if not artist_id:
        errors['artist_id'] = ['Artist ID is required.']
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    # Get artist
    try:
        artist = Artist.objects.get(artist_id=artist_id)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist not found.']
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_404_NOT_FOUND)

    # Update fields if provided
    if 'stage_name' in request.data:
        artist.stage_name = request.data['stage_name'].strip()
    if 'bio' in request.data:
        artist.bio = request.data['bio'].strip()
    if 'contact_email' in request.data:
        artist.contact_email = request.data['contact_email'].strip()
    if 'instagram' in request.data:
        artist.instagram = request.data['instagram'].strip()
    if 'twitter' in request.data:
        artist.twitter = request.data['twitter'].strip()
    if 'website' in request.data:
        artist.website = request.data['website'].strip()
    if 'spotify_url' in request.data:
        artist.spotify_url = request.data['spotify_url'].strip()
    if 'shazam_url' in request.data:
        artist.shazam_url = request.data['shazam_url'].strip()

    artist.save()

    data['artist_id'] = artist.artist_id
    data['stage_name'] = artist.stage_name
    data['updated'] = True

    payload['message'] = "Successful"
    payload['data'] = data
    return Response(payload, status=status.HTTP_200_OK)
