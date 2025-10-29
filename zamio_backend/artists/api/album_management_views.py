"""Album management API endpoints for artists."""

from datetime import date
from typing import Optional

from django.db.models import Count, Sum, Value, Q, DecimalField
from django.db.models.functions import Coalesce
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.api.custom_jwt import CustomJWTAuthentication
from artists.models import Album, Artist, Genre
from artists.serializers import AlbumManagementSerializer


def _get_artist_for_request(request) -> Optional[Artist]:
    try:
        return Artist.objects.get(user=request.user)
    except Artist.DoesNotExist:
        return None


def _parse_release_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None

    parsed = parse_date(value)
    return parsed


def _resolve_genre(genre_id: Optional[int], genre_name: Optional[str]) -> Optional[Genre]:
    if genre_id:
        return Genre.objects.get(id=genre_id)

    if genre_name and genre_name.strip():
        return Genre.objects.get_or_create(name=genre_name.strip())[0]

    return None


class AlbumPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 50


def _parse_boolean(value) -> Optional[bool]:
    if value is None:
        return None
    if isinstance(value, bool):
        return value

    value_str = str(value).strip().lower()
    if value_str in {'true', '1', 'yes', 'on'}:
        return True
    if value_str in {'false', '0', 'no', 'off'}:
        return False
    return None


