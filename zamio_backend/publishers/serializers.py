from django.contrib.auth import get_user_model
from rest_framework import serializers

from datetime import timedelta

from django.utils import timezone

from music_monitor.models import MatchCache, PlayLog, StreamLog, Dispute
from .models import PublisherProfile, PublishingAgreement


User = get_user_model()




class AllPublishersSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField()
    registered_on = serializers.SerializerMethodField()


    class Meta:
        model = PublisherProfile
        fields = ["publisher_id", "stage_name","total_earnings", "photo", "registered_on"]

    def get_photo(self, obj):
        return obj.user.photo.url if obj.user else None

    def get_registered_on(self, obj):
        return obj.user.timestamp if obj.user else None


class PublisherDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = PublisherProfile
        fields = "__all__"



class PublisherPlayLogSerializer(serializers.ModelSerializer):
    track_title = serializers.CharField(source='track.title', read_only=True)
    artist = serializers.SerializerMethodField()
    publisher_catalog_id = serializers.SerializerMethodField()
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_region = serializers.SerializerMethodField()
    matched_at = serializers.SerializerMethodField()
    stop_time = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    plays = serializers.SerializerMethodField()
    royalty_amount = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    license_type = serializers.SerializerMethodField()
    territory = serializers.SerializerMethodField()

    class Meta:
        model = PlayLog
        fields = [
            'id',
            'track_title',
            'artist',
            'publisher_catalog_id',
            'station_name',
            'station_region',
            'matched_at',
            'stop_time',
            'duration',
            'plays',
            'royalty_amount',
            'status',
            'license_type',
            'territory',
        ]

    def _format_datetime(self, value):
        if not value:
            return None
        try:
            if timezone.is_naive(value):
                value = timezone.make_aware(value, timezone.get_default_timezone())
            return value.isoformat()
        except Exception:
            try:
                return value.isoformat()
            except Exception:
                return None

    def _format_duration(self, value):
        if not value:
            return None
        if isinstance(value, timedelta):
            total_seconds = int(value.total_seconds())
        else:
            try:
                total_seconds = int(float(value))
            except (TypeError, ValueError):
                return None
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02}:{minutes:02}:{seconds:02}"

    def get_artist(self, obj):
        artist = getattr(obj.track, 'artist', None)
        if not artist:
            return None
        if getattr(artist, 'stage_name', None):
            return artist.stage_name
        user = getattr(artist, 'user', None)
        if user and (user.first_name or user.last_name):
            return f"{user.first_name or ''} {user.last_name or ''}".strip()
        if user and user.username:
            return user.username
        if user and user.email:
            return user.email
        return None

    def get_publisher_catalog_id(self, obj):
        track = getattr(obj, 'track', None)
        if not track:
            return None
        if getattr(track, 'track_id', None):
            return track.track_id
        if getattr(track, 'isrc_code', None):
            return track.isrc_code
        return f"TRK-{track.id}" if getattr(track, 'id', None) else None

    def get_station_region(self, obj):
        station = getattr(obj, 'station', None)
        if not station:
            return None
        if getattr(station, 'region', None):
            return station.region
        return getattr(station, 'country', None)

    def get_matched_at(self, obj):
        return self._format_datetime(
            obj.played_at or obj.start_time or obj.created_at
        )

    def get_stop_time(self, obj):
        return self._format_datetime(obj.stop_time)

    def get_duration(self, obj):
        return self._format_duration(obj.duration)

    def get_plays(self, obj):
        plays = getattr(obj, 'track_total_plays', None)
        if plays is None:
            return 0
        try:
            return int(plays)
        except (TypeError, ValueError):
            return 0

    def get_royalty_amount(self, obj):
        if obj.royalty_amount is None:
            return 0.0
        try:
            return float(obj.royalty_amount)
        except (TypeError, ValueError):
            return 0.0

    def get_status(self, obj):
        try:
            if getattr(obj, 'flagged', False):
                return 'Disputed'
            open_dispute = Dispute.objects.filter(
                playlog=obj,
                is_archived=False,
            ).exclude(dispute_status__iexact='resolved').exists()
            if open_dispute:
                return 'Pending'
            if getattr(obj, 'claimed', False):
                return 'Confirmed'
        except Exception:
            return 'Pending'
        return 'Confirmed'

    def get_license_type(self, obj):
        source = (obj.source or '').lower()
        if source == 'streaming':
            return 'Mechanical'
        if source == 'radio':
            return 'Performance'
        return 'Performance'

    def get_territory(self, obj):
        station = getattr(obj, 'station', None)
        if station and getattr(station, 'country', None):
            return station.country
        return 'Ghana'


