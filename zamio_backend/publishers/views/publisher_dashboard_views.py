from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q, Avg
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from publishers.models import PublisherProfile, PublishingAgreement, PublisherArtistRelationship
from artists.models import Artist, Track
from music_monitor.models import PlayLog
from royalties.models import RoyaltyWithdrawal

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_publisher_metrics_view(request):
    """Get publisher metrics for dashboard cards"""
    payload = {}
    data = {}
    errors = {}

    try:
        # Get all publishers with basic metrics
        publishers = PublisherProfile.objects.filter(is_archived=False).annotate(
            artist_count=Count('artist_relationships', filter=Q(artist_relationships__status='active')),
            agreement_count=Count('publishingagreement'),
            total_tracks=Count('publishingagreement__track', distinct=True)
        )

        publisher_metrics = []
        for publisher in publishers:
            # Calculate total earnings from royalty withdrawals
            total_earnings = RoyaltyWithdrawal.objects.filter(
                requester=publisher.user,
                status__in=['approved', 'processed']
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Calculate total plays for publisher's tracks
            publisher_tracks = Track.objects.filter(
                publishingagreement__publisher=publisher,
                publishingagreement__status='accepted'
            )
            total_plays = PlayLog.objects.filter(
                track__in=publisher_tracks
            ).count()

            # Get recent activity (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            recent_plays = PlayLog.objects.filter(
                track__in=publisher_tracks,
                created_at__gte=thirty_days_ago
            ).count()

            publisher_data = {
                'publisher_id': publisher.publisher_id,
                'company_name': publisher.company_name or f"{publisher.user.first_name} {publisher.user.last_name}",
                'verified': publisher.verified,
                'artist_count': publisher.artist_count,
                'agreement_count': publisher.agreement_count,
                'total_tracks': publisher.total_tracks,
                'total_earnings': float(total_earnings),
                'total_plays': total_plays,
                'recent_plays': recent_plays,
                'region': publisher.region or 'Not specified',
                'country': publisher.country or 'Ghana',
                'created_at': publisher.created_at.isoformat(),
                'user': {
                    'name': f"{publisher.user.first_name or ''} {publisher.user.last_name or ''}".strip(),
                    'email': publisher.user.email,
                    'photo': publisher.user.photo.url if hasattr(publisher.user, 'photo') and publisher.user.photo else None,
                }
            }
            publisher_metrics.append(publisher_data)

        # Sort by total earnings descending
        publisher_metrics.sort(key=lambda x: x['total_earnings'], reverse=True)

        data['publishers'] = publisher_metrics
        data['total_publishers'] = len(publisher_metrics)
        data['total_verified'] = sum(1 for p in publisher_metrics if p['verified'])
        data['total_artists_managed'] = sum(p['artist_count'] for p in publisher_metrics)
        data['total_agreements'] = sum(p['agreement_count'] for p in publisher_metrics)

        payload['message'] = "Successful"
        payload['data'] = data
        return Response(payload, status=status.HTTP_200_OK)

    except Exception as e:
        errors['general'] = [str(e)]
        payload['message'] = "Error fetching publisher metrics"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_publisher_analytics_view(request):
    """Get publisher analytics data for dashboard charts"""
    payload = {}
    data = {}
    errors = {}

    try:
        # Get top publishers by earnings
        top_publishers = PublisherProfile.objects.filter(is_archived=False)
        
        publisher_analytics = []
        for publisher in top_publishers:
            # Calculate earnings
            total_earnings = RoyaltyWithdrawal.objects.filter(
                requester=publisher.user,
                status__in=['approved', 'processed']
            ).aggregate(total=Sum('amount'))['total'] or 0

            if total_earnings > 0:  # Only include publishers with earnings
                publisher_analytics.append({
                    'publisher_id': publisher.publisher_id,
                    'company_name': publisher.company_name or f"{publisher.user.first_name} {publisher.user.last_name}",
                    'total_earnings': float(total_earnings),
                    'region': publisher.region or 'Not specified',
                })

        # Sort by earnings and take top 10
        publisher_analytics.sort(key=lambda x: x['total_earnings'], reverse=True)
        top_publishers_data = publisher_analytics[:10]

        # Get monthly publisher registration trends
        monthly_registrations = []
        for i in range(6):  # Last 6 months
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            count = PublisherProfile.objects.filter(
                created_at__gte=month_start,
                created_at__lte=month_end
            ).count()
            
            monthly_registrations.append({
                'month': month_start.strftime('%b %Y'),
                'registrations': count
            })

        monthly_registrations.reverse()  # Chronological order

        # Get regional distribution
        regional_distribution = PublisherProfile.objects.filter(
            is_archived=False,
            region__isnull=False
        ).values('region').annotate(
            count=Count('id')
        ).order_by('-count')

        data['top_publishers'] = top_publishers_data
        data['monthly_registrations'] = monthly_registrations
        data['regional_distribution'] = list(regional_distribution)

        payload['message'] = "Successful"
        payload['data'] = data
        return Response(payload, status=status.HTTP_200_OK)

    except Exception as e:
        errors['general'] = [str(e)]
        payload['message'] = "Error fetching publisher analytics"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_publisher_detail_view(request):
    """Get detailed publisher information for dashboard detail views"""
    payload = {}
    data = {}
    errors = {}

    publisher_id = request.query_params.get('publisher_id')
    if not publisher_id:
        errors['publisher_id'] = ["Publisher ID is required"]

    try:
        publisher = PublisherProfile.objects.get(publisher_id=publisher_id)
    except PublisherProfile.DoesNotExist:
        errors['publisher_id'] = ['Publisher does not exist']

    if errors:
        payload['message'] = "Errors"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Get publisher's artists
        artist_relationships = PublisherArtistRelationship.objects.filter(
            publisher=publisher,
            status='active'
        ).select_related('artist')

        artists_data = []
        for relationship in artist_relationships:
            artist = relationship.artist
            # Get artist's track count and earnings
            track_count = Track.objects.filter(
                publishingagreement__publisher=publisher,
                publishingagreement__songwriter=artist,
                publishingagreement__status='accepted'
            ).count()

            artist_earnings = RoyaltyWithdrawal.objects.filter(
                requester=artist.user,
                status__in=['approved', 'processed']
            ).aggregate(total=Sum('amount'))['total'] or 0

            artists_data.append({
                'artist_id': artist.artist_id,
                'stage_name': artist.stage_name,
                'name': f"{artist.user.first_name or ''} {artist.user.last_name or ''}".strip(),
                'track_count': track_count,
                'earnings': float(artist_earnings),
                'relationship_type': relationship.relationship_type,
                'royalty_split': float(relationship.royalty_split_percentage),
                'start_date': relationship.start_date.isoformat(),
            })

        # Get publisher's agreements
        agreements = PublishingAgreement.objects.filter(
            publisher=publisher
        ).select_related('track', 'songwriter')

        agreements_data = []
        for agreement in agreements:
            agreements_data.append({
                'id': agreement.id,
                'track_title': agreement.track.title,
                'artist_name': agreement.songwriter.stage_name,
                'writer_share': float(agreement.writer_share),
                'publisher_share': float(agreement.publisher_share),
                'status': agreement.status,
                'agreement_date': agreement.agreement_date.isoformat(),
                'verified': agreement.verified_by_admin,
            })

        # Calculate total metrics
        total_earnings = RoyaltyWithdrawal.objects.filter(
            requester=publisher.user,
            status__in=['approved', 'processed']
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_tracks = Track.objects.filter(
            publishingagreement__publisher=publisher,
            publishingagreement__status='accepted'
        ).count()

        total_plays = PlayLog.objects.filter(
            track__publishingagreement__publisher=publisher,
            track__publishingagreement__status='accepted'
        ).count()

        data['publisher'] = {
            'publisher_id': publisher.publisher_id,
            'company_name': publisher.company_name,
            'verified': publisher.verified,
            'region': publisher.region,
            'city': publisher.city,
            'country': publisher.country,
            'writer_split': float(publisher.writer_split or 0),
            'publisher_split': float(publisher.publisher_split or 0),
            'total_earnings': float(total_earnings),
            'total_tracks': total_tracks,
            'total_plays': total_plays,
            'created_at': publisher.created_at.isoformat(),
            'user': {
                'name': f"{publisher.user.first_name or ''} {publisher.user.last_name or ''}".strip(),
                'email': publisher.user.email,
                'photo': publisher.user.photo.url if hasattr(publisher.user, 'photo') and publisher.user.photo else None,
            }
        }
        data['artists'] = artists_data
        data['agreements'] = agreements_data

        payload['message'] = "Successful"
        payload['data'] = data
        return Response(payload, status=status.HTTP_200_OK)

    except Exception as e:
        errors['general'] = [str(e)]
        payload['message'] = "Error fetching publisher details"
        payload['errors'] = errors
        return Response(payload, status=status.HTTP_500_INTERNAL_SERVER_ERROR)