@api_view(['GET'])
@authentication_classes([TokenAuthentication, CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def list_albums(request):
    """Return paginated albums for the authenticated artist."""

    payload = {'message': '', 'data': {}, 'errors': {}}

    artist = _get_artist_for_request(request)
    if not artist:
        payload['message'] = 'User is not registered as an artist'
        payload['errors'] = {'user': ['Only artists can manage albums']}
        return Response(payload, status=status.HTTP_403_FORBIDDEN)

    base_queryset = Album.objects.filter(artist=artist, is_archived=False)

    search_query = (request.query_params.get('search') or '').strip()

    status_filter = (request.query_params.get('status') or '').lower()
    if status_filter == 'active':
        base_queryset = base_queryset.filter(active=True, is_archived=False)
    elif status_filter == 'inactive':
        base_queryset = base_queryset.filter(active=False)
    elif status_filter == 'draft':
        base_queryset = base_queryset.filter(status__iexact='pending')

    if search_query:
        base_queryset = base_queryset.filter(
            Q(title__icontains=search_query)
            | Q(album_id__icontains=search_query)
            | Q(genre__name__icontains=search_query)
        )

    annotated_queryset = base_queryset.annotate(
        track_count=Count('track', distinct=True),
        total_plays=Count('track__track_playlog', distinct=True),
        total_revenue=Coalesce(
            Sum('track__royalty_amount'),
            Value(0, output_field=DecimalField(max_digits=12, decimal_places=2)),
        ),
    )

    sort_by_param = request.query_params.get('sort_by') or 'createdAt'
    sort_order = (request.query_params.get('sort_order') or 'desc').lower()
    sort_map = {
        'title': 'title',
        'releaseDate': 'release_date',
        'trackCount': 'track_count',
        'totalPlays': 'total_plays',
        'totalRevenue': 'total_revenue',
        'createdAt': 'created_at',
    }
    sort_field = sort_map.get(sort_by_param, 'created_at')
    if sort_order == 'asc':
        annotated_queryset = annotated_queryset.order_by(sort_field, 'id')
    else:
        annotated_queryset = annotated_queryset.order_by(f'-{sort_field}', '-id')

    paginator = AlbumPagination()
    page = paginator.paginate_queryset(annotated_queryset, request)

    serializer = AlbumManagementSerializer(page, many=True, context={'request': request})

    stats_queryset = Album.objects.filter(artist=artist, is_archived=False)
    stats = {
        'total': stats_queryset.count(),
        'active': stats_queryset.filter(active=True).count(),
        'inactive': stats_queryset.filter(active=False).count(),
        'draft': stats_queryset.filter(status__iexact='pending').count(),
    }

    pagination = {
        'page': paginator.page.number,
        'page_size': paginator.get_page_size(request),
        'total_pages': paginator.page.paginator.num_pages,
        'total_count': paginator.page.paginator.count,
        'has_next': paginator.page.has_next(),
        'has_previous': paginator.page.has_previous(),
    }

    payload['message'] = 'Albums retrieved successfully'
    payload['data'] = {
        'albums': serializer.data,
        'pagination': pagination,
        'stats': stats,
    }
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([TokenAuthentication, CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_album(request):
    """Create a new album for the authenticated artist."""

    payload = {'message': '', 'data': {}, 'errors': {}}

    artist = _get_artist_for_request(request)
    if not artist:
        payload['message'] = 'User is not registered as an artist'
        payload['errors'] = {'user': ['Only artists can create albums']}
        return Response(payload, status=status.HTTP_403_FORBIDDEN)

    title = (request.data.get('title') or '').strip()
    if not title:
        payload['message'] = 'Album title is required'
        payload['errors'] = {'title': ['This field is required']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    release_date_raw = request.data.get('release_date')
    release_date_value = _parse_release_date(release_date_raw)
    if release_date_raw and release_date_value is None:
        payload['message'] = 'Invalid release date'
        payload['errors'] = {'release_date': ['Use the YYYY-MM-DD date format']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    try:
        genre = _resolve_genre(request.data.get('genre_id'), request.data.get('genre'))
    except Genre.DoesNotExist:
        payload['message'] = 'Genre not found'
        payload['errors'] = {'genre': ['The provided genre could not be found']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    if Album.objects.filter(artist=artist, title__iexact=title, is_archived=False).exists():
        payload['message'] = 'Album already exists'
        payload['errors'] = {'title': ['You already have an album with this title']}
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    album = Album.objects.create(
        artist=artist,
        title=title,
        release_date=release_date_value,
        genre=genre,
        active=True,
    )

    serializer = AlbumManagementSerializer(album, context={'request': request})

    payload['message'] = 'Album created successfully'
    payload['data'] = {'album': serializer.data}
    return Response(payload, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@authentication_classes([TokenAuthentication, CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_album(request, album_id: int):
    """Update album metadata for the authenticated artist."""

    payload = {'message': '', 'data': {}, 'errors': {}}

    artist = _get_artist_for_request(request)
    if not artist:
        payload['message'] = 'User is not registered as an artist'
        payload['errors'] = {'user': ['Only artists can update albums']}
        return Response(payload, status=status.HTTP_403_FORBIDDEN)

    try:
        album = Album.objects.get(id=album_id, artist=artist, is_archived=False)
    except Album.DoesNotExist:
        payload['message'] = 'Album not found'
        payload['errors'] = {'album': ['Album not found']}
        return Response(payload, status=status.HTTP_404_NOT_FOUND)

    updates = []

    if 'title' in request.data:
        new_title = (request.data.get('title') or '').strip()
        if not new_title:
            payload['message'] = 'Album title is required'
            payload['errors'] = {'title': ['This field cannot be blank']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        if Album.objects.filter(artist=artist, title__iexact=new_title).exclude(id=album.id).exists():
            payload['message'] = 'Album already exists'
            payload['errors'] = {'title': ['You already have an album with this title']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        if album.title != new_title:
            album.title = new_title
            updates.append('title')

    if 'release_date' in request.data:
        release_date_raw = request.data.get('release_date')
        new_release_date = _parse_release_date(release_date_raw)
        if release_date_raw and new_release_date is None:
            payload['message'] = 'Invalid release date'
            payload['errors'] = {'release_date': ['Use the YYYY-MM-DD date format']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        if album.release_date != new_release_date:
            album.release_date = new_release_date
            updates.append('release_date')

    if 'genre_id' in request.data or 'genre' in request.data:
        try:
            genre = _resolve_genre(request.data.get('genre_id'), request.data.get('genre'))
        except Genre.DoesNotExist:
            payload['message'] = 'Genre not found'
            payload['errors'] = {'genre': ['The provided genre could not be found']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        if genre != album.genre:
            album.genre = genre
            updates.append('genre')

    if 'status' in request.data:
        new_status = (request.data.get('status') or '').strip()
        if new_status and new_status in dict(Album.STATUS_CHOICES):
            if album.status != new_status:
                album.status = new_status
                updates.append('status')

    if 'active' in request.data:
        parsed_active = _parse_boolean(request.data.get('active'))
        if parsed_active is None:
            payload['message'] = 'Invalid active flag'
            payload['errors'] = {'active': ['Provide a boolean value']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        if album.active != parsed_active:
            album.active = parsed_active
            updates.append('active')

    if not updates:
        serializer = AlbumManagementSerializer(album, context={'request': request})
        payload['message'] = 'No changes applied'
        payload['data'] = {'album': serializer.data}
        return Response(payload, status=status.HTTP_200_OK)

    album.save(update_fields=updates + ['updated_at'])

    serializer = AlbumManagementSerializer(album, context={'request': request})
    payload['message'] = 'Album updated successfully'
    payload['data'] = {'album': serializer.data}
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication, CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_album(request, album_id: int):
    """Archive (soft delete) an album for the authenticated artist."""

    payload = {'message': '', 'data': {}, 'errors': {}}

    artist = _get_artist_for_request(request)
    if not artist:
        payload['message'] = 'User is not registered as an artist'
        payload['errors'] = {'user': ['Only artists can remove albums']}
        return Response(payload, status=status.HTTP_403_FORBIDDEN)

    try:
        album = Album.objects.get(id=album_id, artist=artist, is_archived=False)
    except Album.DoesNotExist:
        payload['message'] = 'Album not found'
        payload['errors'] = {'album': ['Album not found']}
        return Response(payload, status=status.HTTP_404_NOT_FOUND)

    album.is_archived = True
    album.active = False
    album.save(update_fields=['is_archived', 'active', 'updated_at'])

    payload['message'] = 'Album archived successfully'
    payload['data'] = {'album_id': album_id}
    return Response(payload, status=status.HTTP_200_OK)

