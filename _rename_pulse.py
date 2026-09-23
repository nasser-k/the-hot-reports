"""Rename the Django project package and pulse-prefixed identifiers."""
from pathlib import Path

root = Path(r"D:\CascadeProjects\thehotreports")
backend = root / "backend"

src = backend / "pulse"
dst = backend / "hotreports"
if src.exists() and not dst.exists():
    src.rename(dst)
    print("moved package")
elif dst.exists():
    print("package already moved")
else:
    raise SystemExit("package folder missing")

renames = [
    (backend / "static" / "admin" / "css" / "pulse_admin.css", backend / "static" / "admin" / "css" / "hotreports_admin.css"),
    (backend / "templates" / "admin" / "pulse_index.html", backend / "templates" / "admin" / "hotreports_index.html"),
]
for old, new in renames:
    if old.exists() and not new.exists():
        old.rename(new)
        print("renamed", old.name)

skip_dirs = {".git", "node_modules", ".venv", "__pycache__", ".next"}
suffixes = {".py", ".html", ".css", ".md", ".ini", ".ts", ".tsx", ".txt"}
frontend_only = {
    root / "frontend" / "lib" / "preferences.ts",
    root / "frontend" / "lib" / "visitor.ts",
    root / "frontend" / "app" / "layout.tsx",
}

replacements = [
    ("PulseAdminSite", "HotReportsAdminSite"),
    ("PulseConfig", "HotReportsConfig"),
    ("pulse_admin_site", "hotreports_admin_site"),
    ("pulse.", "hotreports."),
    ("--pulse-", "--hotreports-"),
    ("pulse_", "hotreports_"),
    ("pulse-", "hotreports-"),
    ("pulse project", "The Hot Reports project"),
    ("├── pulse/", "├── hotreports/"),
    ('name = "pulse"', 'name = "hotreports"'),
]

changed = []
for path in root.rglob("*"):
    if any(part in skip_dirs for part in path.parts):
        continue
    if not path.is_file() or path.suffix.lower() not in suffixes:
        continue
    if "indexing" in path.name:
        continue
    if path.name == "_rename_pulse.py":
        continue
    # Tailwind's animate-pulse is a framework class, not a project identifier.
    if "frontend" in path.parts and path not in frontend_only:
        continue
    text = path.read_text(encoding="utf-8")
    updated = text
    for old, new in replacements:
        updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated, encoding="utf-8", newline="\n")
        changed.append(str(path.relative_to(root)))

print(f"updated {len(changed)} files")
for item in changed:
    print(item)
