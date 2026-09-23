"""
Management command to set up default news categories.
Run with: python manage.py setup_categories
"""

from django.core.management.base import BaseCommand

from news.models import Category


class Command(BaseCommand):
    help = "Create default news categories for The Hot Reports"

    def handle(self, *args, **options):
        categories = [
            {
                "name": "National",
                "slug": "national",
                "color": "#A21A47",
                "order": 1,
            },
            {
                "name": "Politics",
                "slug": "politics",
                "color": "#9333EA",  # Purple
                "order": 2,
            },
            # Business & Economy
            {
                "name": "Business",
                "slug": "business",
                "color": "#EA580C",  # Orange
                "order": 3,
            },
            {
                "name": "Technology",
                "slug": "technology",
                "color": "#7C3AED",  # Violet
                "order": 4,
            },
            # Education & Society
            {
                "name": "Education",
                "slug": "education",
                "color": "#2563EB",  # Blue
                "order": 5,
            },
            {
                "name": "Health",
                "slug": "health",
                "color": "#10B981",  # Green
                "order": 6,
            },
            {
                "name": "Culture & Society",
                "slug": "culture-society",
                "color": "#DB2777",  # Pink
                "order": 7,
            },
            # Sports
            {
                "name": "Sports",
                "slug": "sports",
                "color": "#16A34A",  # Green
                "order": 8,
            },
            # Opinion & Analysis
            {
                "name": "Op-Ed",
                "slug": "op-ed",
                "color": "#6D28D9",  # Violet
                "order": 9,
            },
            # International
            {
                "name": "Africa",
                "slug": "africa",
                "color": "#CA8A04",  # Yellow
                "order": 10,
            },
            {
                "name": "World",
                "slug": "world",
                "color": "#0D9488",  # Teal
                "order": 11,
            },
        ]

        created_count = 0
        updated_count = 0

        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                slug=cat_data["slug"],
                defaults={
                    "name": cat_data["name"],
                    "color": cat_data["color"],
                    "order": cat_data["order"],
                },
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created category: {category.name}")
                )
                created_count += 1
            else:
                # Update existing category if needed
                updated = False
                if category.name != cat_data["name"]:
                    category.name = cat_data["name"]
                    updated = True
                if category.color != cat_data["color"]:
                    category.color = cat_data["color"]
                    updated = True
                if category.order != cat_data["order"]:
                    category.order = cat_data["order"]
                    updated = True

                if updated:
                    category.save()
                    self.stdout.write(
                        self.style.WARNING(f"↻ Updated category: {category.name}")
                    )
                    updated_count += 1
                else:
                    self.stdout.write(f"  Category already exists: {category.name}")

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Categories setup complete: {created_count} created, {updated_count} updated"
            )
        )
