from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.db import transaction
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = "Create default users and groups for The Hot Reports"

    def handle(self, *args, **options):
        with transaction.atomic():
            # Create groups
            self.stdout.write("Creating user groups...")
            
            # Reporter group - Can create/edit own articles, view categories/tags
            reporter_group, created = Group.objects.get_or_create(name="Reporter")
            if created:
                reporter_perms = Permission.objects.filter(
                    codename__in=[
                        # Articles - create, edit own, view
                        "add_article", "change_article", "view_article",
                        "view_tag",
                        # Contact messages - view only (news tips)
                        "view_contactmessage",
                    ]
                )
                reporter_group.permissions.set(reporter_perms)
                self.stdout.write(self.style.SUCCESS("Created Reporter group"))
            
            # Editor group - Editor-in-Chief with full content management
            editor_group, created = Group.objects.get_or_create(name="Editor")
            if created:
                editor_perms = Permission.objects.filter(
                    codename__in=[
                        # Articles - full control
                        "add_article", "change_article", "delete_article", "view_article",
                        "can_publish_article",
                        # Tags - full control
                        "add_tag", "change_tag", "delete_tag", "view_tag",
                        # Newsletter subscribers - full control
                        "add_newslettersubscriber", "change_newslettersubscriber",
                        "delete_newslettersubscriber", "view_newslettersubscriber",
                        # Contact messages - full control (manage feedback/news tips)
                        "add_contactmessage", "change_contactmessage",
                        "delete_contactmessage", "view_contactmessage",
                        # Push subscriptions - full control
                        "add_pushsubscription", "change_pushsubscription",
                        "delete_pushsubscription", "view_pushsubscription",
                        # Tourism - full control
                        "add_tourismlisting", "change_tourismlisting", "delete_tourismlisting", "view_tourismlisting",
                        # Analytics - view only (article stats)
                        "view_articleviewevent", "view_articlevisitorday",
                        # Users - view team members
                        "view_user",
                        # Story Series and Episodes - view/delete only (storywriters handle add/change)
                        "delete_storyseries", "view_storyseries",
                        "delete_storyepisode", "view_storyepisode",
                        # Story Comments - moderate
                        "change_storyepisodecomment", "delete_storyepisodecomment", "view_storyepisodecomment",
                        # Story Analytics - view only
                        "view_storyviewevent", "view_storyvisitorday",
                        "view_storyepisodelike", "view_storyshare",
                    ]
                )
                editor_group.permissions.set(editor_perms)
                self.stdout.write(self.style.SUCCESS("Created Editor group with full permissions"))
            
            # Story Writer group - Full control over stories only
            storywriter_group, created = Group.objects.get_or_create(name="storywriter")
            if created:
                storywriter_perms = Permission.objects.filter(
                    codename__in=[
                        # Story Series - full control
                        "add_storyseries", "change_storyseries", "delete_storyseries", "view_storyseries",
                        # Story Episodes - full control
                        "add_storyepisode", "change_storyepisode", "delete_storyepisode", "view_storyepisode",
                        # Story Comments - moderate
                        "change_storyepisodecomment", "delete_storyepisodecomment", "view_storyepisodecomment",
                        # Story Likes/Shares/Views - read only
                        "view_storyepisodelike", "view_storyshare", "view_storyviewevent", "view_storyvisitorday",
                    ]
                )
                storywriter_group.permissions.set(storywriter_perms)
                self.stdout.write(self.style.SUCCESS("Created Story Writer group with full story permissions"))

            ads_group, created = Group.objects.get_or_create(name="Ads Manager")
            if created:
                ads_perms = Permission.objects.filter(content_type__app_label="ads")
                ads_group.permissions.set(ads_perms)
                self.stdout.write(self.style.SUCCESS("Created Ads Manager group with full ad permissions"))

            self.stdout.write("\nCreating users...")
            credentials = []
            
            # Create users with secure passwords (5 default users)
            # Emails can be customized via environment variables
            site_domain = config("SITE_DOMAIN", default="thehotreports.com")
            # Remove www. prefix if present to avoid emails like admin@www.domain.com
            if site_domain.startswith("www."):
                site_domain = site_domain[4:]
            users_to_create = [
                {
                    "email": config("USER_ADMIN_EMAIL", default=f"admin@{site_domain}"),
                    "role": "System Administrator",
                    "name": "Admin",
                    "superuser": True,
                    "group": None,
                    "perms": [],
                },
                {
                    "email": config("USER_EDITOR_EMAIL", default=f"editor@{site_domain}"),
                    "role": "Editor",
                    "name": "Sarah Mugisha",
                    "superuser": False,
                    "group": editor_group,
                    "perms": ["can_publish_article"],
                    "bio": "Leading The Hot Reports with a passion for storytelling and community journalism.",
                },
                {
                    "email": config("USER_REPORTER_EMAIL", default=f"reporter@{site_domain}"),
                    "role": "Reporter",
                    "name": "Grace Akankwasa",
                    "superuser": False,
                    "group": reporter_group,
                    "perms": [],
                    "bio": "Reporting news from across Uganda.",
                },
                {
                    "email": config("USER_ADS_EMAIL", default=f"ads@{site_domain}"),
                    "role": "Ads Manager",
                    "name": "David Byaruhanga",
                    "superuser": False,
                    "group": ads_group,
                    "perms": [],
                    "bio": "Managing advertising partnerships and campaigns.",
                },
                {
                    "email": config("USER_STORIES_EMAIL", default=f"stories@{site_domain}"),
                    "role": "Story Writer",
                    "name": "Anita Tumukunde",
                    "superuser": False,
                    "group": storywriter_group,
                    "perms": [],
                    "bio": "A gifted storywriter weaving captivating tales of village drama, campus life, and true-life experiences. Dedicated to bringing authentic African narratives to life.",
                },
            ]
            
            for user_data in users_to_create:
                if not User.objects.filter(email=user_data["email"]).exists():
                    # Get password from env var
                    env_key = f"USER_{user_data['email'].split('@')[0].upper()}_PASSWORD"
                    password = config(env_key, default="")
                    
                    if not password:
                        self.stdout.write(self.style.WARNING(
                            f"Skipping {user_data['role']}: No password set in env var {env_key}"
                        ))
                        continue
                    
                    extra_fields = {
                        "full_name": user_data["name"],
                        "role": user_data["role"],
                        "is_staff": True,  # All default users can access admin
                    }
                    
                    if "bio" in user_data:
                        extra_fields["bio"] = user_data["bio"]
                    
                    if user_data["email"] in [config("USER_REPORTER_EMAIL", default=f"reporter@{site_domain}"), config("USER_EDITOR_EMAIL", default=f"editor@{site_domain}")]:
                        extra_fields["show_on_about_page"] = True
                    elif user_data["email"] == config("USER_ADS_EMAIL", default=f"ads@{site_domain}"):
                        extra_fields["show_on_about_page"] = False
                    
                    if user_data["superuser"]:
                        user = User.objects.create_superuser(
                            email=user_data["email"],
                            password=password,
                            **extra_fields
                        )
                    else:
                        user = User.objects.create_user(
                            email=user_data["email"],
                            password=password,
                            **extra_fields
                        )
                    
                    if user_data["group"]:
                        user.groups.add(user_data["group"])
                    
                    for perm_codename in user_data["perms"]:
                        user.user_permissions.add(
                            Permission.objects.get(codename=perm_codename)
                        )
                    
                    self.stdout.write(self.style.SUCCESS(
                        f"Created {user_data['role']}: {user.email}"
                    ))
                    credentials.append((user_data["role"], user.email, password))
                else:
                    self.stdout.write(self.style.WARNING(
                        f"{user_data['role']} already exists"
                    ))

            # Output credentials
            self.stdout.write("\n" + "="*60)
            self.stdout.write(self.style.SUCCESS("User setup complete!"))
            self.stdout.write("="*60)
            
            if credentials:
                self.stdout.write(self.style.WARNING("\nIMPORTANT: SAVE THESE CREDENTIALS!"))
                self.stdout.write("They will not be shown again.\n")
                self.stdout.write("-" * 60)
                for role, email, password in credentials:
                    self.stdout.write(f"{role:20} | {email:30} | {password}")
                self.stdout.write("-" * 60)
                self.stdout.write("\nTo set custom passwords, use environment variables:")
                self.stdout.write("  USER_ADMIN_PASSWORD=yourpassword")
                self.stdout.write("  USER_EDITOR_PASSWORD=yourpassword")
                self.stdout.write("  etc.")
            
            self.stdout.write("\nAccess Django Admin at: http://localhost:8000/admin/")
            self.stdout.write("="*60 + "\n")
