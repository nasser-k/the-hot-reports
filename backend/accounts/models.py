from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from pulse.fields import ProcessedImageField
from pulse.media_storage import avatar_image_path
from pulse.media_urls import default_avatar_url, resolve_media_image


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField("email address", unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=255, blank=True, help_text="Job title/position (e.g., Editor-in-Chief)")
    avatar_url = models.URLField(max_length=500, blank=True)
    avatar = ProcessedImageField(
        upload_to=avatar_image_path,
        crop_size=(200, 200),
        blank=True,
        null=True,
        help_text="Upload an avatar image. Will be automatically resized to 200x200 and converted to WebP format. Saved as: avatars/YYYY/MM/slugified-name.webp"
    )
    phone = models.CharField(max_length=40, blank=True)
    bio = models.TextField(blank=True)
    show_on_about_page = models.BooleanField(default=False, help_text="Display this user on the About Us page")

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self) -> str:
        return self.email

    def get_avatar_url(self, request=None) -> str:
        """Uploaded avatar → external URL → static default."""
        url = resolve_media_image(
            file_field=self.avatar,
            external_url=self.avatar_url,
            request=request,
            allow_none=True,
        )
        return url or default_avatar_url(request=request)
