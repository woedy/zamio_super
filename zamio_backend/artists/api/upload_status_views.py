"""
API views for non-blocking upload processing with real-time status tracking
"""
import uuid
import os
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
from accounts.models import AuditLog
from artists.models import Track, Album, Artist, UploadProcessingStatus, Contributor
from artists.tasks import process_track_upload, process_cover_art_upload, update_contributor_splits
from artists.services.media_file_service import MediaFileService


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def initiate_non_blocking_upload(request):
    """
    Initiate non-blocking upload processing with immediate response
    """
    payload = {'message': '', 'data': {}, 'errors': {}}
    
    try:
        user = request.user
        
        # Verify user is an artist
        try:
            artist = Artist.objects.get(user=user)
        except Artist.DoesNotExist:
            payload['message'] = 'User is not registered as an artist'
            payload['errors'] = {'user': ['Only artists can upload tracks']}
            return Response(payload, status=status.HTTP_403_FORBIDDEN)
        
        # Get upload type and file
        upload_type = request.data.get('upload_type')  # 'track_audio', 'track_cover', 'album_cover'
        uploaded_file = request.FILES.get('file')
        
        # Get metadata
        metadata = {
            'title': request.data.get('title', ''),
            'track_id': request.data.get('track_id'),
            'album_id': request.data.get('album_id'),
            'genre_id': request.data.get('genre_id'),
            'release_date': request.data.get('release_date'),
            'explicit': request.data.get('explicit', False),
            'lyrics': request.data.get('lyrics', ''),
        }
        
        # Validate required fields
        if not uploaded_file:
            payload['message'] = 'File is required'
            payload['errors'] = {'file': ['This field is required']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        if not upload_type:
            payload['message'] = 'Upload type is required'
            payload['errors'] = {'upload_type': ['This field is required']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate upload type
        valid_upload_types = ['track_audio', 'track_cover', 'album_cover']
        if upload_type not in valid_upload_types:
            payload['message'] = 'Invalid upload type'
            payload['errors'] = {'upload_type': [f'Must be one of: {", ".join(valid_upload_types)}']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        # For track uploads, title is required
        if upload_type == 'track_audio' and not metadata['title']:
            payload['message'] = 'Track title is required'
            payload['errors'] = {'title': ['This field is required for track uploads']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate track ownership if updating existing track
        track = None
        if metadata['track_id']:
            try:
                track = Track.objects.get(id=metadata['track_id'], artist=artist)
            except Track.DoesNotExist:
                payload['message'] = 'Track not found or access denied'
                payload['errors'] = {'track_id': ['Track not found or you do not have permission to modify it']}
                return Response(payload, status=status.HTTP_404_NOT_FOUND)
        
        # Validate file based on upload type
        try:
            if upload_type == 'track_audio':
                MediaFileService.validate_media_file(uploaded_file, 'audio')
            else:  # cover art
                MediaFileService.validate_media_file(uploaded_file, 'image')
        except ValidationError as e:
            payload['message'] = 'File validation failed'
            payload['errors'] = {'file': e.messages if hasattr(e, 'messages') else [str(e)]}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique upload ID
        upload_id = f"{upload_type}_{uuid.uuid4().hex[:16]}"
        
        # Create or update track record if needed
        if upload_type == 'track_audio':
            if not track:
                # Create new track
                track = Track.objects.create(
                    artist=artist,
                    title=metadata['title'],
                    genre_id=metadata['genre_id'] if metadata['genre_id'] else None,
                    album_id=metadata['album_id'] if metadata['album_id'] else None,
                    release_date=metadata['release_date'] if metadata['release_date'] else None,
                    explicit=metadata['explicit'],
                    lyrics=metadata['lyrics'],
                    processing_status='pending'
                )
        
        # Create upload processing status record
        upload_status = UploadProcessingStatus.objects.create(
            upload_id=upload_id,
            user=user,
            upload_type=upload_type,
            original_filename=uploaded_file.name,
            file_size=uploaded_file.size,
            status='queued',
            entity_id=track.id if track else None,
            entity_type='track' if track else None,
            metadata=metadata
        )
        
        # Save file to temporary location
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        temp_file_path = os.path.join(temp_dir, f"{upload_id}_{uploaded_file.name}")
        
        with open(temp_file_path, 'wb') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
        
        # Queue appropriate background task
        if upload_type == 'track_audio':
            process_track_upload.delay(
                upload_id=upload_id,
                track_id=track.id,
                temp_file_path=temp_file_path,
                original_filename=uploaded_file.name,
                user_id=user.id
            )
        elif upload_type in ['track_cover', 'album_cover']:
            process_cover_art_upload.delay(
                upload_id=upload_id,
                track_id=track.id if track else None,
                temp_file_path=temp_file_path,
                original_filename=uploaded_file.name,
                user_id=user.id
            )
        
        # Log upload initiation
        AuditLog.objects.create(
            user=user,
            action='upload_initiated',
            resource_type='upload',
            resource_id=upload_id,
            request_data={
                'upload_type': upload_type,
                'filename': uploaded_file.name,
                'file_size': uploaded_file.size,
                'track_id': track.id if track else None,
                'metadata': metadata
            },
            response_data={
                'upload_id': upload_id,
                'status': 'queued'
            },
            status_code=202
        )
        
        payload['message'] = 'Upload initiated successfully'
        payload['data'] = {
            'upload_id': upload_id,
            'status': 'queued',
            'track_id': track.id if track else None,
            'upload_type': upload_type,
            'estimated_processing_time': '2-5 minutes',
            'status_check_url': f'/api/artists/upload-status/{upload_id}/'
        }
        return Response(payload, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        payload['message'] = 'Upload initiation failed'
        payload['errors'] = {'general': [str(e)]}
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_upload_status(request, upload_id):
    """
    Get real-time status of upload processing
    """
    payload = {'message': '', 'data': {}, 'errors': {}}
    
    try:
        user = request.user
        
        # Get upload status record
        try:
            upload_status = UploadProcessingStatus.objects.get(
                upload_id=upload_id,
                user=user
            )
        except UploadProcessingStatus.DoesNotExist:
            payload['message'] = 'Upload not found or access denied'
            payload['errors'] = {'upload_id': ['Upload not found or you do not have permission to view it']}
            return Response(payload, status=status.HTTP_404_NOT_FOUND)
        
        # Get track/album details if available
        entity_details = None
        if upload_status.entity_id and upload_status.entity_type == 'track':
            try:
                track = Track.objects.get(id=upload_status.entity_id)
                entity_details = {
                    'id': track.id,
                    'title': track.title,
                    'processing_status': track.processing_status,
                    'can_be_published': track.can_be_published(),
                    'contributor_splits_valid': track.validate_contributor_splits()[0],
                    'audio_file_url': track.audio_file.url if track.audio_file else None,
                    'cover_art_url': track.cover_art.url if track.cover_art else None,
                }
            except Track.DoesNotExist:
                pass
        
        payload['message'] = 'Upload status retrieved successfully'
        payload['data'] = {
            'upload_id': upload_id,
            'status': upload_status.status,
            'progress_percentage': upload_status.progress_percentage,
            'current_step': upload_status.current_step,
            'upload_type': upload_status.upload_type,
            'original_filename': upload_status.original_filename,
            'file_size': upload_status.file_size,
            'error_message': upload_status.error_message,
            'created_at': upload_status.created_at.isoformat(),
            'started_at': upload_status.started_at.isoformat() if upload_status.started_at else None,
            'completed_at': upload_status.completed_at.isoformat() if upload_status.completed_at else None,
            'entity_details': entity_details,
            'metadata': upload_status.metadata
        }
        return Response(payload, status=status.HTTP_200_OK)
        
    except Exception as e:
        payload['message'] = 'Failed to retrieve upload status'
        payload['errors'] = {'general': [str(e)]}
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_uploads(request):
    """
    Get all uploads for the current user with pagination
    """
    payload = {'message': '', 'data': {}, 'errors': {}}
    
    try:
        user = request.user
        
        # Get query parameters
        page = int(request.GET.get('page', 1))
        page_size = min(int(request.GET.get('page_size', 20)), 100)  # Max 100 per page
        status_filter = request.GET.get('status')  # Filter by status
        upload_type_filter = request.GET.get('upload_type')  # Filter by upload type
        
        # Build query
        uploads_query = UploadProcessingStatus.objects.filter(user=user)
        
        if status_filter:
            uploads_query = uploads_query.filter(status=status_filter)
        
        if upload_type_filter:
            uploads_query = uploads_query.filter(upload_type=upload_type_filter)
        
        # Order by creation date (newest first)
        uploads_query = uploads_query.order_by('-created_at')
        
        # Pagination
        total_count = uploads_query.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        uploads = uploads_query[start_index:end_index]
        
        # Serialize uploads
        uploads_data = []
        for upload in uploads:
            entity_details = None
            if upload.entity_id and upload.entity_type == 'track':
                try:
                    track = Track.objects.get(id=upload.entity_id)
                    entity_details = {
                        'id': track.id,
                        'title': track.title,
                        'processing_status': track.processing_status,
                    }
                except Track.DoesNotExist:
                    pass
            
            uploads_data.append({
                'upload_id': upload.upload_id,
                'status': upload.status,
                'progress_percentage': upload.progress_percentage,
                'current_step': upload.current_step,
                'upload_type': upload.upload_type,
                'original_filename': upload.original_filename,
                'file_size': upload.file_size,
                'error_message': upload.error_message,
                'created_at': upload.created_at.isoformat(),
                'completed_at': upload.completed_at.isoformat() if upload.completed_at else None,
                'entity_details': entity_details,
            })
        
        payload['message'] = 'Uploads retrieved successfully'
        payload['data'] = {
            'uploads': uploads_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size,
                'has_next': end_index < total_count,
                'has_previous': page > 1
            }
        }
        return Response(payload, status=status.HTTP_200_OK)
        
    except Exception as e:
        payload['message'] = 'Failed to retrieve uploads'
        payload['errors'] = {'general': [str(e)]}
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_track_contributors(request, track_id):
    """
    Update contributor splits for a track with background processing
    """
    payload = {'message': '', 'data': {}, 'errors': {}}
    
    try:
        user = request.user
        
        # Verify user is an artist and owns the track
        try:
            artist = Artist.objects.get(user=user)
            track = Track.objects.get(id=track_id, artist=artist)
        except (Artist.DoesNotExist, Track.DoesNotExist):
            payload['message'] = 'Track not found or access denied'
            payload['errors'] = {'track_id': ['Track not found or you do not have permission to modify it']}
            return Response(payload, status=status.HTTP_404_NOT_FOUND)
        
        # Get contributors data
        contributors_data = request.data.get('contributors', [])
        
        if not contributors_data:
            payload['message'] = 'Contributors data is required'
            payload['errors'] = {'contributors': ['This field is required']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate contributors data structure
        for i, contributor in enumerate(contributors_data):
            required_fields = ['user_id', 'role', 'percent_split']
            for field in required_fields:
                if field not in contributor:
                    payload['message'] = f'Missing required field: {field}'
                    payload['errors'] = {'contributors': [f'Contributor {i+1} missing required field: {field}']}
                    return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        # Queue background task for contributor update
        task_result = update_contributor_splits.delay(
            track_id=track_id,
            contributors_data=contributors_data,
            user_id=user.id
        )
        
        # Log contributor update initiation
        AuditLog.objects.create(
            user=user,
            action='contributor_update_initiated',
            resource_type='track',
            resource_id=str(track.track_id),
            request_data={
                'track_title': track.title,
                'contributors_count': len(contributors_data),
                'task_id': task_result.id
            },
            response_data={
                'success': True,
                'task_id': task_result.id
            },
            status_code=202
        )
        
        payload['message'] = 'Contributor update initiated successfully'
        payload['data'] = {
            'track_id': track_id,
            'task_id': task_result.id,
            'contributors_count': len(contributors_data),
            'status': 'processing'
        }
        return Response(payload, status=status.HTTP_202_ACCEPTED)
        
    except Exception as e:
        payload['message'] = 'Failed to update contributors'
        payload['errors'] = {'general': [str(e)]}
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def cancel_upload(request, upload_id):
    """
    Cancel an ongoing upload process
    """
    payload = {'message': '', 'data': {}, 'errors': {}}
    
    try:
        user = request.user
        
        # Get upload status record
        try:
            upload_status = UploadProcessingStatus.objects.get(
                upload_id=upload_id,
                user=user
            )
        except UploadProcessingStatus.DoesNotExist:
            payload['message'] = 'Upload not found or access denied'
            payload['errors'] = {'upload_id': ['Upload not found or you do not have permission to cancel it']}
            return Response(payload, status=status.HTTP_404_NOT_FOUND)
        
        # Check if upload can be cancelled
        if upload_status.status in ['completed', 'failed', 'cancelled']:
            payload['message'] = 'Upload cannot be cancelled'
            payload['errors'] = {'status': [f'Upload is already {upload_status.status}']}
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)
        
        # Update status to cancelled
        upload_status.status = 'cancelled'
        upload_status.completed_at = timezone.now()
        upload_status.save()
        
        # Log cancellation
        AuditLog.objects.create(
            user=user,
            action='upload_cancelled',
            resource_type='upload',
            resource_id=upload_id,
            request_data={
                'upload_type': upload_status.upload_type,
                'original_filename': upload_status.original_filename
            },
            response_data={
                'success': True,
                'cancelled_at': upload_status.completed_at.isoformat()
            },
            status_code=200
        )
        
        payload['message'] = 'Upload cancelled successfully'
        payload['data'] = {
            'upload_id': upload_id,
            'status': 'cancelled',
            'cancelled_at': upload_status.completed_at.isoformat()
        }
        return Response(payload, status=status.HTTP_200_OK)
        
    except Exception as e:
        payload['message'] = 'Failed to cancel upload'
        payload['errors'] = {'general': [str(e)]}
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)