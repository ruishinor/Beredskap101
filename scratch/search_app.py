with open('src/App.tsx', 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if 'handleOpenFeaturedGuide' in line:
            print(f"{idx}: {line.strip()}")
