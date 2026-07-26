import os, glob, re
target_dir = "frontend/src"
files = glob.glob(f"{target_dir}/**/*.tsx", recursive=True)
for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "Bearer ${token}" in content:
        # Regex to match headers object that only contains Authorization: Bearer ${token}
        # e.g., headers: { Authorization: `Bearer ${token}` } -> just remove the headers block entirely
        content = re.sub(r"headers:\s*\{\s*[\"'\s]*Authorization[\"'\s]*:\s*`Bearer \$\{token\}`\s*\},?", "", content, flags=re.MULTILINE)
        
        # Regex to match when Authorization is inside a headers object with other headers
        # e.g., headers: { "Content-Type": "...", Authorization: `Bearer ${token}` }
        content = re.sub(r"[\"'\s]*Authorization[\"'\s]*:\s*`Bearer \$\{token\}`\s*,?", "", content, flags=re.MULTILINE)
        
        # Remove trailing comma inside headers if it was left empty
        content = re.sub(r"headers:\s*\{\s*,\s*\}", "headers: {}", content, flags=re.MULTILINE)
        
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed headers in {file}")

