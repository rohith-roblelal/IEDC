import os
import re

directory = r'c:\Users\Rohith Roblelal\Desktop\projects\IEDC\backend\app\api\endpoints'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Use regex to match @router.get("/") or @router.post("/", ...)
            content = re.sub(r'@router\.([a-z]+)\(\s*\"/\"', r'@router.\1(\"\"', content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
print("Done fixing slashes with regex!")
