"""
Ads API serializers (camelCase JSON via djangorestframework-camel-case).
"""
from rest_framework import serializers

from hotreports.media_urls import uploaded_file_url

from .models import Ad, AdSlot


class AdSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdSlot
        fields = ("slot_key", "name")


class AdSerializer(serializers.ModelSerializer):
    """Payload for LiveAdBanner (paid/house image ads)."""

    image_url = serializers.SerializerMethodField()
    slot_key = serializers.CharField(source="slot.slot_key", read_only=True)

    class Meta:
        model = Ad
        fields = (
            "id",
            "name",
            "client_name",
            "image_url",
            "alt_text",
            "link_url",
            "slot_key",
            "is_house_ad",
        )

    def get_image_url(self, obj: Ad) -> str | None:
        return uploaded_file_url(obj.image, request=self.context.get("request"))
