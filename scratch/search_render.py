with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if '<KnowledgeMap' in line or 'setActiveTab' in line or 'activeTab ===' in line or 'activeArticleId' in line:
        print(f"{idx}: {line.strip()}")
