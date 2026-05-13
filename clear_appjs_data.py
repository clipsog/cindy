import re
import os

app_js_path = '/Users/duboisca/cindy-platform/app.js'

with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the initializations
content = content.replace('let arcsData = cloneSeed(SEED_ARCS);', 'let arcsData = [];')
content = content.replace('let goalsData = cloneSeed(SEED_GOALS);', 'let goalsData = [];')
content = content.replace('let networkData = cloneSeed(SEED_NETWORK);', 'let networkData = [];')

# For reachOutContactsData, it's an object/dictionary
content = content.replace('let reachOutContactsData = cloneSeed(SEED_REACH_OUT_CONTACTS);', 'let reachOutContactsData = {};')

# For mediaAssets, let's keep the platforms but clear out the specific link arrays inside the SEED_MEDIA declaration or in app.js
content = re.sub(r'tiktokSoloTrendLinks:\s*\[.*?\]', 'tiktokSoloTrendLinks: []', content, flags=re.DOTALL)
content = re.sub(r'tiktokCollabTrendLinks:\s*\[.*?\]', 'tiktokCollabTrendLinks: []', content, flags=re.DOTALL)
content = re.sub(r'weeklyRecapLinks:\s*\[.*?\]', 'weeklyRecapLinks: []', content, flags=re.DOTALL)
content = re.sub(r'monthlyRecapLinks:\s*\[.*?\]', 'monthlyRecapLinks: []', content, flags=re.DOTALL)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("app.js seed initializations cleared.")
