from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import TourismListingFilter
from .models import TourismListing
from .serializers import TourismListingSerializer


class TourismViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TourismListing.objects.all()
    serializer_class = TourismListingSerializer
    lookup_field = "slug"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = TourismListingFilter
    search_fields = ("name", "tagline", "description", "location", "tags")
    ordering_fields = ("name", "rating", "featured")
    ordering = ("name",)

    @action(detail=False, methods=["get"])
    def types(self, request):
        """Return available tourism types with their display names"""
        types = [
            {
                "value": choice[0],
                "label": choice[1],
                "icon": self._get_icon_for_type(choice[0]),
                "description": self._get_description_for_type(choice[0]),
            }
            for choice in TourismListing.TYPE_CHOICES
        ]
        return Response(types)

    def _get_icon_for_type(self, type_value: str) -> str:
        """Return icon name for tourism type"""
        icons = {
            "safari": "compass",
            "lodge": "tree-pine",
            "hotel": "hotel",
            "campsite": "tent",
            "experience": "mountain",
        }
        return icons.get(type_value, "map-pin")

    def _get_description_for_type(self, type_value: str) -> str:
        """Return description for tourism type"""
        descriptions = {
            "safari": "Gorilla tracking & game drives",
            "lodge": "Forest & lakeside lodges",
            "hotel": "Comfort in town & countryside",
            "campsite": "Eco-camping & glamping",
            "experience": "Cultural & adventure activities",
        }
        return descriptions.get(type_value, "")
