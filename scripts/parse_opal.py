#!/usr/bin/env python3
"""
Parser for OPAL (Oxford Phrase Academy Learning) HTML data.
Extracts vocabulary items and classifies them by data-opal-* attributes.
"""

import json
import re
from pathlib import Path


def extract_with_regex(html_content: str) -> dict:
    """
    Use regex to extract OPAL data more reliably.
    Returns a dictionary with categorized items.
    """
    result = {
        'spoken_phrases': [],
        'written_phrases': [],
        'written': [],
        'spoken': []
    }
    
    # Pattern to match li elements with OPAL attributes
    li_pattern = re.compile(
        r'<li([^>]*)data-hw="([^"]*)"([^>]*)>(.*?)</li>',
        re.DOTALL
    )
    
    mp3_pattern = re.compile(
        r'data-src-mp3="([^"]*\/uk_pron[^"]*)"'
    )
    us_mp3_pattern = re.compile(
        r'data-src-mp3="([^"]*\/us_pron[^"]*)"'
    )
    href_pattern = re.compile(
        r'<a\s+href="([^"]*)"'
    )
    pos_pattern = re.compile(
        r'<span\s+class="pos">([^<]*)</span>'
    )
    
    for match in li_pattern.finditer(html_content):
        full_attrs = match.group(1) + match.group(3)
        headword = match.group(2)
        content = match.group(4)
        
        # Extract MP3 URLs
        uk_mp3 = mp3_pattern.search(content)
        us_mp3 = us_mp3_pattern.search(content)
        
        # Extract href from first anchor
        href = href_pattern.search(content)
        pos = pos_pattern.search(content)
        
        item_base = {
            'headword': headword,
            'uk_mp3': uk_mp3.group(1) if uk_mp3 else None,
            'us_mp3': us_mp3.group(1) if us_mp3 else None,
            'href': href.group(1) if href else None,
            'pos': pos.group(1).strip() if pos else None
        }
        
        # Check for each OPAL attribute
        if 'data-opal_spoken_phrases' in full_attrs:
            category = re.search(r'data-opal_spoken_phrases="([^"]*)"', full_attrs)
            if category:
                item = item_base.copy()
                item['category'] = category.group(1)
                result['spoken_phrases'].append(item)
                
        if 'data-opal_written_phrases' in full_attrs:
            category = re.search(r'data-opal_written_phrases="([^"]*)"', full_attrs)
            if category:
                item = item_base.copy()
                item['category'] = category.group(1)
                result['written_phrases'].append(item)
                
        if 'data-opal_written' in full_attrs:
            category = re.search(r'data-opal_written="([^"]*)"', full_attrs)
            if category:
                item = item_base.copy()
                item['category'] = category.group(1)
                result['written'].append(item)
                
        if 'data-opal_spoken' in full_attrs:
            category = re.search(r'data-opal_spoken="([^"]*)"', full_attrs)
            if category:
                item = item_base.copy()
                item['category'] = category.group(1)
                result['spoken'].append(item)
    
    return result


def main():
    # Read the HTML file
    input_file = Path(__file__).parent.parent / 'data_OPAL.json'
    
    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Parsing OPAL data...")
    parsed_data = extract_with_regex(content)
    
    # Print statistics
    print("\n=== Extraction Statistics ===")
    for category, items in parsed_data.items():
        print(f"{category}: {len(items)} items")
    
    # Save to JSON
    output_file = Path(__file__).parent.parent / 'opal_extracted.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(parsed_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved to {output_file}")
    
    # Also print sample items
    print("\n=== Sample Items ===")
    for category in ['spoken_phrases', 'written_phrases', 'written', 'spoken']:
        if parsed_data[category]:
            print(f"\n{category} (first 3):")
            for item in parsed_data[category][:3]:
                print(f"  - {item['headword']} ({item['category']})")
                if item['uk_mp3']:
                    print(f"    UK: {item['uk_mp3']}")
                if item['us_mp3']:
                    print(f"    US: {item['us_mp3']}")


if __name__ == '__main__':
    main()
