"""News desks for The Hot Reports."""

NEWS_CATEGORIES = (
    {"name": "National", "slug": "national", "color": "#A21A47", "order": 1},
    {"name": "Politics", "slug": "politics", "color": "#152238", "order": 2},
    {"name": "Business", "slug": "business", "color": "#1B4D3E", "order": 3},
    {"name": "Technology", "slug": "technology", "color": "#243044", "order": 4},
    {"name": "Education", "slug": "education", "color": "#3A4578", "order": 5},
    {"name": "Health", "slug": "health", "color": "#0E5C56", "order": 6},
    {"name": "Culture & Society", "slug": "culture-society", "color": "#6B3050", "order": 7},
    {"name": "Sports", "slug": "sports", "color": "#8C3A14", "order": 8},
    {"name": "Op-Ed", "slug": "op-ed", "color": "#4A4036", "order": 9},
    {"name": "Africa", "slug": "africa", "color": "#8A5A12", "order": 10},
    {"name": "World", "slug": "world", "color": "#1A5670", "order": 11},
)

CATEGORY_CHOICES = tuple((item["slug"], item["name"]) for item in NEWS_CATEGORIES)
_BY_SLUG = {item["slug"]: item for item in NEWS_CATEGORIES}


def category_by_slug(slug: str | None) -> dict | None:
    if not slug:
        return None
    return _BY_SLUG.get(slug)


def category_payload(slug: str | None) -> dict:
    item = category_by_slug(slug)
    if item is None:
        return {"name": slug or "", "slug": slug or "", "color": "#A21A47"}
    return {"name": item["name"], "slug": item["slug"], "color": item["color"]}
