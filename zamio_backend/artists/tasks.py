"""
Celery tasks for artists media file processing
"""
import os
import tempfile
from typing import Dict, Any
from celery import shared_task
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils import timezone
from django.db import models
from accounts.models import User, AuditLog
from artists.models import Track, Album
from artists.services.media_file_service import MediaFileService


@shared_task(bind=True)
def process_media_upload(self, upload_data: Dict[str, Any], file_content: bytes):
    """
    Process media file upload with validation, storage, and metadata extraction
    
    Args:
        upload_data: Upload metadata and configuration
        file_content: Raw file content bytes
        
    Returns:
        Dict with processing results
    """
    try:
        # Update progress
        self.update_state(state='PROGRESS', meta={'progress': 10, 'status': 'Starting processing'})
        
        user_id = upload_data['user_id']
        user = User.objects.get(id=user_id)
        
        # Create temporary file for processing
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{upload_data['original_filename'].split('.')[-1]}") as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        try:
            # Update progress
            self.update_state(state='PROGRESS', meta={'progress': 30, 'status': 'Validating file'})
            
            # Additional validation on the actual file
            file_obj = ContentFile(file_content, name=upload_data['original_filename'])
            MediaFileService.validate_media_file(file_obj, upload_data['media_type'])
            
            # Update progress
            self.update_state(state='PROGRESS', meta={'progress': 50, 'status': 'Extracting metadata'})
            
            # Extract metadata for audio files
            extracted_metadata = {}
            if upload_data['media_type'] == 'audio':
                extracted_metadata = MediaFileService.extract_audio_metadata(temp_file_path)
            
            # Update progress
            self.update_state(state='PROGRESS', meta={'progress': 70, 'status': 'Storing file'})
            
            # Generate secure storage path
            if upload_data['entity_type'] == 'track':
                if upload_data['entity_id']:
                    track = Track.objects.get(id=upload_data['entity_id'])
                else:
                    # Create new track placeholder
                    from artists.models import Artist
                    artist = Artist.objects.get(user=user)
                    track = Track.objects.create(
                        title=upload_data.get('metadata', {}).get('title', 'Untitled'),
                        artist=artist,
                        status='Pending'
                    )
                
                storage_path = MediaFileService.generate_secure_media_path(
                    track, upload_data['original_filename'], upload_data['media_type']
                )
            else:  # album
                if upload_data['entity_id']:
                    album = Album.objects.get(id=upload_data['entity_id'])
                else:
                    # Create new album placeholder
                    from artists.models import Artist
                    artist = Artist.objects.get(user=user)
                    album = Album.objects.create(
                        title=upload_data.get('metadata', {}).get('title', 'Untitled Album'),
                        artist=artist
                    )
                
                storage_path = MediaFileService.generate_secure_media_path(
                    album, upload_data['original_filename'], 'image'
                )
            
            # Store file securely
            stored_path = default_storage.save(storage_path, file_obj)
            
            # Update progress
            self.update_state(state='PROGRESS', meta={'progress': 90, 'status': 'Updating database'})
            
            # Update the model with file information
            if upload_data['entity_type'] == 'track':
                _update_track_with_media(track, stored_path, upload_data, extracted_metadata)
            else:
                _update_album_with_media(album, stored_path, upload_data)
            
            # Log successful processing
            AuditLog.objects.create(
                user=user,
                action='media_upload_completed',
                resource_type=f"{upload_data['entity_type']}_media",
                resource_id=str(upload_data['entity_id']) if upload_data['entity_id'] else str(track.id if upload_data['entity_type'] == 'track' else album.id),
                request_data={
                    'filename': upload_data['original_filename'],
                    'stored_path': stored_path,
                    'file_size': upload_data['file_size'],
                    'processing_time': (timezone.now() - timezone.datetime.fromisoformat(upload_data['uploaded_at'])).total_seconds()
                }
            )
            
            return {
                'status': 'completed',
                'message': 'Media file processed successfully',
                'entity_id': track.id if upload_data['entity_type'] == 'track' else album.id,
                'stored_path': stored_path,
                'metadata': extracted_metadata,
                'file_hash': upload_data['file_hash']
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except Exception as e:
        # Log error
        try:
            user = User.objects.get(id=upload_data['user_id'])
            AuditLog.objects.create(
                user=user,
                action='media_upload_failed',
                resource_type=f"{upload_data['entity_type']}_media",
                resource_id=str(upload_data.get('entity_id', 'unknown')),
                request_data={
                    'filename': upload_data['original_filename'],
                    'error': str(e),
                    'file_size': upload_data['file_size']
                }
            )
        except:
            pass  # Don't fail the task if logging fails
        
        return {
            'status': 'failed',
            'message': f'Media file processing failed: {str(e)}',
            'error': str(e)
        }


def _update_track_with_media(track: Track, stored_path: str, upload_data: Dict, metadata: Dict):
    """Update track model with media file information"""
    media_type = upload_data['media_type']
    
    if media_type == 'audio':
        # Determine which audio field to update based on file type
        content_type = upload_data['content_type']
        if 'mp3' in content_type or 'mpeg' in content_type:
            track.audio_file_mp3 = stored_path
        elif 'wav' in content_type:
            track.audio_file_wav = stored_path
        else:
            track.audio_file = stored_path
        
        # Update duration if extracted from metadata
        if metadata.get('duration'):
            from datetime import timedelta
            track.duration = timedelta(seconds=int(metadata['duration']))
    
    elif media_type == 'image':
        track.cover_art = stored_path
    
    # Update metadata fields
    if upload_data.get('metadata'):
        metadata_dict = upload_data['metadata']
        if metadata_dict.get('title'):
            track.title = metadata_dict['title']
        if metadata_dict.get('explicit') is not None:
            track.explicit = metadata_dict['explicit']
        if metadata_dict.get('lyrics'):
            track.lyrics = metadata_dict['lyrics']
    
    track.save()


def _update_album_with_media(album: Album, stored_path: str, upload_data: Dict):
    """Update album model with media file information"""
    if upload_data['media_type'] == 'image':
        album.cover_art = stored_path
    
    # Update metadata fields
    if upload_data.get('metadata'):
        metadata_dict = upload_data['metadata']
        if metadata_dict.get('title'):
            album.title = metadata_dict['title']
        if metadata_dict.get('release_date'):
            album.release_date = metadata_dict['release_date']
    
    album.save()


@shared_task
def generate_audio_fingerprint(track_id: int):
    """
    Generate audio fingerprint for a track (placeholder for future implementation)
    
    Args:
        track_id: ID of the track to fingerprint
    """
    try:
        track = Track.objects.get(id=track_id)
        
        # Placeholder for fingerprinting logic
        # This would integrate with the existing fingerprinting system
        
        track.fingerprinted = True
        track.save()
        
        # Log fingerprinting completion
        AuditLog.objects.create(
            user=track.artist.user,
            action='audio_fingerprint_generated',
            resource_type='track',
            resource_id=str(track_id),
            request_data={
                'track_title': track.title,
                'artist': track.artist.stage_name
            }
        )
        
        return {
            'status': 'completed',
            'message': f'Fingerprint generated for track: {track.title}'
        }
        
    except Track.DoesNotExist:
        return {
            'status': 'failed',
            'message': f'Track with ID {track_id} not found'
        }
    except Exception as e:
        return {
            'status': 'failed',
            'message': f'Fingerprinting failed: {str(e)}'
        }


@shared_task
def verify_media_file_integrity():
    """
    Comprehensive task to verify integrity of all media files using SHA-256 hashes
    """
    from datetime import timedelta
    
    integrity_results = {
        'tracks_checked': 0,
        'albums_checked': 0,
        'integrity_failures': 0,
        'quarantined_files': 0,
        'results': []
    }
    
    # Check tracks that haven't been verified recently (within 30 days)
    cutoff_time = timezone.now() - timedelta(days=30)
    tracks_to_verify = Track.objects.filter(
        models.Q(updated_at__gte=cutoff_time) | models.Q(audio_file_hash__isnull=False)
    ).exclude(is_quarantined=True)[:200]  # Limit to 200 tracks per run
    
    for track in tracks_to_verify:
        track_result = {
            'track_id': track.id,
            'track_title': track.title,
            'integrity_checks': [],
            'overall_status': 'passed'
        }
        
        # Verify audio file integrity
        if track.audio_file and track.audio_file_hash:
            audio_integrity = track.verify_audio_integrity()
            track_result['integrity_checks'].append({
                'file_type': 'audio',
                'file_path': track.audio_file.name,
                'integrity_passed': audio_integrity,
                'stored_hash': track.audio_file_hash
            })
            
            if not audio_integrity:
                track_result['overall_status'] = 'failed'
                integrity_results['integrity_failures'] += 1
                
                # Log integrity failure
                AuditLog.objects.create(
                    user=track.artist.user,
                    action='media_integrity_failure',
                    resource_type='Track',
                    resource_id=str(track.id),
                    request_data={
                        'track_title': track.title,
                        'file_type': 'audio',
                        'file_path': track.audio_file.name,
                        'stored_hash': track.audio_file_hash,
                        'failure_reason': 'Hash mismatch detected'
                    }
                )
                
                # Quarantine the track
                from artists.services.media_file_service import MediaFileService
                if MediaFileService.quarantine_media_file(track, 'File integrity check failed'):
                    integrity_results['quarantined_files'] += 1
        
        # Verify cover art integrity
        if track.cover_art and track.cover_art_hash:
            cover_integrity = track.verify_cover_art_integrity()
            track_result['integrity_checks'].append({
                'file_type': 'cover_art',
                'file_path': track.cover_art.name,
                'integrity_passed': cover_integrity,
                'stored_hash': track.cover_art_hash
            })
            
            if not cover_integrity:
                track_result['overall_status'] = 'failed'
                integrity_results['integrity_failures'] += 1
                
                # Log integrity failure
                AuditLog.objects.create(
                    user=track.artist.user,
                    action='media_integrity_failure',
                    resource_type='Track',
                    resource_id=str(track.id),
                    request_data={
                        'track_title': track.title,
                        'file_type': 'cover_art',
                        'file_path': track.cover_art.name,
                        'stored_hash': track.cover_art_hash,
                        'failure_reason': 'Hash mismatch detected'
                    }
                )
        
        integrity_results['results'].append(track_result)
        integrity_results['tracks_checked'] += 1
    
    # Check album cover art integrity
    albums_to_verify = Album.objects.filter(
        models.Q(updated_at__gte=cutoff_time) | models.Q(cover_art_hash__isnull=False)
    )[:100]  # Limit to 100 albums per run
    
    for album in albums_to_verify:
        album_result = {
            'album_id': album.id,
            'album_title': album.title,
            'integrity_checks': [],
            'overall_status': 'passed'
        }
        
        if album.cover_art and album.cover_art_hash:
            cover_integrity = album.verify_cover_art_integrity()
            album_result['integrity_checks'].append({
                'file_type': 'cover_art',
                'file_path': album.cover_art.name,
                'integrity_passed': cover_integrity,
                'stored_hash': album.cover_art_hash
            })
            
            if not cover_integrity:
                album_result['overall_status'] = 'failed'
                integrity_results['integrity_failures'] += 1
                
                # Log integrity failure
                AuditLog.objects.create(
                    user=album.artist.user,
                    action='media_integrity_failure',
                    resource_type='Album',
                    resource_id=str(album.id),
                    request_data={
                        'album_title': album.title,
                        'file_type': 'cover_art',
                        'file_path': album.cover_art.name,
                        'stored_hash': album.cover_art_hash,
                        'failure_reason': 'Hash mismatch detected'
                    }
                )
        
        integrity_results['results'].append(album_result)
        integrity_results['albums_checked'] += 1
    
    # Log integrity check completion
    AuditLog.objects.create(
        user=None,  # System task
        action='media_integrity_check_completed',
        resource_type='System',
        resource_id='integrity_checker',
        request_data={
            'check_summary': {
                'tracks_checked': integrity_results['tracks_checked'],
                'albums_checked': integrity_results['albums_checked'],
                'integrity_failures': integrity_results['integrity_failures'],
                'quarantined_files': integrity_results['quarantined_files']
            },
            'check_timestamp': timezone.now().isoformat()
        }
    )
    
    return integrity_results


@shared_task
def cleanup_failed_uploads():
    """
    Periodic task to clean up failed or abandoned uploads
    """
    from datetime import timedelta
    
    cleanup_results = {
        'cleaned_tracks': 0,
        'cleaned_albums': 0,
        'freed_space_mb': 0,
        'errors': []
    }
    
    # Clean up tracks that failed processing more than 24 hours ago
    cutoff_time = timezone.now() - timedelta(hours=24)
    failed_tracks = Track.objects.filter(
        processing_status='failed',
        updated_at__lt=cutoff_time
    )
    
    for track in failed_tracks:
        try:
            # Calculate file sizes before deletion
            total_size = 0
            if track.audio_file:
                try:
                    total_size += track.audio_file.size
                except:
                    pass
            if track.cover_art:
                try:
                    total_size += track.cover_art.size
                except:
                    pass
            
            # Log cleanup action
            AuditLog.objects.create(
                user=track.artist.user,
                action='failed_upload_cleanup',
                resource_type='Track',
                resource_id=str(track.id),
                request_data={
                    'track_title': track.title,
                    'processing_status': track.processing_status,
                    'processing_error': track.processing_error,
                    'file_size_mb': round(total_size / (1024 * 1024), 2) if total_size else 0
                }
            )
            
            # Delete the track (files will be deleted automatically)
            track.delete()
            
            cleanup_results['cleaned_tracks'] += 1
            cleanup_results['freed_space_mb'] += round(total_size / (1024 * 1024), 2) if total_size else 0
            
        except Exception as e:
            cleanup_results['errors'].append(f'Failed to clean track {track.id}: {str(e)}')
    
    # Clean up albums with failed cover art uploads
    failed_albums = Album.objects.filter(
        cover_art__isnull=True,
        updated_at__lt=cutoff_time
    ).filter(track__isnull=True)  # Only albums with no tracks
    
    for album in failed_albums:
        try:
            # Log cleanup action
            AuditLog.objects.create(
                user=album.artist.user,
                action='failed_upload_cleanup',
                resource_type='Album',
                resource_id=str(album.id),
                request_data={
                    'album_title': album.title,
                    'reason': 'Empty album with no cover art'
                }
            )
            
            album.delete()
            cleanup_results['cleaned_albums'] += 1
            
        except Exception as e:
            cleanup_results['errors'].append(f'Failed to clean album {album.id}: {str(e)}')
    
    return cleanup_results