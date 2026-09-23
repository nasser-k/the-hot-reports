import django_filters

from .models import TourismListing


class TourismListingFilter(django_filters.FilterSet):
    type = django_filters.CharFilter(field_name="listing_type")
    featured = django_filters.BooleanFilter()

    class Meta:
        model = TourismListing
        fields = ("type", "featured")
