import json
import os

def split_json(input_file, output_dir, output_prefix, chunk_size):
    """
    Splits a large JSON array file into smaller files.

    Args:
        input_file (str): Path to the input JSON file.
        output_dir (str): Directory to save the output files.
        output_prefix (str): Prefix for the output files.
        chunk_size (int): Number of objects per output file.
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading or parsing {input_file}: {e}")
        return

    if not isinstance(data, list):
        print("Error: The JSON file does not contain a list of objects.")
        return

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for i in range(0, len(data), chunk_size):
        chunk = data[i:i + chunk_size]
        output_file = os.path.join(output_dir, f"{output_prefix}_{i // chunk_size + 1}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(chunk, f, ensure_ascii=False, indent=4)
        print(f"Created {output_file} with {len(chunk)} objects.")

if __name__ == '__main__':
    input_json_file = 'assets/storage/dic.json'
    output_directory = 'assets/storage/split_dic'
    output_file_prefix = 'dic_part'
    items_per_file = 2000
    
    split_json(input_json_file, output_directory, output_file_prefix, items_per_file)
