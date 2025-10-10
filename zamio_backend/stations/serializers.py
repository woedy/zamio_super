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
    artist_name = serializers.CharField(source='track.artist.stage_name', read_only=True)
    start_time = serializers.SerializerMethodField()
    stop_time = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = PlayLog
        fields = [
            'id', 'track_title', 'artist_name', 'start_time', 'stop_time', 'duration',
            'avg_confidence_score', 'royalty_amount', 'flagged', 'status'
        ]


    def get_start_time(self, obj):
        return obj.start_time.strftime('%Y-%m-%d ~ %H:%M:%S')


    def get_stop_time(self, obj):
        return obj.stop_time.strftime('%Y-%m-%d ~ %H:%M:%S')


    def get_duration(self, obj):
        total_seconds = int(obj.duration.total_seconds())
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours:02}:{minutes:02}:{seconds:02}"

    def get_status(self, obj):
        # If flagged, show Flagged; else if any related Dispute is Resolved, show Resolved; else blank
        try:
            if getattr(obj, 'flagged', False):
                return 'Flagged'
            # Check for a resolved dispute on this playlog
            if Dispute.objects.filter(playlog=obj, dispute_status='Resolved').exists():
                return 'Resolved'
        except Exception:
            pass
        return ''


class StationMatchCacheSerializer(serializers.ModelSerializer):
    track_title = serializers.CharField(source='track.title', read_only=True)  
    artist_name = serializers.CharField(source='track.artist.stage_name', read_only=True)
    matched_at = serializers.SerializerMethodField()

    class Meta:
        model = MatchCache
        fields = ['id', 'track_title', 'artist_name', 'matched_at', 'avg_confidence_score']

    def get_matched_at(self, obj):
        return obj.matched_at.strftime('%Y-%m-%d ~ %H:%M:%S')


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