class PublisherMatchCacheSerializer(serializers.ModelSerializer):
    song = serializers.CharField(source='track.title', read_only=True)
    artist = serializers.SerializerMethodField()
    publisher_catalog_id = serializers.SerializerMethodField()
    station = serializers.CharField(source='station.name', read_only=True)
    station_region = serializers.SerializerMethodField()
    matched_at = serializers.SerializerMethodField()
    confidence = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    license_status = serializers.SerializerMethodField()

    class Meta:
        model = MatchCache
        fields = [
            'id',
            'song',
            'artist',
            'publisher_catalog_id',
            'station',
            'station_region',
            'matched_at',
            'confidence',
            'status',
            'license_status',
        ]

    def _format_datetime(self, value):
        if not value:
            return None
        try:
            if timezone.is_naive(value):
                value = timezone.make_aware(value, timezone.get_default_timezone())
            return value.isoformat()
        except Exception:
            try:
                return value.isoformat()
            except Exception:
                return None

    def get_artist(self, obj):
        artist = getattr(obj.track, 'artist', None)
        if not artist:
            return None
        if getattr(artist, 'stage_name', None):
            return artist.stage_name
        user = getattr(artist, 'user', None)
        if user and (user.first_name or user.last_name):
            return f"{user.first_name or ''} {user.last_name or ''}".strip()
        if user and user.username:
            return user.username
        if user and user.email:
            return user.email
        return None

    def get_publisher_catalog_id(self, obj):
        track = getattr(obj, 'track', None)
        if not track:
            return None
        if getattr(track, 'track_id', None):
            return track.track_id
        if getattr(track, 'isrc_code', None):
            return track.isrc_code
        return f"TRK-{track.id}" if getattr(track, 'id', None) else None

    def get_station_region(self, obj):
        station = getattr(obj, 'station', None)
        if not station:
            return None
        if getattr(station, 'region', None):
            return station.region
        return getattr(station, 'country', None)

    def get_matched_at(self, obj):
        return self._format_datetime(obj.matched_at)

    def get_confidence(self, obj):
        if obj.avg_confidence_score is None:
            return None
        try:
            value = float(obj.avg_confidence_score)
        except (TypeError, ValueError):
            return None
        if value <= 1:
            return round(value * 100, 2)
        return round(value, 2)

    def get_status(self, obj):
        if getattr(obj, 'failed_reason', None):
            return 'Disputed'
        if getattr(obj, 'processed', False):
            return 'Verified'
        return 'Pending'

    def get_license_status(self, obj):
        agreement_exists = PublishingAgreement.objects.filter(
            track=obj.track,
            status__in=['accepted'],
            is_archived=False,
        ).exists()
        return 'Active' if agreement_exists else 'Pending'
    





class PublishingAgreementSerializer(serializers.ModelSerializer):
    track_title = serializers.CharField(source='track.title', read_only=True)
    artist_name = serializers.CharField(source='songwriter.stage_name', read_only=True)
    publisher_name = serializers.CharField(source='publisher.user.first_name', read_only=True)

    class Meta:
        model = PublishingAgreement
        fields = [
            'id', 'publisher', 'publisher_name', 'songwriter', 'artist_name', 'track', 'track_title',
            'writer_share', 'publisher_share', 'contract_file', 'verified_by_admin', 'agreement_date',
            'status', 'is_archived', 'active', 'created_at', 'updated_at'
        ]
