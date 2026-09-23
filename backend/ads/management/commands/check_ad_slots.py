"""
Verify DB ad slots match backend/ads/slots.py registry.
Run: python manage.py check_ad_slots
"""
from django.core.management.base import BaseCommand

from ads.models import AdSlot
from ads.slots import AD_SLOT_DEFINITIONS, AD_SLOT_KEYS


class Command(BaseCommand):
    help = "Report ad slot registry vs database alignment"

    def handle(self, *args, **options):
        db_keys = set(AdSlot.objects.values_list("slot_key", flat=True))
        missing_in_db = AD_SLOT_KEYS - db_keys
        extra_in_db = db_keys - AD_SLOT_KEYS

        self.stdout.write(f"Registry: {len(AD_SLOT_DEFINITIONS)} slots")
        self.stdout.write(f"Database: {len(db_keys)} slots")

        if missing_in_db:
            self.stdout.write(
                self.style.WARNING(
                    f"Missing in DB (run setup_ad_slots): {', '.join(sorted(missing_in_db))}"
                )
            )
        if extra_in_db:
            self.stdout.write(
                self.style.WARNING(
                    f"Extra in DB (not in registry): {', '.join(sorted(extra_in_db))}"
                )
            )
        if not missing_in_db and not extra_in_db:
            self.stdout.write(self.style.SUCCESS("All slots aligned."))
