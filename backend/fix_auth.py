import os
import re
import glob

FRONTEND_DIR = r"c:\Users\Rohith Roblelal\Desktop\projects\IEDC\frontend\src"

files = glob.glob(os.path.join(FRONTEND_DIR, "**", "*.tsx"), recursive=True)

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Pattern 1: Remove const token = localStorage.getItem("access_token");
    content = re.sub(r'^\s*(?:const|let|var)\s+token\s*=\s*localStorage\.getItem\([\'"]access_token[\'"]\);\s*\n?', '', content, flags=re.MULTILINE)

    # Pattern 2: Remove Authorization header in fetch
    # This matches Authorization: `Bearer ${token}` optionally with trailing comma
    content = re.sub(r'Authorization:\s*`Bearer\s+\$\{token\}`\s*,?\s*\n?', '', content, flags=re.MULTILINE)
    
    # Pattern 3: If headers block becomes empty (e.g., headers: {}), remove it.
    # Note: Sometimes it has "Content-Type", so if it's left with just { "Content-Type": ... } that's fine.
    content = re.sub(r'headers:\s*\{\s*\},?\s*\n?', '', content, flags=re.MULTILINE)

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
    
print("Fixed auth headers in all files.")
