from django.urls import path

from .views import AdClickView, AdServeView, ad_slots_list

urlpatterns = [
    path("serve/<str:slot_key>/", AdServeView.as_view(), name="ad-serve"),
    path("click/<int:ad_id>/", AdClickView.as_view(), name="ad-click"),
    path("slots/", ad_slots_list, name="ad-slots"),
]
