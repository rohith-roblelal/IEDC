import os, glob, re
target_dir = "frontend/src"
files = glob.glob(f"{target_dir}/**/*.tsx", recursive=True)
for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "localStorage" in content or "Bearer ${token}" in content:
        # Remove const token = localStorage.getItem("access_token");
        content = re.sub(r"^\s*const token = localStorage\.getItem\([\"']access_token[\"']\);?\n", "", content, flags=re.MULTILINE)
        
        # Remove Authorization header
        content = re.sub(r"^\s*Authorization:\s*`Bearer \${token}`[,\s]*\n", "", content, flags=re.MULTILINE)
        
        # Remove empty headers object if any (e.g. headers: { \n } )
        content = re.sub(r"headers:\s*{\s*},?\n", "", content, flags=re.MULTILINE)
        
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed {file}")

