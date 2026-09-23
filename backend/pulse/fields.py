"""Resize, crop, and save uploads as WebP."""
from __future__ import annotations

import io

from django.core.files.base import ContentFile
from django.core.files.uploadedfile import UploadedFile
from django.db.models import ImageField
from PIL import Image


def process_image(
    file_obj,
    *,
    max_size: tuple[int, int] | None = None,
    crop_size: tuple[int, int] | None = None,
    quality: int = 85,
    format: str = "WEBP",
) -> bytes:
    """Read an upload, optionally resize/crop, return WebP bytes."""
    image = Image.open(file_obj)

    if image.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", image.size, (255, 255, 255))
        if image.mode == "P":
            image = image.convert("RGBA")
        mask = image.split()[-1] if image.mode in ("RGBA", "LA") else None
        background.paste(image, mask=mask)
        image = background
    elif image.mode != "RGB":
        image = image.convert("RGB")

    if crop_size:
        width, height = crop_size
        scale = max(width / image.width, height / image.height)
        resized = image.resize(
            (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
            Image.Resampling.LANCZOS,
        )
        left = (resized.width - width) // 2
        top = (resized.height - height) // 2
        image = resized.crop((left, top, left + width, top + height))
    elif max_size:
        image.thumbnail(max_size, Image.Resampling.LANCZOS)

    output = io.BytesIO()
    image.save(output, format=format, quality=quality, optimize=True)
    return output.getvalue()


class ProcessedImageField(ImageField):
    """ImageField that processes new uploads before saving."""

    def __init__(
        self,
        *,
        max_size: tuple[int, int] | None = None,
        crop_size: tuple[int, int] | None = None,
        quality: int = 85,
        format: str = "WEBP",
        **kwargs,
    ) -> None:
        self.max_size = max_size
        self.crop_size = crop_size
        self.quality = quality
        self.image_format = format
        super().__init__(**kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        if self.max_size:
            kwargs["max_size"] = self.max_size
        if self.crop_size:
            kwargs["crop_size"] = self.crop_size
        if self.quality != 85:
            kwargs["quality"] = self.quality
        if self.image_format != "WEBP":
            kwargs["format"] = self.image_format
        return name, path, args, kwargs

    def pre_save(self, model_instance, add):
        file = getattr(model_instance, self.attname, None)
        if file and isinstance(file, UploadedFile) and not file._committed:
            data = process_image(
                file,
                max_size=self.max_size,
                crop_size=self.crop_size,
                quality=self.quality,
                format=self.image_format,
            )
            setattr(model_instance, self.attname, ContentFile(data, name=file.name))
        return super().pre_save(model_instance, add)
