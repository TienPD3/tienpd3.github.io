#!/usr/bin/env python3
import json
import re
import os

def clean_data():
    """
    Reads dic.json, redacts sensitive information, and writes it back.
    """
    file_path = os.path.join('assets', 'storage', 'dic.json')

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading or parsing {file_path}: {e}")
        return

    # Using a dictionary for simple string replacements
    # Using a list of tuples for regex replacements (pattern, replacement)
    replacements = {
        # Companies (Japanese)
        "オッズ・パーク株式会社": "[COMPANY_NAME]",
        "オッズ・パーク": "[COMPANY_SHORT_NAME]",
        "ＦＰＴソフトウェアジャパン株式会社": "[COMPANY_NAME]",
        "FPTソフトウェアジャパン株式会社": "[COMPANY_NAME]",
        "FPTジャパンホールディングス株式会社": "[COMPANY_NAME]",
        "FPTコンサルティングジャパン株式会社": "[COMPANY_NAME]",
        "FPTコンサルティング": "[COMPANY_NAME]",
        "株式会社ミューチュアル・グロース": "[COMPANY_NAME]",
        "株式会社ヌーラボ": "[COMPANY_NAME]",
        "富士通": "[COMPANY_NAME]",
        # Companies (Vietnamese/English)
        "Odds Park Co., Ltd.": "[COMPANY_NAME]",
        "Odds Park": "[COMPANY_SHORT_NAME]",
        "FPT Software Japan Co., Ltd.": "[COMPANY_NAME]",
        "FPT Software Japan": "[COMPANY_NAME]",
        "FPT Japan Holdings Co., Ltd.": "[COMPANY_NAME]",
        "FPT Consulting Nhật Bản": "[COMPANY_NAME]",
        "Công ty TNHH Phần mềm FPT Nhật Bản": "[COMPANY_NAME]",
        "Công ty TNHH FPT Consulting Nhật Bản": "[COMPANY_NAME]",
        "Công ty TNHH FPT Holdings Nhật Bản": "[COMPANY_NAME]",
        "Công ty TNHH Phần mềm FPT Hồ Chí Minh": "[COMPANY_NAME]",
        "Mutual Growth Co., Ltd.": "[COMPANY_NAME]",
        "Nulab Inc.": "[COMPANY_NAME]",
        "Fujitsu": "[COMPANY_NAME]", # Typo in the original file was "Fujistu"
        "FPT": "[COMPANY_SHORT_NAME]",
        "OP": "[COMPANY_SHORT_NAME]", # Already an abbreviation

        # People (Japanese)
        "宮下　直之": "[PERSON_NAME]",
        "グエン・フウ・ロン": "[PERSON_NAME]",
        "宮原克博": "[PERSON_NAME]",
        "トラン・ティ・キム・フォン": "[PERSON_NAME]",
        "ド　ヴァン　カック": "[PERSON_NAME]",
        "NGUYEN　CUONG": "[PERSON_NAME]",
        "小林 宏次": "[PERSON_NAME]",
        "大根田剛": "[PERSON_NAME]",
        "木村　範彦": "[PERSON_NAME]",
        "河原塚": "[PERSON_NAME]",
        "有馬": "[PERSON_NAME]",
        # People (Vietnamese/English)
        "Naoyuki Miyashita": "[PERSON_NAME]",
        "Nguyễn Hữu Long": "[PERSON_NAME]",
        "Katsuhiro Miyahara": "[PERSON_NAME]",
        "Tran Thi Kim Phuong": "[PERSON_NAME]",
        "Do Van Khac": "[PERSON_NAME]", # Assuming translation
        "Kobayashi Koji": "[PERSON_NAME]",
        "Tsuyoshi Ooneda": "[PERSON_NAME]",
        "Kimura Norihiko": "[PERSON_NAME]",
        "Trần Thị Kim Phượng": "[PERSON_NAME]",

        # Addresses (Japanese)
        "東京都中央区京橋二丁目２番1号": "[ADDRESS]",
        "東京都港区芝公園一丁目７番６号": "[ADDRESS]",
        # Addresses (Vietnamese/English)
        "2-2-1 Kyobashi, Chuo-ku, Tokyo": "[ADDRESS]",
        "2-2-1 Kyobashi, Quận Chuo, Tokyo": "[ADDRESS]",
        "1-7-6 Shibakoen, Minato-ku, Tokyo": "[ADDRESS]",

        # Project Names
        "NEXTプロジェクト": "[PROJECT_NAME]",
        "NEXTPJ": "[PROJECT_NAME]",
    }

    # Regex for amounts and dates
    regex_replacements = [
        (r'\d{1,3}(,\d{3})+', "[AMOUNT]"), # Numbers with commas, e.g., 42,000,000
        (r'\d{4}年\s*\d{1,2}月\s*\d{1,2}日?', "[DATE]"), # YYYY年MM月DD日
        (r'Ngày \d{1,2} tháng \d{1,2} năm \d{4}', "[DATE]"), # Vietnamese date
        (r'\d{4}/\d{1,2}/\d{1,2}', "[DATE]"), # YYYY/MM/DD
    ]

    # These are too specific and should be removed entirely if they are the only content.
    sensitive_only_patterns = [
        # People
        "宮下　直之", "グエン・フウ・ロン", "宮原克博", "Tran Thi Kim Phuong", "ド　ヴァン　カック",
        "NGUYEN　CUONG", "小林 宏次", "大根田剛", "木村　範彦",
        # Companies
        "オッズ・パーク株式会社", "ＦＰＴソフトウェアジャパン株式会社", "FPTコンサルティングジャパン株式会社",
        "株式会社ミューチュアル・グロース", "FPTジャパンホールディングス株式会社", "FPTコンサルティング",
        "ジャパン株式会社",
        # Address
        "東京都中央区京橋２丁目２番1号", "東京都港区芝公園一丁目７番６号",
        # Prefixed versions
        "代表取締役社長", "代表者名", "OP：", "受託者：", "住{}所："
    ]

    new_data = []
    for item in data:
        jp_text = item.get('jp', '')
        vn_text = item.get('vn', '')

        # Check if the entry should be skipped
        is_sensitive_only = False
        for pattern in sensitive_only_patterns:
            if pattern in jp_text and len(jp_text.strip()) < len(pattern) + 20: # Heuristic to check if it's "just" the sensitive info
                is_sensitive_only = True
                break
        if is_sensitive_only:
            continue

        # Redact parts of the strings
        for old, new in replacements.items():
            jp_text = jp_text.replace(old, new)
            vn_text = vn_text.replace(old, new)

        # Redact using regex
        for pattern, new in regex_replacements:
            jp_text = re.sub(pattern, new, jp_text)
            vn_text = re.sub(pattern, new, vn_text)

        new_data.append({'jp': jp_text, 'vn': vn_text})

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            # Using indent=2 for readability and consistency with many JSON files
            # Using ensure_ascii=False to correctly write Japanese characters
            json.dump(new_data, f, ensure_ascii=False, indent=2)
        print(f"Successfully cleaned and overwrote {file_path}")
    except IOError as e:
        print(f"Error writing to {file_path}: {e}")

if __name__ == "__main__":
    clean_data()