import os
import re
import glob

FRONTEND_DIR = r"c:\Users\Rohith Roblelal\Desktop\projects\IEDC\frontend\src"

files = glob.glob(os.path.join(FRONTEND_DIR, "**", "*.tsx"), recursive=True)

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Find where token is defined and remove it (including eslint comments before it)
    content = re.sub(r'(?://\s*eslint-disable-next-line\s+.*?\n)?\s*(?:const|let|var)\s+token\s*=\s*localStorage\.getItem\([\'"]access_token[\'"]\);\s*\n?', '', content)

    # Remove `"Authorization": `Bearer ${token}`` or `Authorization: `Bearer ${token}``
    content = re.sub(r'[\'"]?Authorization[\'"]?\s*:\s*`Bearer\s+\$\{token\}`\s*,?\s*\n?', '', content, flags=re.MULTILINE)
    
    # Remove empty headers block if any
    content = re.sub(r'headers:\s*\{\s*\},?\s*\n?', '', content, flags=re.MULTILINE)

    # Some files still have `token` defined differently? No, the first regex caught it but then the file was saved.
    # Now there's no `token` defined, so we just need to remove the references to `token`.
    content = re.sub(r'(?://\s*eslint-disable-next-line\s+.*?\n)?\s*[\'"]?Authorization[\'"]?\s*:\s*`Bearer\s+\$\{token\}`\s*,?\s*\n?', '', content, flags=re.MULTILINE)

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
    
print("Fixed auth headers again in all files.")
