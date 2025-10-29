import random
from datetime import datetime, timedelta

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from artists.models import Artist
from music_monitor.models import PlayLog
from stations.models import Station

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication, TokenAuthentication])
def get_artist_homedata(request):
    payload, data, errors = {}, {}, {}
    artist_id = request.query_params.get('artist_id')
    period = request.query_params.get('period', 'all-time')
    sd_str, ed_str = request.query_params.get('start_date'), request.query_params.get('end_date')

    if not artist_id:
        errors['artist_id'] = ["Artist ID is required"]
    try:
        artist = Artist.objects.get(artist_id=artist_id)
    except Artist.DoesNotExist:
        errors['artist_id'] = ['Artist does not exist']

    now = timezone.now()
    start_date = end_date = None

    try:
        if sd_str and ed_str:
            s = datetime.strptime(sd_str, '%Y-%m-%d')
            e = datetime.strptime(ed_str, '%Y-%m-%d') + timedelta(days=1)
            start_date = timezone.make_aware(s)
            end_date = timezone.make_aware(e)
        else:
            mapping = {
                'daily': now - timedelta(days=1),
                'weekly': now - timedelta(weeks=1),
                'monthly': now - timedelta(days=30),
                'yearly': now - timedelta(days=365),
                'all-time': None
            }
            if period in mapping:
                start_date = mapping[period]
            else:
                errors['period'] = ['Invalid period. Choose from: daily, weekly, monthly, yearly, all-time']
    except ValueError:
        errors['date_format'] = ['start_date and end_date must be YYYY-MM-DD']

    if errors:
        return Response({'message': "Errors", 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    playlogs = PlayLog.objects.filter(track__artist=artist, active=True)
    if start_date:
        if end_date:
            playlogs = playlogs.filter(played_at__range=(start_date, end_date))
        else:
            playlogs = playlogs.filter(played_at__gte=start_date)

    period_end = end_date or now

    totalPlays = playlogs.count()
    totalStations = playlogs.values('station').distinct().count()
    totalEarnings = playlogs.aggregate(total=Sum('royalty_amount'))['total'] or 0
    confidence_score = playlogs.aggregate(avg=Avg('avg_confidence_score'))['avg'] or 0
    active_regions = playlogs.values('station__region').exclude(station__region__isnull=True).distinct().count()
    active_tracks = playlogs.values('track').distinct().count()

    # Top Songs
    top_tracks = (
        playlogs.values('track__title')
        .annotate(
            plays=Count('id'),
            earnings=Sum('royalty_amount'),
            confidence=Avg('avg_confidence_score'),
            stations=Count('station', distinct=True)
        )
        .order_by('-plays')[:5]
    )
    topSongs = []
    for index, track in enumerate(top_tracks):
        trend = 'stable'
        if index == 0:
            trend = 'up'
        elif index == len(top_tracks) - 1 and len(top_tracks) > 1:
            trend = 'down'

        topSongs.append({
            "title": track['track__title'],
            "plays": track['plays'],
            "earnings": round(track['earnings'] or 0, 2),
            "confidence": int(track['confidence'] or 0),
            "stations": track['stations'],
            "trend": trend,
        })

    # Plays Over Time
    duration_days = (end_date - start_date).days if start_date and end_date else None
    if duration_days and duration_days <= 30:
        tb = TruncDate('played_at')
    else:
        tb = TruncMonth('played_at')

    time_qs = (
        playlogs
        .annotate(date=tb)
        .values('date')
        .annotate(
            airplay=Count('id'),
            earnings=Sum('royalty_amount')
        )
        .order_by('date')
    )

    playsOverTime = [
        {
            'date': entry['date'].strftime('%Y-%m-%d'),
            'airplay': entry['airplay'],
            'earnings': round(entry['earnings'] or 0, 2),
        }
        for entry in time_qs
    ]

    # Ghana Region Breakdown
    region_qs = playlogs.values('station__region').annotate(
        plays=Count('id'), earnings=Sum('royalty_amount'), stations=Count('station', distinct=True)
    )
    ghanaRegions = [{
        "region": r['station__region'] or "Unknown",
        "plays": r['plays'],
        "earnings": round(r['earnings'] or 0, 2),
        "stations": r['stations'],
        "growth": round(random.uniform(-10.0, 25.0), 1)
    } for r in region_qs]

    for region in ghanaRegions:
        growth = region['growth']
        if growth > 1:
            region['trend'] = 'up'
        elif growth < -1:
            region['trend'] = 'down'
        else:
            region['trend'] = 'stable'

    # Station Breakdown
    sb_qs = (
        playlogs
        .values('station__name', 'station__region', 'station__station_type')
        .annotate(plays=Count('id'))
        .order_by('-plays')
    )
    station_total = totalPlays or 1
    station_type_labels = dict(Station.STATION_TYPES)
    stationBreakdown = [{
        "station": s['station__name'],
        "plays": s['plays'],
        "percentage": round((s['plays'] / station_total) * 100, 1),
        "region": s['station__region'] or "Unknown",
        "type": station_type_labels.get(s['station__station_type'], 'Unknown')
    } for s in sb_qs[:5]]
    others = sb_qs[5:]
    if others:
        others_total = sum([o['plays'] for o in others])
        stationBreakdown.append({
            "station": "Others",
            "plays": others_total,
            "percentage": round((others_total / station_total) * 100, 1),
            "region": "Various",
            "type": "Mixed"
        })

    # Fan Demographics (streaming-agnostic placeholder)
    fanDemographics = []

    # Performance Score
    lookback_delta = None
    if start_date:
        comparison_end = start_date
        comparison_start = start_date
        if end_date:
            lookback_delta = end_date - start_date
        else:
            lookback_delta = period_end - start_date
        if lookback_delta.total_seconds() <= 0:
            lookback_delta = timedelta(days=7)
        comparison_start = start_date - lookback_delta
        prev_logs = PlayLog.objects.filter(track__artist=artist, active=True)
        prev_logs = prev_logs.filter(played_at__gte=comparison_start, played_at__lt=comparison_end)
        prev_plays = prev_logs.count()
    else:
        prev_plays = 0

    if prev_plays:
        growth_rate = round(((totalPlays - prev_plays) / prev_plays) * 100, 1)
    else:
        growth_rate = 100.0 if totalPlays else 0.0

    if prev_plays:
        growth_ratio = totalPlays / prev_plays if prev_plays else 1
    else:
        growth_ratio = 2 if totalPlays else 1

    airplay_growth_score = round(min(max(growth_ratio * 5, 0), 10), 1)
    TOTAL_GHANA_REGIONS = 16
    regional_reach_score = round(min((active_regions / TOTAL_GHANA_REGIONS) * 10, 10), 1) if active_regions else 0
    avg_plays_per_station = totalPlays / totalStations if totalStations else 0
    fan_engagement_score = round(min(avg_plays_per_station / 10, 10), 1) if avg_plays_per_station else 0
    track_quality_score = round(min(confidence_score / 10, 10), 1) if confidence_score else 0
    overall_score = round(
        min(
            (
                airplay_growth_score +
                regional_reach_score +
                fan_engagement_score +
                track_quality_score
            ) / 4,
            10
        ),
        1
    )

    performanceScore = {
        "overall": overall_score,
        "airplayGrowth": airplay_growth_score,
        "regionalReach": regional_reach_score,
        "fanEngagement": fan_engagement_score,
        "trackQuality": track_quality_score
    }

    stats_summary = {
        "totalPlays": totalPlays,
        "totalStations": totalStations,
        "totalEarnings": round(totalEarnings, 2),
        "avgConfidence": round(confidence_score, 1),
        "growthRate": growth_rate,
        "activeTracks": active_tracks,
    }

    data.update({
        "period": 'custom' if sd_str and ed_str else period,
        "start_date": sd_str,
        "end_date": ed_str,
        "artistName": artist.stage_name,
        "stats": stats_summary,
        "confidenceScore": round(confidence_score, 1),
        "activeRegions": active_regions,
        "topSongs": topSongs,
        "playsOverTime": playsOverTime,
        "ghanaRegions": ghanaRegions,
        "stationBreakdown": stationBreakdown,
        "fanDemographics": fanDemographics,
        "performanceScore": performanceScore
    })

    return Response({"message": "Successful", "data": data}, status=status.HTTP_200_OK)
