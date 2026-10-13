"""Validate the public case-study documentation without external packages."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = [
    "README.md",
    "ARCHITECTURE.md",
    "SECURITY_MODEL.md",
    "ENGINEERING_DECISIONS.md",
    "SECURITY.md",
    "ROADMAP.md",
]
failures = []
for filename in DOCS:
    file = ROOT / filename
    if not file.is_file():
        failures.append(f"Missing required document: {filename}")
        continue
    data = file.read_text(encoding="utf-8")
    if len(data.strip()) < 100:
        failures.append(f"Document is unusually short: {filename}")
    for target in re.findall(r"\]\(([^)]+)\)", data):
        clean = target.strip().split("#", 1)[0]
        if clean and not clean.startswith(("https://", "http://", "mailto:")):
            link = (file.parent / clean).resolve()
            if not link.is_relative_to(ROOT.resolve()) or not link.is_file():
                failures.append(f"{filename}: broken relative Markdown link: {target}")
    if re.search(r"-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----", data):
        failures.append(f"{filename}: private key material in documentation")
if (ROOT / "ARCHITECTURE.md").is_file():
    arch = (ROOT / "ARCHITECTURE.md").read_text(encoding="utf-8")
    for word in ("Trust boundaries", "Evidence", "privacy", "Maturity", "mermaid"):
        if word.casefold() not in arch.casefold():
            failures.append(f"Architecture missing coverage: {word}")
demo = ROOT / "demo/index.html"
if not demo.is_file():
    failures.append("Missing offline synthetic demo")
else:
    demo_text = demo.read_text(encoding="utf-8")
    if "ساختگی" not in demo_text or "Offline" not in demo_text:
        failures.append("Demo must visibly disclose fabricated data and offline scope")
    for forbidden in ("fetch(", "XMLHttpRequest(", "WebSocket("):
        if forbidden in demo_text:
            failures.append("External IO not permitted in synthetic demo")
if failures:
    for failure in failures:
        print("FAIL:", failure, file=sys.stderr)
    sys.exit(1)
print(f"PASS: {len(DOCS)} public documents checked (links, coverage, basic secret hygiene)")
