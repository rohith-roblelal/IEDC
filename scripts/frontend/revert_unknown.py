
import os, re
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'unknown' in content:
                # Naive replace, since I only introduced them recently in places where any was used
                content = re.sub(r': unknown', r': any', content)
                content = re.sub(r'<unknown>', r'<any>', content)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

