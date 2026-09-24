"""The eleven news desks. These are fixed in code and are not created in admin."""

NEWS_CATEGORIES = (
    {"name": "National", "slug": "national", "color": "#A21A47", "order": 1},
    {"name": "Politics", "slug": "politics", "color": "#9333EA", "order": 2},
    {"name": "Business", "slug": "business", "color": "#EA580C", "order": 3},
    {"name": "Technology", "slug": "technology", "color": "#7C3AED", "order": 4},
    {"name": "Education", "slug": "education", "color": "#2563EB", "order": 5},
    {"name": "Health", "slug": "health", "color": "#10B981", "order": 6},
    {"name": "Culture & Society", "slug": "culture-society", "color": "#DB2777", "order": 7},
    {"name": "Sports", "slug": "sports", "color": "#16A34A", "order": 8},
    {"name": "Op-Ed", "slug": "op-ed", "color": "#6D28D9", "order": 9},
    {"name": "Africa", "slug": "africa", "color": "#CA8A04", "order": 10},
    {"name": "World", "slug": "world", "color": "#0D9488", "order": 11},
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
