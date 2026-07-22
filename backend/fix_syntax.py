import os

directory = r'c:\Users\Rohith Roblelal\Desktop\projects\IEDC\backend\app\api\endpoints'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove the literal backslashes that were accidentally inserted
            content = content.replace(r'\"\"', '""')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
print("Done fixing syntax errors!")
