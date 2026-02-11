import json
import os

def split_json(file_path, chunk_size=2000):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not isinstance(data, list):
        print("JSON data is not a list.")
        return

    num_chunks = (len(data) + chunk_size - 1) // chunk_size
    output_dir = os.path.dirname(file_path)
    base_name = os.path.splitext(os.path.basename(file_path))[0]

    for i in range(num_chunks):
        start = i * chunk_size
        end = start + chunk_size
        chunk = data[start:end]
        output_file_path = os.path.join(output_dir, f"{base_name}_part_{i+1}.json")
        with open(output_file_path, 'w', encoding='utf-8') as chunk_file:
            json.dump(chunk, chunk_file, ensure_ascii=False, indent=2)
        print(f"Created {output_file_path}")

if __name__ == '__main__':
    split_json('assets/storage/dic.json')