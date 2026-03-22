#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to extract hostnames from Shadowrocket config and update [MITM] section
Tự động trích xuất hostname từ các pattern và cập nhật vào [MITM]
Chạy được trên Mac, Windows, Linux
"""

import re
import sys
import os
import argparse
from pathlib import Path
from typing import Set, List

def extract_current_hostnames(content: str) -> List[str]:
    """Trích xuất hostname từ [MITM] section hiện tại"""
    mitm_match = re.search(r'\[MITM\]\s+hostname\s*=\s*([^\n]+)', content)
    if not mitm_match:
        return []
    
    hostname_line = mitm_match.group(1)
    # Split by comma và loại bỏ %APPEND%
    hostnames = [h.strip() for h in hostname_line.split(',')]
    hostnames = [h for h in hostnames if h and h != '%APPEND%']
    
    return sorted(list(set(hostnames)))

def extract_hostnames(content: str) -> List[str]:
    """Trích xuất hostname từ pattern trong file config"""
    hostnames: Set[str] = set()
    
    # Match các pattern lines: pattern=^https?://domain.com/...
    # Tìm tất cả pattern từ content
    for line in content.split('\n'):
        # Skip dòng trống
        if not line.strip():
            continue
        
        # Skip dòng comment (bắt đầu với # hoặc ;)
        if line.strip().startswith('#') or line.strip().startswith(';'):
            continue
        
        # Extract pattern từ dòng - match cả http lẫn https
        # Format 1: pattern=^https?://...
        pattern_match = re.search(r'pattern=\^https?[^,\s\n]+', line)
        
        # Format 2: Từ [Map Local] - đường dẫn regex trực tiếp như ^https?://...
        if not pattern_match:
            pattern_match = re.search(r'\^https?[^\s\n]+', line)
        if not pattern_match:
            continue
        
        match = pattern_match.group(0)
        
        # Extract domain từ pattern: pattern=^https?://domain or pattern=^https:\/\/domain
        # Approach: find domain part between protocol and first / or ,
        # Extract everything after "pattern=^" và remove protocol part
        domain_part = match.replace('pattern=^', '')  # Remove "pattern=^"
        domain_part = domain_part.replace('^', '')  # Remove "^" (từ [Map Local])
        
        # Remove protocol: https://, https?://, http://, or escaped versions
        domain_part = re.sub(r'^https?\??[:/]*', '', domain_part)  # Remove https:// or https:\/\/ or https?:// etc
        domain_part = domain_part.replace('\\/', '/')  # Normalize escaped slashes
        domain_part = domain_part.lstrip('/\\')  # Xóa // ở đầu
        
        # Lấy domain (phần trước dấu /)
        domain = domain_part.split('/')[0]
        
        # Xử lý escaped dots: \. -> .
        domain = domain.replace('\\.', '.')
        
        # Xóa port numbers nếu được gắn vào domain: example.com443 -> example.com
        domain = re.sub(r'(\.[a-z]{2,})(\d+)$', r'\1', domain, flags=re.IGNORECASE)
        
        # Xử lý regex grouping: (option1|option2) -> lấy từng option
        if '(' in domain and '|' in domain:
            matches_group = re.search(r'([^(]*)\(([^)]+)\)([^)]*)', domain)
            if matches_group:
                prefix = matches_group.group(1).rstrip('.')
                options = matches_group.group(2).split('|')
                suffix = matches_group.group(3).lstrip('.')
                
                # Thêm subdomain từ options
                for option in options:
                    option = option.strip().strip('.')
                    if prefix:
                        full_domain = f"{prefix}.{option}"
                    else:
                        full_domain = option
                    
                    if suffix:
                        full_domain = f"{full_domain}.{suffix}"
                    
                    # Final cleanup
                    full_domain = full_domain.strip('.')
                    full_domain = re.sub(r'[^a-zA-Z0-9.*-]', '', full_domain)  # Xóa ký tự không hợp lệ
                    full_domain = full_domain.rstrip('.-')  # Xóa . và - ở cuối
                    full_domain = re.sub(r'\.-', '.', full_domain)  # .- -> .
                    full_domain = re.sub(r'-\.', '.', full_domain)  # -. -> .
                    full_domain = re.sub(r'\.+', '.', full_domain)  # ... -> .
                    full_domain = re.sub(r'\*\.\.', '*.', full_domain)  # *.. -> *.
                    
                    if full_domain and '.' in full_domain:
                        hostnames.add(full_domain)
                continue
        
        # Nếu không có grouping, xử lý bình thường
        # Xử lý regex character classes: [\w-]+, [^/]+, etc. -> *
        domain = re.sub(r'\[.*?\]\+?', '*', domain)  # [\w-]+ atau [^/]+ -> *
        # Xử lý wildcard patterns: (.+) hoặc (\w+) -> *
        domain = re.sub(r'\([^)]*\+[^)]*\)', '*', domain)  # (.+) hoặc (\w+) -> *
        domain = re.sub(r'\([^)]*\)', '', domain)     # Xóa (...) còn lại
        # Xóa port numbers nếu được gắn vào domain: example.com443 -> example.com
        domain = re.sub(r'(\.[a-z]{2,})(\d+)$', r'\1', domain, flags=re.IGNORECASE)
        domain = re.sub(r'[^a-zA-Z0-9.*-]', '', domain)  # Xóa ký tự không hợp lệ
        domain = domain.strip('-').strip('.')  # Xóa - và . ở đầu/cuối (KHÔNG xóa *)
        domain = domain.rstrip('.-')  # Xóa . và - ở cuối
        domain = re.sub(r'\*+', '*', domain)          # Merge ** -> *
        domain = re.sub(r'\*\.\.', '*.', domain)      # *.. -> *.
        domain = re.sub(r'\.+', '.', domain)          # ... -> .
        
        # Validate domain
        if domain and '.' in domain:
            hostnames.add(domain)
    
    # Normalize: convert subdomains to wildcard (app.domain.com -> *.domain.com)
    # Nếu chỉ có domain.com giữ nguyên, nếu có subdomain thì convert thành *.domain.com
    normalized_hostnames = set()
    
    for host in hostnames:
        if host.startswith('*.'):
            # Đã là wildcard, giữ nguyên
            normalized_hostnames.add(host)
        else:
            # Check số phần domains
            parts = host.split('.')
            if len(parts) >= 3:
                # Có subdomain: app.domain.com -> *.domain.com
                wildcard_host = '*.' + '.'.join(parts[1:])
                normalized_hostnames.add(wildcard_host)
            else:
                # Chỉ có domain.com hoặc domain, giữ nguyên
                normalized_hostnames.add(host)
    
    return sorted(list(normalized_hostnames))  # Remove duplicates

def update_mitm_section(content: str, hostnames: List[str]) -> str:
    """Cập nhật section [MITM] với danh sách hostname"""
    hostname_list = '%APPEND%, ' + ', '.join(hostnames)
    
    # Thay thế phần MITM
    pattern = r'\[MITM\]\s+hostname\s*=\s*[^\n]+'
    new_mitm = f'[MITM]\nhostname = {hostname_list}'
    
    return re.sub(pattern, new_mitm, content)

def main():
    parser = argparse.ArgumentParser(
        description='Tự động cập nhật hostname trong Shadowrocket config',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Ví dụ:
  python update_hostname.py                          # Dùng file mặc định
  python update_hostname.py --preview                # Xem trước không cập nhật
  python update_hostname.py --config path/to/file.conf
        '''
    )
    parser.add_argument(
        '--config', '-c',
        default='All_In_One_Ultimate.conf',
        help='Đường dẫn tới file config (mặc định: All_In_One_Ultimate.conf)'
    )
    parser.add_argument(
        '--preview', '-p',
        action='store_true',
        help='Xem trước cập nhật mà không thay đổi file'
    )
    parser.add_argument(
        '--mitm-only',
        action='store_true',
        help='Chỉ cập nhật [MITM] section mà không re-extract hostname'
    )
    
    args = parser.parse_args()
    
    # Tìm file config - trước tiên kiểm tra cùng thư mục script
    script_dir = Path(__file__).parent
    config_file = Path(args.config)
    
    if not config_file.exists():
        # Thử tìm cùng thư mục script
        config_file = script_dir / args.config
        if not config_file.exists():
            config_file = Path(args.config)
    
    print(f"🔍 Đang đọc file: {config_file}")
    
    if not config_file.exists():
        print(f"❌ File không tìm thấy: {config_file}")
        sys.exit(1)
    
    # Đọc file
    with open(config_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Trích xuất hostnames
    if args.mitm_only:
        print("📋 Chế độ chỉ cập nhật [MITM]")
        hostnames = extract_current_hostnames(content)
    else:
        hostnames = extract_hostnames(content)
    
    print(f"✅ Tìm thấy {len(hostnames)} hostname:")
    for hostname in hostnames:
        print(f"   • {hostname}")
    
    # Cập nhật file
    new_content = update_mitm_section(content, hostnames)
    
    if args.preview:
        print("\n📋 Preview cập nhật [MITM]:")
        mitm_section = re.search(r'\[MITM\].*', new_content)
        if mitm_section:
            print(mitm_section.group(0))
    else:
        # Tạo backup
        backup_file = config_file.with_suffix(config_file.suffix + '.backup')
        with open(config_file, 'r', encoding='utf-8') as f:
            backup_content = f.read()
        with open(backup_file, 'w', encoding='utf-8') as f:
            f.write(backup_content)
        print(f"💾 Tạo backup: {backup_file}")
        
        # Ghi file mới
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("✨ Cập nhật thành công!")
    
    print("\n📝 Danh sách hostname đã cập nhật:")
    print(f"hostname = %APPEND%, {', '.join(hostnames)}")

if __name__ == '__main__':
    main()
