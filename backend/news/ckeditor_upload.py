"""CKEditor 5 image upload handler."""
import os
from datetime import datetime

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.utils.text import slugify
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from hotreports.fields import process_image
from hotreports.media_urls import absolute_url


def generate_upload_path(filename: str) -> str:
    """content-images/YYYY/MM/slug-timestamp.webp"""
    now = datetime.now()
    slug = slugify(os.path.splitext(filename)[0])[:50] or "image"
    return f"content-images/{now:%Y/%m}/{slug}-{now:%H%M%S}.webp"


@csrf_exempt
@require_http_methods(["POST"])
def ckeditor5_image_upload(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({"error": "Unauthorized"}, status=403)

    uploaded_file = request.FILES.get("upload")
    if not uploaded_file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    try:
        data = process_image(uploaded_file, max_size=(1600, 1600))
        path = default_storage.save(generate_upload_path(uploaded_file.name), ContentFile(data))
        return JsonResponse({"url": absolute_url(default_storage.url(path), request=request), "uploaded": True})
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=500)
