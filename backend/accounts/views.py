from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    PasswordChangeSerializer,
    TeamMemberSerializer,
    UserMeSerializer,
    UserMeUpdateSerializer,
    UserRegistrationSerializer,
)
from .tokens import EmailTokenObtainPairSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"id": user.id, "email": user.email, "full_name": user.full_name},
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return UserMeUpdateSerializer
        return UserMeSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def patch(self, request, *args, **kwargs):
        # Ensure partial updates work cleanly.
        return self.partial_update(request, *args, **kwargs)


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        ser = PasswordChangeSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        user = request.user
        user.set_password(ser.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"success": True}, status=status.HTTP_200_OK)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class TeamMembersView(generics.ListAPIView):
    """Public endpoint to list team members for About page"""
    queryset = User.objects.filter(show_on_about_page=True, is_active=True, is_superuser=False).order_by('date_joined')
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx
