import re, glob

for path in glob.glob('frontend/src/**/*.tsx', recursive=True):
    content = open(path, encoding='utf-8').read()
    lines = content.split('\n')
    matches = []
    for idx, line in enumerate(lines):
        if 'currencyPrefix' in line or 'fmtCurrency' in line or 'toLocaleString' in line or '$' in line or '₹' in line:
            # exclude template string interpolations like `${
            clean = re.sub(r'\$\{[^}]*\}', '', line)
            if '$' in clean or 'currencyPrefix' in line or 'fmtCurrency' in line or 'toLocaleString' in line or '₹' in line:
                matches.append((idx + 1, line.strip()))
    if matches:
        print(f"=== {path} ({len(matches)}) ===")
        for line_no, m in matches[:10]:
            print(f"  L{line_no}: {m}")
