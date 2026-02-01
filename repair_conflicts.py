
import os
import re

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match git conflict markers
    # <<<<<<< HEAD
    # ... content A ...
    # =======
    # ... content B ...
    # >>>>>>> hash ...
    
    # We want to keep Content B (Theirs/Incoming)
    
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n?', re.DOTALL)
    
    if not pattern.search(content):
        return False

    new_content = pattern.sub(r'\2', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return True

def main():
    root_dir = '/Users/viosson/AITD/1_PROJECTS/P16_TOPOO_GATEWAY/src'
    count = 0
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.json'):
                filepath = os.path.join(subdir, file)
                if repair_file(filepath):
                    print(f"Repaired: {filepath}")
                    count += 1
    print(f"Total files repaired: {count}")

if __name__ == "__main__":
    main()
