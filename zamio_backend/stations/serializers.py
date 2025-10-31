from rest_framework import serializers

from music_monitor.models import MatchCache, PlayLog, Dispute
from .models import Station, StationProgram, ProgramStaff, StationStaff, Complaint, ComplaintUpdate

# Station Serializer
class AllStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'


class StationDetailsSerializer(serializers.ModelSerializer):
    staff_count = serializers.SerializerMethodField()
    stream_links_count = serializers.SerializerMethodField()
    stream_status_display = serializers.CharField(source='get_stream_status_display', read_only=True)
    
    class Meta:
        model = Station
        fields = '__all__'
    
    def get_staff_count(self, obj):
        return obj.station_staff.filter(is_archived=False, active=True).count()
    
    def get_stream_links_count(self, obj):
        return obj.station_links.filter(is_archived=False, active=True).count()



# Station Program Serializer
class AllStationProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationProgram
        fields = '__all__'

class StationProgramDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationProgram
        fields = '__all__'


# Program Staff Serializer
class ProgramStaffDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramStaff
        fields = '__all__'

class ProgramStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramStaff
        fields = '__all__'





class StationPlayLogSerializer(serializers.ModelSerializer):
    track_title = serializers.CharField(source='track.title', read_only=True)
    artist = serializers.SerializerMethodField()
    station_name = serializers.CharField(source='station.name', read_only=True)
    matched_at = serializers.SerializerMethodField()
    stop_time = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    royalty_amount = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    attribution_source = serializers.SerializerMethodField()
    partner_name = serializers.SerializerMethodField()
    plays = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()
    confidence = serializers.SerializerMethodField()

    class Meta:
        model = PlayLog
        fields = [
            'id',
            'track_title',
            'artist',
            'station_name',
            'matched_at',
            'stop_time',
            'duration',
            'royalty_amount',
            'status',
            'attribution_source',
            'partner_name',
            'plays',
            'source',
            'confidence',
        ]

    def _format_datetime(self, value):
        if not value:
            return None
        return value.strftime('%Y-%m-%d ~ %H:%M:%S')

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

    def get_matched_at(self, obj):
        return self._format_datetime(obj.played_at or obj.start_time or obj.created_at)

    def get_stop_time(self, obj):
        return self._format_datetime(obj.stop_time)

    def get_duration(self, obj):
        if not obj.duration:
            return None
        total_seconds = int(obj.duration.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02}:{minutes:02}:{seconds:02}"

    def get_royalty_amount(self, obj):
        if obj.royalty_amount is None:
            return 0.0
        return float(obj.royalty_amount)

    def get_status(self, obj):
        if getattr(obj, 'flagged', False):
            return 'Flagged'
        if getattr(obj, 'claimed', False):
            return 'Confirmed'
        try:
            if Dispute.objects.filter(playlog=obj, dispute_status='Resolved').exists():
                return 'Resolved'
        except Exception:
            pass
        return 'Pending'

    def get_attribution_source(self, obj):
        try:
            from royalties.models import UsageAttribution
        except Exception:
            return 'Local'

        if UsageAttribution.objects.filter(play_log=obj).exists():
            return 'Partner'
        return 'Local'

    def get_partner_name(self, obj):
        try:
            from royalties.models import UsageAttribution
        except Exception:
            return None

        attribution = UsageAttribution.objects.filter(play_log=obj).select_related('origin_partner').first()
        if attribution and attribution.origin_partner:
            return attribution.origin_partner.display_name or attribution.origin_partner.company_name
        return None

    def get_plays(self, obj):
        plays = getattr(obj, 'track_total_plays', None)
        if plays is None:
            return 0
        try:
            return int(plays)
        except (TypeError, ValueError):
            return 0

    def get_source(self, obj):
        return obj.source or 'Radio'

    def get_confidence(self, obj):
        if obj.avg_confidence_score is None:
            return None
        try:
            return float(obj.avg_confidence_score)
        except (TypeError, ValueError):
            return None


class StationMatchCacheSerializer(serializers.ModelSerializer):
    track_title = serializers.CharField(source='track.title', read_only=True)
    artist = serializers.SerializerMethodField()
    station_name = serializers.CharField(source='station.name', read_only=True)
    matched_at = serializers.SerializerMethodField()
    confidence = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = MatchCache
        fields = ['id', 'track_title', 'artist', 'station_name', 'matched_at', 'confidence', 'status']

    def _format_datetime(self, value):
        if not value:
            return None
        return value.strftime('%Y-%m-%d ~ %H:%M:%S')

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

    def get_matched_at(self, obj):
        return self._format_datetime(obj.matched_at)

    def get_confidence(self, obj):
        if obj.avg_confidence_score is None:
            return None
        try:
            return float(obj.avg_confidence_score)
        except (TypeError, ValueError):
            return None

    def get_status(self, obj):
        if getattr(obj, 'failed_reason', None):
            return 'Flagged'
        if getattr(obj, 'processed', False):
            return 'Verified'
        return 'Pending'


class StationStaffSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    
    class Meta:
        model = StationStaff
        fields = [
            'id', 'name', 'email', 'phone', 'role', 'permission_level',
            'emergency_contact', 'emergency_phone', 'hire_date', 'employee_id',
            'department', 'can_upload_playlogs', 'can_manage_streams', 
            'can_view_analytics', 'active', 'station_name', 'created_at'
        ]


class StationStaffDetailsSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    
    class Meta:
        model = StationStaff
        fields = '__all__'


class StationComplianceSerializer(serializers.ModelSerializer):
    """Serializer for compliance-related station information"""
    
    class Meta:
        model = Station
        fields = [
            'station_id', 'name', 'regulatory_body', 'compliance_contact_name',
            'compliance_contact_email', 'compliance_contact_phone', 'license_number',
            'verification_status', 'verified_at', 'verification_notes',
            'station_class', 'station_type', 'coverage_area', 'estimated_listeners'
        ]


class ComplaintSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    complainant_name = serializers.CharField(source='complainant.username', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    complaint_type_display = serializers.CharField(source='get_complaint_type_display', read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'complaint_id', 'station', 'station_name', 'complainant', 'complainant_name',
            'subject', 'description', 'complaint_type', 'complaint_type_display',
            'priority', 'priority_display', 'status', 'status_display',
            'assigned_to', 'assigned_to_name', 'resolution_notes',
            'resolved_by', 'resolved_by_name', 'resolved_at',
            'contact_email', 'contact_phone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['complaint_id', 'resolved_at']


class ComplaintDetailsSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.name', read_only=True)
    complainant_name = serializers.CharField(source='complainant.username', read_only=True)
    complainant_email = serializers.CharField(source='complainant.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    complaint_type_display = serializers.CharField(source='get_complaint_type_display', read_only=True)
    updates_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['complaint_id', 'resolved_at']
    
    def get_updates_count(self, obj):
        return obj.updates.count()


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    update_type_display = serializers.CharField(source='get_update_type_display', read_only=True)
    
    class Meta:
        model = ComplaintUpdate
        fields = [
            'id', 'complaint', 'user', 'user_name', 'update_type', 'update_type_display',
            'message', 'old_status', 'new_status', 'created_at'
        ]
        read_only_fields = ['user']


class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = [
            'station', 'subject', 'description', 'complaint_type', 
            'priority', 'contact_email', 'contact_phone'
        ]
    
    def create(self, validated_data):
        # Set complainant to current user
        validated_data['complainant'] = self.context['request'].user
        return super().create(validated_data)
