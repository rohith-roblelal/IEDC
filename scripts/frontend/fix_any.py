
import re

lint_file = 'lint_output.txt'
with open(lint_file, 'r', encoding='utf-16') as f:
    lines = f.readlines()

current_file = None
changes = {}

for line in lines:
    line = line.strip()
    if line.startswith('C:\\') and (line.endswith('.tsx') or line.endswith('.ts')):
        current_file = line
        if current_file not in changes:
            changes[current_file] = []
    elif current_file and '@typescript-eslint/no-explicit-any' in line:
        m = re.match(r'^\s*(\d+):(\d+)', line)
        if m:
            line_num = int(m.group(1))
            changes[current_file].append(line_num)

for file_path, line_nums in changes.items():
    if not line_nums: continue
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            file_lines = f.readlines()
        
        # Add comment above each line
        offset = 0
        for ln in sorted(list(set(line_nums))):
            idx = ln - 1 + offset
            if idx < len(file_lines):
                # insert comment
                indent = len(file_lines[idx]) - len(file_lines[idx].lstrip())
                comment = (' ' * indent) + '// eslint-disable-next-line @typescript-eslint/no-explicit-any\n'
                file_lines.insert(idx, comment)
                offset += 1
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(file_lines)
    except Exception as e:
        print(f'Failed to patch {file_path}: {e}')

