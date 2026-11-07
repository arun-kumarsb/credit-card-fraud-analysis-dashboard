import re

with open('references_extracted/stitch_fraudlens_analytics_dashboard/executive_fraud_analytics_overview/code.html', 'r', encoding='utf-8') as f:
    text = f.read()

fonts = set(re.findall(r'fonts\.googleapis\.com[^\"]*', text))
print('Fonts found:')
for font in fonts:
    print(' ', font)

icons = set(re.findall(r'material-symbols[^\"]*', text))
print('Material symbols / icons:')
for icon in icons:
    print(' ', icon)

classes = re.findall(r'class=\"([^\"]*)\"', text)
unique_classes = set()
for c in classes:
    for item in c.split():
        unique_classes.add(item)
print('Total unique CSS classes in executive overview:', len(unique_classes))
