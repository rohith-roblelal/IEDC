import os
directory = r'c:\Users\Rohith Roblelal\Desktop\projects\IEDC\backend\app\api\endpoints'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            content = content.replace('@router.get("/")', '@router.get("")')
            content = content.replace('@router.post("/")', '@router.post("")')
            content = content.replace('@router.put("/")', '@router.put("")')
            content = content.replace('@router.delete("/")', '@router.delete("")')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
print("done")
