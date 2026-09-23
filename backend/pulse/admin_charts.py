"""Server-rendered SVG charts for Django admin dashboards (no JS deps)."""

from __future__ import annotations

import html
from datetime import date, datetime, timedelta

from django.utils import timezone
from django.utils.safestring import mark_safe


def merge_series(end: date, days: int, data: dict[date, int]) -> list[tuple[date, int]]:
    start = end - timedelta(days=days - 1)
    return [(start + timedelta(days=i), int(data.get(start + timedelta(days=i), 0))) for i in range(days)]


def render_sparkline(series: list[tuple[date, int | float]], w: int = 360, h: int = 72, *, color: str = "#A21A47") -> str:
    if not series:
        return _empty_svg(w, h, "No data")
    vals = [float(v) for _, v in series]
    mx = max(vals) or 1.0
    pad = 4
    inner_w = w - pad * 2
    inner_h = h - pad * 2
    n = len(series)
    if n == 1:
        pts = [(pad, pad + inner_h - (vals[0] / mx) * inner_h), (pad + inner_w, pad + inner_h - (vals[0] / mx) * inner_h)]
    else:
        pts = []
        for i, v in enumerate(vals):
            x = pad + (i / (n - 1)) * inner_w
            y = pad + inner_h - (float(v) / mx) * inner_h
            pts.append((x, y))
    d_path = "M " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    area = f"M {pad},{pad + inner_h} L " + " L ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    area += f" L {pad + inner_w},{pad + inner_h} Z"
    return mark_safe(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
        f'role="img" aria-label="Sparkline"><path d="{html.escape(area)}" fill="{html.escape(color)}22" stroke="none"/>'
        f'<path d="{html.escape(d_path)}" fill="none" stroke="{html.escape(color)}" stroke-width="2" stroke-linecap="round"/></svg>'
    )


def render_bars(
    series: list[tuple[date, int]],
    w: int = 520,
    h: int = 140,
    *,
    color: str = "#A21A47",
    label_every: int = 5,
) -> str:
    if not series:
        return _empty_svg(w, h, "No data")
    vals = [v for _, v in series]
    mx = max(vals) or 1
    pad_l, pad_r, pad_t, pad_b = 36, 8, 8, 28
    bw = (w - pad_l - pad_r) / len(series)
    gap = max(1.0, bw * 0.15)
    bar_w = max(2.0, bw - gap)
    parts: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Bar chart">'
    ]
    baseline = h - pad_b
    parts.append(
        f'<line x1="{pad_l}" y1="{baseline}" x2="{w - pad_r}" y2="{baseline}" stroke="#9ca3af" stroke-width="1"/>'
    )
    parts.append(
        f'<text x="4" y="{pad_t + 10}" font-size="10" fill="#6b7280">{html.escape(str(mx))}</text>'
    )
    for i, (d, v) in enumerate(series):
        x = pad_l + i * bw + gap / 2
        bh = (v / mx) * (baseline - pad_t - 6)
        y = baseline - bh
        parts.append(
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_w:.1f}" height="{max(bh, 0):.1f}" rx="2" fill="{html.escape(color)}"/>'
        )
        if i % label_every == 0 or i == len(series) - 1:
            label = d.strftime("%m/%d")
            parts.append(
                f'<text x="{x:.0f}" y="{h - 6}" font-size="9" fill="#6b7280">{html.escape(label)}</text>'
            )
    parts.append("</svg>")
    return mark_safe("".join(parts))


def render_donut(parts: list[tuple[str, int, str]], w: int = 168) -> str:
    """parts: list of (label, value, color_hex). Single-ring segments via stroke-dasharray."""
    total = sum(p[1] for p in parts) or 1
    cx, cy, r, sw = w / 2, w / 2, w * 0.34, w * 0.12
    circ = 2 * 3.141592653589793 * r
    offset = 0.0
    arcs: list[str] = []
    for _label, val, col in parts:
        frac = val / total
        if frac <= 0:
            continue
        dash = frac * circ
        gap = circ - dash
        arcs.append(
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{html.escape(col)}" stroke-width="{sw:.1f}" '
            f'stroke-dasharray="{dash:.3f} {gap:.3f}" stroke-dashoffset="{-offset:.3f}" '
            f'transform="rotate(-90 {cx} {cy})"/>'
        )
        offset += dash
    if not arcs:
        return _empty_svg(w, w, "No data")
    return mark_safe(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{w}" viewBox="0 0 {w} {w}" role="img" aria-label="Donut">'
        + "".join(arcs)
        + "</svg>"
    )


def _empty_svg(w: int, h: int, msg: str) -> str:
    return mark_safe(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
        f'<text x="{w/2}" y="{h/2}" text-anchor="middle" fill="#9ca3af" font-size="12">{html.escape(msg)}</text></svg>'
    )


def daily_counts_for_model(*, qs, days: int = 30) -> list[tuple[date, int]]:
    from django.db.models import Count
    from django.db.models.functions import TruncDate

    end = timezone.now().date()
    start = end - timedelta(days=days - 1)
    start_dt = timezone.make_aware(datetime.combine(start, datetime.min.time()))
    rows = (
        qs.filter(created_at__gte=start_dt)
        .annotate(d=TruncDate("created_at"))
        .values("d")
        .annotate(c=Count("id"))
        .order_by("d")
    )
    data: dict[date, int] = {}
    for r in rows:
        d = r["d"]
        if hasattr(d, "date"):
            d = d.date()
        if d:
            data[d] = r["c"]
    return merge_series(end, days, data)


def daily_counts_by_day_field(*, qs, days: int = 30) -> list[tuple[date, int]]:
    """For models with a DateField `day` (e.g. ArticleVisitorDay)."""
    from django.db.models import Count

    end = timezone.now().date()
    start = end - timedelta(days=days - 1)
    rows = (
        qs.filter(day__gte=start)
        .values("day")
        .annotate(c=Count("id"))
        .order_by("day")
    )
    data: dict[date, int] = {}
    for r in rows:
        d = r["day"]
        if hasattr(d, "date"):
            d = d.date()
        if d:
            data[d] = r["c"]
    return merge_series(end, days, data)

