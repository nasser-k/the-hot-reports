from rest_framework import serializers

from pulse.media_urls import resolve_media_image

from .models import TourismListing


class TourismListingSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    type = serializers.CharField(source="listing_type")
    image = serializers.SerializerMethodField()
    priceRange = serializers.CharField(source="price_range")
    metaTitle = serializers.SerializerMethodField()
    metaDescription = serializers.SerializerMethodField()
    metaKeywords = serializers.SerializerMethodField()

    class Meta:
        model = TourismListing
        fields = (
            "id",
            "slug",
            "name",
            "type",
            "tagline",
            "description",
            "image",
            "location",
            "priceRange",
            "rating",
            "featured",
            "website",
            "phone",
            "tags",
            "metaTitle",
            "metaDescription",
            "metaKeywords",
        )

    def get_id(self, obj: TourismListing) -> str:
        return str(obj.pk)

    def get_image(self, obj: TourismListing) -> str:
        return resolve_media_image(
            file_field=getattr(obj, "image", None),
            external_url=obj.image_url,
            request=self.context.get("request"),
        )

    def get_metaTitle(self, obj: TourismListing) -> str:
        return obj.meta_title or obj.name

    def get_metaDescription(self, obj: TourismListing) -> str:
        return obj.meta_description or obj.tagline or ""

    def get_metaKeywords(self, obj: TourismListing) -> str:
        return obj.meta_keywords or ""
