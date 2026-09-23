"""
Create AdSlot rows from backend/ads/slots.py (idempotent).
Run: python manage.py setup_ad_slots
"""
from django.core.management.base import BaseCommand

from ads.models import AdSlot
from ads.slots import AD_SLOT_DEFINITIONS


class Command(BaseCommand):
    help = "Create or verify ad slots defined in ads/slots.py"

    def handle(self, *args, **options):
        created_count = 0
        existing_count = 0

        for definition in AD_SLOT_DEFINITIONS:
            _, created = AdSlot.objects.get_or_create(
                slot_key=definition.slot_key,
                defaults={"name": definition.name, "is_active": True},
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {definition.slot_key}"))
            else:
                existing_count += 1
                self.stdout.write(f"Exists: {definition.slot_key}")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone: {created_count} created, {existing_count} already exist "
                f"({len(AD_SLOT_DEFINITIONS)} slots total)"
            )
        )
        self.stdout.write(
            "\nNext: Django Admin → Ads → add paid or house ads per slot and date range."
        )
