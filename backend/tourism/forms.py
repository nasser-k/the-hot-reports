"""Forms for the tourism app."""
from django import forms

from news.forms import RichTextWidget, sanitize_html
from .models import TourismListing


class TourismListingAdminForm(forms.ModelForm):
    """Tourism listing admin form with rich text editor for description."""

    class Meta:
        model = TourismListing
        fields = "__all__"
        widgets = {
            "description": RichTextWidget(
                attrs={"rows": 15},
                toolbar="full"
            ),
        }

    def clean_description(self):
        """Sanitize HTML content."""
        description = self.cleaned_data.get("description", "")
        return sanitize_html(description)
