import uuid
import os
import hashlib
import mimetypes
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.core.exceptions import ValidationError
from django.db.models import Sum
from django.utils import timezone

from core.utils import unique_artist_id_generator, unique_contributor_id_generator, unique_track_id_generator
from fan.models import Fan

User = get_user_model()


def validate_audio_file_size(file):
    """Validate audio file size - max 100MB"""
    max_size = 100 * 1024 * 1024  # 100MB
    if file.size > max_size:
        raise ValidationError(f'Audio file size cannot exceed {max_size // (1024*1024)}MB')


def validate_audio_file_type(file):
    """Validate audio file type for security"""
    allowed_types = {
        'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac',
        'audio/mp4', 'audio/aac', 'audio/ogg'
    }
    
    content_type = file.content_type or mimetypes.guess_type(file.name)[0]
    if content_type not in allowed_types:
        raise ValidationError(f'Audio file type {content_type} is not allowed')
    
    # Check file extension
    _, ext = os.path.splitext(file.name.lower())
    dangerous_extensions = {'.exe', '.bat', '.cmd', '.php', '.js', '.py'}
    if ext in dangerous_extensions:
        raise ValidationError(f'File extension {ext} is not allowed for security reasons')


def validate_image_file_size(file):
    """Validate image file size - max 10MB"""
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        raise ValidationError(f'Image file size cannot exceed {max_size // (1024*1024)}MB')


def validate_image_file_type(file):
    """Validate image file type for security"""
    allowed_types = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
    
    content_type = file.content_type or mimetypes.guess_type(file.name)[0]
    if content_type not in allowed_types:
        raise ValidationError(f'Image file type {content_type} is not allowed')
    
    # Basic image validation
    if hasattr(file, 'content_type') and file.content_type.startswith('image/'):
        try:
            from PIL import Image
            file.seek(0)
            img = Image.open(file)
            img.verify()
            file.seek(0)
        except Exception:
            raise ValidationError('Invalid or corrupted image file')


def secure_audio_upload_path(instance, filename):
    """Generate secure upload path for audio files"""
    name, ext = os.path.splitext(filename)
    safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).rstrip()
    
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    unique_id = hashlib.md5(f"{safe_name}{timestamp}".encode()).hexdigest()[:8]
    final_filename = f"{safe_name}_{timestamp}_{unique_id}{ext}"
    
    artist_id = instance.artist.id if hasattr(instance, 'artist') else 'unknown'
    return f"media/{artist_id}/audio/{final_filename}"


def secure_image_upload_path(instance, filename):
    """Generate secure upload path for image files"""
    name, ext = os.path.splitext(filename)
    safe_name = "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).rstrip()
    
    timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
    unique_id = hashlib.md5(f"{safe_name}{timestamp}".encode()).hexdigest()[:8]
    final_filename = f"{safe_name}_{timestamp}_{unique_id}{ext}"
    
    if hasattr(instance, 'artist'):
        artist_id = instance.artist.id
        entity_type = 'tracks' if instance.__class__.__name__ == 'Track' else 'albums'
    else:
        artist_id = 'unknown'
        entity_type = 'images'
    
    return f"media/{artist_id}/{entity_type}/covers/{final_filename}"


