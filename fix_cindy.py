import re
import os

app_js_path = '/Users/duboisca/.gemini/antigravity/scratch/cindy-platform/app.js'

with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clear CINDY_PLATFORM_PHOTO
content = re.sub(r"const CINDY_PLATFORM_PHOTO = '.*?';", "const CINDY_PLATFORM_PHOTO = '';", content)

# 2. Comment out the ensure... functions
functions_to_disable = [
    'ensureCollegeTakeoverArc()',
    'ensureF1LinkedStreams()',
    'ensureSeedNetworkPeople()',
    'ensureNetworkPhotoDefaults()',
    'normalizeReachOutContactsData()'
]

for func in functions_to_disable:
    content = content.replace(func + ';', '// ' + func + ';')

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed ensure functions and CINDY_PLATFORM_PHOTO.")
