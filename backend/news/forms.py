"""Forms for the news app."""
import nh3
from django import forms

from .models import Article, StoryEpisode, StorySeries


# Allowed HTML tags and attributes for rich text content (nh3 format)
# nh3 uses a dict of {tag: set(allowed_attributes)} format
ALLOWED_TAGS_AND_ATTRS = {
    "p": set(),
    "br": set(),
    "strong": set(),
    "b": set(),
    "em": set(),
    "i": set(),
    "u": set(),
    "s": set(),
    "strike": set(),
    "del": set(),
    "ins": set(),
    "a": {"href", "title", "target"},
    "ul": set(),
    "ol": set(),
    "li": set(),
    "h1": set(),
    "h2": set(),
    "h3": set(),
    "h4": set(),
    "h5": set(),
    "h6": set(),
    "blockquote": set(),
    "code": set(),
    "pre": set(),
    "table": set(),
    "thead": set(),
    "tbody": set(),
    "tfoot": set(),
    "tr": set(),
    "td": set(),
    "th": set(),
    "img": {"src", "alt", "width", "height", "loading"},
    "figure": set(),
    "figcaption": set(),
    "span": {"class"},
    "hr": set(),
    "div": {"class", "data-oembed-url"},
    "sup": set(),
    "sub": set(),
    "mark": set(),
    "small": set(),
    "abbr": set(),
    "cite": set(),
    "dfn": set(),
    "kbd": set(),
    "samp": set(),
    "var": set(),
}

def sanitize_html(value: str | None) -> str:
    """Sanitize HTML content to prevent XSS attacks using nh3 (Mozilla).
    
    nh3 is a maintained, Rust-based HTML sanitizer from Mozilla.
    It removes dangerous content and allows only specified tags and attributes.
    """
    if not value:
        return ""
    # nh3.clean expects tags as a set of allowed tag names
    # and attributes as a dict mapping tag names to allowed attribute sets
    tags = set(ALLOWED_TAGS_AND_ATTRS.keys())
    return nh3.clean(html=value, tags=tags, attributes=ALLOWED_TAGS_AND_ATTRS)


class RichTextWidget(forms.Textarea):
    """Textarea widget that will be enhanced by CKEditor 5."""

    def __init__(self, attrs=None, toolbar="default"):
        default_attrs = {"rows": 10, "cols": 80}
        if attrs:
            default_attrs.update(attrs)
        self.toolbar = toolbar
        super().__init__(default_attrs)

    def build_attrs(self, base_attrs, extra_attrs=None):
        attrs = super().build_attrs(base_attrs, extra_attrs)
        attrs["class"] = (attrs.get("class", "") + " ckeditor-editor").strip()
        attrs["data-toolbar"] = self.toolbar
        return attrs


class ArticleAdminForm(forms.ModelForm):
    """Article admin form with rich text editor for content."""

    class Meta:
        model = Article
        fields = "__all__"
        widgets = {
            "content": RichTextWidget(
                attrs={"rows": 20},
                toolbar="full"
            ),
        }

    def clean_content(self):
        """Sanitize HTML content."""
        content = self.cleaned_data.get("content", "")
        return sanitize_html(content)


class StorySeriesAdminForm(forms.ModelForm):
    """Story series admin form - description uses plain text."""

    class Meta:
        model = StorySeries
        fields = "__all__"


class StoryEpisodeAdminForm(forms.ModelForm):
    """Story episode admin form with rich text editor for content."""

    class Meta:
        model = StoryEpisode
        fields = "__all__"
        widgets = {
            "content": RichTextWidget(
                attrs={"rows": 20},
                toolbar="full"
            ),
        }

    def clean_content(self):
        """Sanitize HTML content."""
        content = self.cleaned_data.get("content", "")
        return sanitize_html(content)
