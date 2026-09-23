"""
Ads API: serve paid/house creatives, track clicks, list slots.

Priority: active paid ad (by priority, random tie) → house ad → { ad: null }.
Frontend then falls back to AdSense for that slot_key.
"""
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from news.analytics_utils import get_client_ip

from .models import Ad, AdSlot, AdEvent
from .serializers import AdSerializer, AdSlotSerializer


class AdServeView(APIView):
    permission_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ad_serve"

    def get(self, request, slot_key: str, *args, **kwargs):
        today = timezone.now().date()
        slot = get_object_or_404(AdSlot, slot_key=slot_key, is_active=True)

        active_qs = Ad.objects.filter(
            slot=slot,
            is_active=True,
            start_date__lte=today,
            end_date__gte=today,
        )

        ad = active_qs.filter(is_house_ad=False).order_by("-priority", "?").first()
        if not ad:
            ad = active_qs.filter(is_house_ad=True).order_by("-priority", "?").first()

        if not ad:
            return Response({"ad": None}, status=status.HTTP_200_OK)

        page_path = request.query_params.get("page", "")[:200]
        ip = get_client_ip(request)
        ua = (request.META.get("HTTP_USER_AGENT") or "")[:200]

        already_seen = AdEvent.objects.filter(
            ad=ad,
            event_type=AdEvent.EVENT_IMPRESSION,
            ip_address=ip,
            created_at__date=today,
        ).exists()

        if not already_seen:
            with transaction.atomic():
                AdEvent.objects.create(
                    ad=ad,
                    event_type=AdEvent.EVENT_IMPRESSION,
                    ip_address=ip,
                    user_agent=ua,
                    page_path=page_path,
                )
                Ad.objects.filter(pk=ad.pk).update(impressions=F("impressions") + 1)

        serializer = AdSerializer(ad, context={"request": request})
        return Response({"ad": serializer.data}, status=status.HTTP_200_OK)


class AdClickView(APIView):
    permission_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "ad_click"

    def post(self, request, ad_id: int, *args, **kwargs):
        ad = Ad.objects.filter(id=ad_id, is_active=True).first()
        if not ad:
            return Response(
                {"ok": False, "error": "Ad not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        page_path = (request.data.get("page", "") or "")[:200]
        ip = get_client_ip(request)
        ua = (request.META.get("HTTP_USER_AGENT") or "")[:200]

        with transaction.atomic():
            AdEvent.objects.create(
                ad=ad,
                event_type=AdEvent.EVENT_CLICK,
                ip_address=ip,
                user_agent=ua,
                page_path=page_path,
            )
            Ad.objects.filter(pk=ad.pk).update(clicks=F("clicks") + 1)

        return Response({"ok": True}, status=status.HTTP_200_OK)


@api_view(["GET"])
@throttle_classes([ScopedRateThrottle])
def ad_slots_list(request):
    """Active slot keys (for admin/debug)."""
    slots = AdSlot.objects.filter(is_active=True)
    serializer = AdSlotSerializer(slots, many=True)
    return Response({"slots": serializer.data})
