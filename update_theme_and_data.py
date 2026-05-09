import json
import os

base_dir = '/Users/duboisca/.gemini/antigravity/scratch/cindy-platform'

# 1. Update styles.css
css_path = os.path.join(base_dir, 'styles.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

css_content = css_content.replace('#ccff00', '#0088ff')
css_content = css_content.replace('#b3e600', '#0066cc')
css_content = css_content.replace('204, 255, 0', '0, 136, 255')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

# 2. Clear state.json
state_path = os.path.join(base_dir, 'server/data/state.json')
with open(state_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for key in ['arcsData', 'goalsData', 'calendarEvents', 'narratives', 'networkData', 'reachOutContactsData']:
    if key in data:
        data[key] = []

if 'mediaAssets' in data:
    for asset in data['mediaAssets']:
        for list_key in ['weeklyRecapLinks', 'monthlyRecapLinks', 'tiktokSoloTrendLinks', 'tiktokCollabTrendLinks']:
            if list_key in asset:
                asset[list_key] = []

with open(state_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Theme updated to blue and data cleared successfully.")
