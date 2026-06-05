with open('src/components/KnowledgeMap.tsx', 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if '<h1' in line or '<h2' in line or '<h3' in line or '<h4' in line or 'font-black' in line:
            print(f"{idx}: {line.strip()}")
