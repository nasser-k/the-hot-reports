"""Role helpers and bulk-action filtering for the admin."""


def is_editor(user) -> bool:
    return user.is_superuser or user.groups.filter(name="Editor").exists() or user.has_perm(
        "news.can_publish_article"
    )


def is_reporter(user) -> bool:
    return user.groups.filter(name="Reporter").exists()


def is_ads_manager(user) -> bool:
    return user.groups.filter(name="Ads Manager").exists()


def is_storywriter(user) -> bool:
    return user.groups.filter(name="storywriter").exists()


def is_content_creator(user) -> bool:
    return is_reporter(user) or is_storywriter(user)


def can_manage_ads(user) -> bool:
    return is_editor(user) or is_ads_manager(user)


class FilterActionsMixin:
    """Limit changelist bulk actions to what the current user may use."""

    def allowed_action_names(self, request) -> set[str] | None:
        """Return allowed action names, or None to keep Django defaults."""
        return None

    def get_actions(self, request):
        actions = super().get_actions(request)
        allowed = self.allowed_action_names(request)
        if allowed is None:
            return actions
        return {name: action for name, action in actions.items() if name in allowed}


class NoActionsMixin(FilterActionsMixin):
    """Hide all bulk actions on read-only changelists."""

    def allowed_action_names(self, request):
        return set()
