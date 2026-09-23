from django.contrib.auth import get_user_model
from rest_framework import serializers
from hotreports.media_urls import default_avatar_url

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    full_name = serializers.CharField(max_length=255, allow_blank=True, required=False, default="")

    class Meta:
        model = User
        fields = ("email", "password", "full_name")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserMeSerializer(serializers.ModelSerializer):
    avatar_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "avatar_url",
            "avatar_image_url",
            "phone",
            "bio",
            "date_joined",
        )

    def get_avatar_image_url(self, obj) -> str:
        request = self.context.get("request")
        try:
            avatar = obj.get_avatar_url(request)
        except Exception:
            avatar = default_avatar_url(request=request)
        return avatar or default_avatar_url(request=request)


class UserMeUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ("full_name", "avatar_url", "avatar", "phone", "bio")


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, style={"input_type": "password"})
    new_password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    def validate_current_password(self, value: str) -> str:
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class TeamMemberSerializer(serializers.ModelSerializer):
    """Public serializer for team members shown on About page"""
    fullName = serializers.CharField(source="full_name", read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("fullName", "role", "avatar", "bio")

    def get_avatar(self, obj) -> str:
        request = self.context.get("request")
        try:
            avatar = obj.get_avatar_url(request)
        except Exception:
            avatar = default_avatar_url(request=request)
        return avatar or default_avatar_url(request=request)