class Artist(models.Model):
    ONBOARDING_STEPS = [
        ('profile', 'Complete Profile'),
        ('social-media', 'Social Media'),
        ('payment', 'Add Payment Info'),
        ('publisher', 'Add Publisher'),
        ('track', 'Upload Track'),
        ('done', 'Onboarding Complete'),
    ]

    artist_id = models.CharField(max_length=255, blank=True, null=True,  default=uuid.uuid4, unique=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='artists')
    stage_name = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    total_earnings = models.CharField(max_length=255, blank=True, null=True)

    spotify_url = models.URLField(blank=True, null=True)
    shazam_url = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)

    bank_account = models.CharField(max_length=100,  null=True, blank=True)
    momo_account = models.CharField(max_length=100,  null=True, blank=True)


    followers = models.ManyToManyField(Fan, blank=True, related_name='followers')
    verified = models.BooleanField(default=False)

    region = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)

    publisher = models.ForeignKey('publishers.PublisherProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='artist_publishers')
    self_published = models.BooleanField(default=True)  # Auto-set for direct registrations
    royalty_collection_method = models.CharField(
        max_length=20, 
        choices=[
            ('direct', 'Direct Collection'),
            ('publisher', 'Through Publisher'),
            ('pro', 'Through PRO'),
        ], 
        default='direct'
    )
    publisher_relationship_status = models.CharField(
        max_length=20, 
        choices=[
            ('independent', 'Independent'),
            ('pending', 'Pending Publisher Approval'),
            ('signed', 'Signed with Publisher'),
            ('terminated', 'Terminated Relationship'),
        ], 
        default='independent'
    )

    location_name = models.CharField(max_length=900, null=True, blank=True)
    lat = models.DecimalField(default=0.0, max_digits=50, decimal_places=20, null=True, blank=True)
    lng = models.DecimalField(default=0.0, max_digits=50, decimal_places=20, null=True, blank=True)

    onboarding_step = models.CharField(max_length=20, choices=ONBOARDING_STEPS, default='profile')

    profile_completed = models.BooleanField(default=False)
    social_media_added = models.BooleanField(default=False)
    payment_info_added = models.BooleanField(default=False)
    publisher_added = models.BooleanField(default=False)
    track_uploaded = models.BooleanField(default=False)


    is_archived = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_next_onboarding_step(self):
        if not self.profile_completed:
            return 'profile'
        elif not self.social_media_added:
            return 'social-media'
        elif not self.payment_info_added:
            return 'payment'
        elif not self.publisher_added:
            return 'publisher'
        #elif not self.track_uploaded:
        #    return 'track'
        return 'done'
    
    def update_publisher_relationship(self, publisher=None, relationship_type='signed'):
        """Update artist's publisher relationship and collection method"""
        if publisher:
            self.publisher = publisher
            self.self_published = False
            self.royalty_collection_method = 'publisher'
            self.publisher_relationship_status = relationship_type
        else:
            self.publisher = None
            self.self_published = True
            self.royalty_collection_method = 'direct'
            self.publisher_relationship_status = 'independent'
        self.save()
    
    def save(self, *args, **kwargs):
        # Auto-set self_published based on publisher relationship
        if not self.publisher:
            self.self_published = True
            self.royalty_collection_method = 'direct'
            self.publisher_relationship_status = 'independent'
        else:
            self.self_published = False
            if self.royalty_collection_method == 'direct':
                self.royalty_collection_method = 'publisher'
        
        super().save(*args, **kwargs)

    

# def pre_save_artist_id_receiver(sender, instance, *args, **kwargs):
#     if not instance.artist_id:
#         instance.artist_id = unique_artist_id_generator(instance)
# 
# pre_save.connect(pre_save_artist_id_receiver, sender=Artist)





class Genre(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=100)
    
    
    is_archived = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name



def get_default_album_cover_image():
    return "defaults/default_album_cover_image.png"



class Album(models.Model):

    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    release_date = models.DateField(null=True, blank=True)
    cover_art = models.ImageField(
        upload_to=secure_image_upload_path, 
        default=get_default_album_cover_image,
        validators=[validate_image_file_size, validate_image_file_type]
    )
    upc_code = models.CharField(null=True, max_length=30, unique=True, help_text="Universal Product Code")
    
    publisher = models.ForeignKey('publishers.PublisherProfile', on_delete=models.SET_NULL, null=True, related_name='album_publishers')

    # Enhanced security fields
    cover_art_hash = models.CharField(max_length=64, null=True, blank=True)  # SHA-256 hash
    last_malware_scan = models.DateTimeField(null=True, blank=True)

    is_archived = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.artist.stage_name}"
    
    def verify_cover_art_integrity(self):
        """Verify cover art integrity using stored hash"""
        if not self.cover_art or not self.cover_art_hash:
            return True  # No cover art or hash is valid
        
        try:
            self.cover_art.seek(0)
            file_content = self.cover_art.read()
            current_hash = hashlib.sha256(file_content).hexdigest()
            self.cover_art.seek(0)
            return current_hash == self.cover_art_hash
        except Exception:
            return False
    
    def save(self, *args, **kwargs):
        # Generate cover art hash if not present
        if self.cover_art and not self.cover_art_hash:
            try:
                self.cover_art.seek(0)
                file_content = self.cover_art.read()
                self.cover_art_hash = hashlib.sha256(file_content).hexdigest()
                self.cover_art.seek(0)
            except Exception:
                pass
        
        super().save(*args, **kwargs)
    



class ArtistGenre(models.Model):
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="artist_genre")
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE)
    
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.artist.stage_name} - {self.genre.name}"


def get_default_track_cover_image():
    return "defaults/default_track_cover_image.png"


STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

class Track(models.Model):
    track_id = models.CharField(max_length=255, blank=True, null=True, unique=True)

    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)

    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True)
    
    cover_art = models.ImageField(
        upload_to=secure_image_upload_path, 
        default=get_default_track_cover_image,
        validators=[validate_image_file_size, validate_image_file_type]
    )

    audio_file = models.FileField(
        upload_to=secure_audio_upload_path,
        validators=[validate_audio_file_size, validate_audio_file_type]
    )
    
    audio_file_mp3 = models.FileField(
        upload_to=secure_audio_upload_path, 
        null=True, 
        blank=True,
        validators=[validate_audio_file_size, validate_audio_file_type]
    )
    audio_file_wav = models.FileField(
        upload_to=secure_audio_upload_path, 
        null=True, 
        blank=True,
        validators=[validate_audio_file_size, validate_audio_file_type]
    )

    release_date = models.DateField(blank=True, null=True)
    isrc_code = models.CharField(max_length=30, unique=True, null=True, blank=True, help_text="International Standard Recording Code")
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True)
    duration = models.DurationField(help_text="Track length", null=True, blank=True)
    lyrics = models.TextField(blank=True, null=True)
    explicit = models.BooleanField(default=False)

    publisher = models.ForeignKey('publishers.PublisherProfile', on_delete=models.SET_NULL, null=True, related_name='track_publishers')

    # Enhanced security and processing fields
    audio_file_hash = models.CharField(max_length=64, null=True, blank=True)  # SHA-256 hash
    cover_art_hash = models.CharField(max_length=64, null=True, blank=True)  # SHA-256 hash
    processing_status = models.CharField(
        max_length=20, 
        choices=[
            ('pending', 'Pending'),
            ('queued', 'Queued'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed')
        ],
        default='pending'
    )
    processing_error = models.TextField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Security scanning fields
    last_malware_scan = models.DateTimeField(null=True, blank=True)
    is_quarantined = models.BooleanField(default=False)
    quarantine_reason = models.TextField(null=True, blank=True)

    fingerprinted = models.BooleanField(default=False)
    royalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Pending")

    is_archived = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_royalty(self, duration):
        rate_per_second = 0.01  # Example: 1 cent per second
        duration_seconds = duration.total_seconds()
        royalty_amount = duration_seconds * rate_per_second
        return round(royalty_amount, 2)
    
    def validate_contributor_splits(self):
        """Validate that contributor splits total 100%"""
        is_valid, total = Contributor.validate_track_splits(self)
        return is_valid, total
    
    def get_contributor_splits_summary(self):
        """Get summary of contributor splits for this track"""
        contributors = self.contributors.filter(active=True)
        splits = []
        total = 0
        
        for contributor in contributors:
            splits.append({
                'user': contributor.user,
                'role': contributor.role,
                'percentage': contributor.percent_split,
                'publisher': contributor.publisher
            })
            total += contributor.percent_split
        
        return {
            'contributors': splits,
            'total_percentage': total,
            'is_valid': total == 100
        }
    
    def can_be_published(self):
        """Check if track can be published (has valid splits and required metadata)"""
        splits_valid, _ = self.validate_contributor_splits()
        has_required_metadata = bool(self.title and self.artist and self.audio_file)
        processing_complete = self.processing_status == 'completed'
        not_quarantined = not self.is_quarantined
        
        return splits_valid and has_required_metadata and processing_complete and not_quarantined
    
    def verify_audio_integrity(self):
        """Verify audio file integrity using stored hash"""
        if not self.audio_file or not self.audio_file_hash:
            return False
        
        try:
            self.audio_file.seek(0)
            file_content = self.audio_file.read()
            current_hash = hashlib.sha256(file_content).hexdigest()
            self.audio_file.seek(0)
            return current_hash == self.audio_file_hash
        except Exception:
            return False
    
    def verify_cover_art_integrity(self):
        """Verify cover art integrity using stored hash"""
        if not self.cover_art or not self.cover_art_hash:
            return True  # No cover art is valid
        
        try:
            self.cover_art.seek(0)
            file_content = self.cover_art.read()
            current_hash = hashlib.sha256(file_content).hexdigest()
            self.cover_art.seek(0)
            return current_hash == self.cover_art_hash
        except Exception:
            return False
    
    def save(self, *args, **kwargs):
        # Generate file hashes if not present
        if self.audio_file and not self.audio_file_hash:
            try:
                self.audio_file.seek(0)
                file_content = self.audio_file.read()
                self.audio_file_hash = hashlib.sha256(file_content).hexdigest()
                self.audio_file.seek(0)
            except Exception:
                pass
        
        if self.cover_art and not self.cover_art_hash:
            try:
                self.cover_art.seek(0)
                file_content = self.cover_art.read()
                self.cover_art_hash = hashlib.sha256(file_content).hexdigest()
                self.cover_art.seek(0)
            except Exception:
                pass
        
        super().save(*args, **kwargs)



def pre_save_track_id_receiver(sender, instance, *args, **kwargs):
    if not instance.track_id:
        instance.track_id = unique_track_id_generator(instance)

pre_save.connect(pre_save_track_id_receiver, sender=Track)



    

class Contributor(models.Model):
    ROLE_CHOICES = [
        ('Composer', 'Composer'),
        ('Producer', 'Producer'),
        ('Writer', 'Writer'),
        ('Featured Artist', 'Featured Artist'),
        ('Mixer', 'Mixer'),
        ('Engineer', 'Engineer'),
    ]

    contributor_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contributor')

    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='contributors')
    percent_split = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    publisher = models.ForeignKey('publishers.PublisherProfile', on_delete=models.SET_NULL, null=True, related_name='contributor_publishers')

    is_archived = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        user = getattr(self, 'user', None)
        first = getattr(user, 'first_name', '') if user else ''
        last = getattr(user, 'last_name', '') if user else ''
        username = getattr(user, 'username', '') if user else ''
        email = getattr(user, 'email', '') if user else ''
        name = (f"{first} {last}".strip() or username or email or "Contributor")
        return f"{name} ({self.role}) on {self.track.title}"
    
    def clean(self):
        """Validate that contributor splits for a track don't exceed 100%"""
        if self.track_id:
            # Get total splits for this track excluding current contributor
            total_splits = Contributor.objects.filter(
                track=self.track, 
                active=True
            ).exclude(id=self.id).aggregate(
                total=Sum('percent_split')
            )['total'] or 0
            
            # Add current contributor's split
            total_splits += self.percent_split
            
            if total_splits > 100:
                raise ValidationError(
                    f'Total contributor splits cannot exceed 100%. Current total: {total_splits}%'
                )
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @classmethod
    def validate_track_splits(cls, track):
        """Validate that all contributor splits for a track total 100%"""
        total_splits = cls.objects.filter(
            track=track, 
            active=True
        ).aggregate(total=Sum('percent_split'))['total'] or 0
        
        return total_splits == 100, total_splits




