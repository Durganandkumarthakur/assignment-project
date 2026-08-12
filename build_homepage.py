import re
from pathlib import Path

BASE = Path(__file__).parent
ref = (BASE / "reference.html").read_text(encoding="utf-8", errors="ignore")

m = re.search(r"<style>(.*?)</style>", ref, re.DOTALL)
styles = m.group(1) if m else ""
(BASE / "frontend-assets/css/page-home.css").write_text(styles, encoding="utf-8")

bm = re.search(r"<body>(.*)</body>", ref, re.DOTALL)
body = bm.group(1) if bm else ""

body = re.sub(r'<script defer="">\s*window\.onload.*?</script>', "", body, flags=re.DOTALL)
body = re.sub(r"<!-- WhatsApp removed.*?-->", "", body)

head = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Tcongs Infotech - Smart Digital Solutions for Modern Businesses. Web and App Development, Software Solutions, E-commerce, Digital Marketing.">
<title>Web & App Development Company | Tcongs Infotech</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geologica:wght@100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
<link rel="icon" href="frontend-assets/images/svgs/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="frontend-assets/css/colors.css">
<link rel="stylesheet" href="frontend-assets/css/style.css">
<link rel="stylesheet" href="frontend-assets/css/common.css">
<link rel="stylesheet" href="frontend-assets/css/custom-animations.css">
<link rel="stylesheet" href="frontend-assets/css/home.css">
<link rel="stylesheet" href="frontend-assets/css/services-dropdown.css">
<link rel="stylesheet" href="frontend-assets/css/page-home.css">
</head>
<body>
"""

tail = """
<script src="js/script.js"></script>
<script src="frontend-assets/js/services-dropdown.js"></script>
</body>
</html>
"""

replacements = {
    "frontend-assets/images/svgs/ecommerce-website-commerce-and-shopping-2-svgrepo-com (2).svg": "frontend-assets/images/svgs/ecommerce.svg",
    "frontend-assets/images/svgs/digital-marketing-promotion-advertising-svgrepo-com (3).svg": "frontend-assets/images/svgs/marketing.svg",
    "frontend-assets/images/Monochrome Illustrated Fashion Video.gif": "frontend-assets/images/growth.gif",
    "frontend-assets/images/Discovery Business Market Analysis.jpg": "frontend-assets/images/discovery.jpg",
    "frontend-assets/images/Planning.jpg": "frontend-assets/images/planning.jpg",
    "frontend-assets/images/Design UIUX Branding.jpg": "frontend-assets/images/design.jpg",
    "frontend-assets/images/Development Web App Development.jpg": "frontend-assets/images/development.jpg",
    "frontend-assets/images/Launch.jpg": "frontend-assets/images/launch.jpg",
}

for old, new in replacements.items():
    body = body.replace(old, new)

body = body.replace('href="index.html"', 'href="#"')
body = body.replace('href="about.html"', 'href="#about"')
body = body.replace('href="work-with-us.html"', 'href="#contact"')
body = re.sub(r'href="services/[^"]+"', 'href="#services"', body)

# Add section ids for single-page navigation
body = body.replace('<section class="py_56 sm_py_32 relative behind-cursor" style="background-color: var(--color-black-300)">', '<section class="py_56 sm_py_32 relative behind-cursor" id="services" style="background-color: var(--color-black-300)">', 1)
body = body.replace('<section class="py_56 sm_py_32">', '<section class="py_56 sm_py_32" id="process">', 1)
body = body.replace('<section class="py_56 sm_py_32 relative behind-cursor">', '<section class="py_56 sm_py_32 relative behind-cursor" id="contact">', 1)

out = head + body + tail
(BASE / "index.html").write_text(out, encoding="utf-8")
print("index.html:", len(out), "chars")
print("page-home.css:", len(styles), "chars")
