from django import template
from django.utils.safestring import SafeString

from pulse import admin_charts

register = template.Library()


@register.simple_tag
def pulse_chart(kind: str, series) -> SafeString | str:
    """Render inline SVG. kind: bars | sparkline | donut. series: list of tuples or None."""
    series = series or []
    if kind == "bars":
        return admin_charts.render_bars(series)
    if kind == "sparkline":
        return admin_charts.render_sparkline(series)
    if kind == "donut":
        return admin_charts.render_donut(series)
    return admin_charts.render_sparkline([])