def pre_save_track_contributor_id_receiver(sender, instance, *args, **kwargs):
    if not instance.contributor_id:
        instance.contributor_id = unique_contributor_id_generator(instance)

pre_save.connect(pre_save_track_contributor_id_receiver, sender=Contributor)





class PlatformAvailability(models.Model):
    PLATFORM_CHOICES = [
        ('Spotify', 'Spotify'),
        ('Shazam', 'Shazam'),
        ('Apple Music', 'Apple Music'),
        ('YouTube Music', 'YouTube Music'),
        ('Tidal', 'Tidal'),
    ]
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    url = models.URLField()
    available = models.BooleanField(default=True)

    is_archived = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.track.title} on {self.platform}"




class TrackFeedback(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="track_feedback")
    fan = models.ForeignKey(Fan, on_delete=models.CASCADE, related_name='fan_feedback')
    feedback = models.TextField(null=True, blank=True)
    rating = models.IntegerField(default=0)

    is_archived = models.BooleanField(default=False)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



#####################
####FINGERPRINTING #####
##################################


class Fingerprint(models.Model):
    """Enhanced fingerprint model with versioning and processing status"""
    PROCESSING_STATUS = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name="fingerprint_track")
    hash = models.CharField(max_length=64, db_index=True)  # Increased length for better hashes
    offset = models.IntegerField()
    
    # Versioning and processing
    version = models.CharField(max_length=10, default='1.0')
    algorithm = models.CharField(max_length=50, default='chromaprint')
    processing_status = models.CharField(max_length=20, choices=PROCESSING_STATUS, default='pending')
    confidence_score = models.DecimalField(max_digits=5, decimal_places=4, default=1.0)
    
    # Enhanced metadata for fingerprint quality and processing details
    metadata = models.JSONField(default=dict, blank=True, help_text="Enhanced fingerprint metadata including quality metrics")
    
    # Legacy metadata fields (kept for backward compatibility)
    duration_ms = models.IntegerField(null=True, blank=True)
    sample_rate = models.IntegerField(null=True, blank=True)
    processing_time_ms = models.IntegerField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    
    # Timestamps
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['hash', 'track_id']),
            models.Index(fields=['version', 'algorithm']),
            models.Index(fields=['processing_status']),
        ]
        unique_together = ('track', 'offset', 'hash', 'version')
    
    def __str__(self):
        return f"Fingerprint for {self.track.title} (v{self.version})"
    
    def mark_completed(self, confidence=1.0, processing_time=None):
        """Mark fingerprint processing as completed"""
        self.processing_status = 'completed'
        self.confidence_score = confidence
        if processing_time:
            self.processing_time_ms = processing_time
        self.save()
    
    def mark_failed(self, error_message):
        """Mark fingerprint processing as failed"""
        self.processing_status = 'failed'
        self.error_message = error_message
        self.save()


# Invitation sent by a Publisher to invite an Artist onto the platform
class ArtistInvitation(models.Model):
    invited_by = models.ForeignKey('publishers.PublisherProfile', on_delete=models.CASCADE, related_name='artist_invitations')
    email = models.EmailField()
    stage_name = models.CharField(max_length=255, null=True, blank=True)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')], default='pending')
    sent_on = models.DateTimeField(auto_now_add=True)

    is_archived = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        from publishers.models import PublisherProfile
        publisher = getattr(self, 'invited_by', None)
        name = None
        if publisher:
            name = getattr(publisher, 'company_name', None) or getattr(getattr(publisher, 'user', None), 'email', None)
        return f"Invite to {self.email} by {name or 'Publisher'}"
