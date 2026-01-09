"""
Migration script to import Ladders.csv into the database.
Handles the specific CSV format with facets as rows and levels as columns.
"""

import csv
import os
import re
from database import init_db, create_ladder_entry, create_competency_mapping, get_connection

DISCIPLINES_PATH = os.path.join(os.path.dirname(__file__), '..', 'disciplines')


def clean_text(text):
    """Clean up text from CSV - remove extra whitespace and normalize."""
    if not text:
        return ''
    # Remove excessive newlines and whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text


def parse_level_name(header):
    """Parse level name from header, handling multi-line headers."""
    if not header:
        return None
    # Clean up and extract the main level name
    lines = header.strip().split('\n')
    level = lines[0].strip()
    # Remove trailing colons or extra punctuation
    level = re.sub(r':$', '', level).strip()
    return level if level else None


def import_ladders_csv(discipline, csv_path):
    """
    Import a Ladders.csv file into the database.
    
    CSV Format:
    - First column: Facet / Level (facet names with descriptions)
    - Subsequent columns: Level names (Designer, Senior Designer, etc.)
    - Rows contain descriptions for each facet at each level
    """
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return False
    
    print(f"\nImporting ladders for {discipline} from {csv_path}")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    if len(rows) < 2:
        print("CSV file has insufficient data")
        return False
    
    # Parse header row to get level names
    header = rows[0]
    levels = []
    for i, col in enumerate(header[1:], start=1):  # Skip first column (facet name)
        level_name = parse_level_name(col)
        if level_name:
            levels.append((i, level_name))
    
    print(f"Found levels: {[l[1] for l in levels]}")
    
    # Process each row (facet)
    entries_created = 0
    for row in rows[1:]:  # Skip header
        if not row or not row[0]:
            continue
        
        # Parse facet name (first column)
        facet_cell = row[0].strip()
        
        # Extract facet name (first line before description)
        facet_lines = facet_cell.split('\n')
        facet_name = facet_lines[0].strip()
        
        # Skip if it's a header-like row or empty
        if not facet_name or facet_name.lower() == 'facet / level':
            continue
        
        print(f"  Processing facet: {facet_name}")
        
        # Process each level column
        for col_idx, level_name in levels:
            if col_idx < len(row):
                description = clean_text(row[col_idx])
                
                if description:
                    create_ladder_entry(discipline, level_name, facet_name, description)
                    entries_created += 1
    
    print(f"Created {entries_created} ladder entries for {discipline}")
    return True


def seed_design_competency_mappings():
    """
    Seed the initial competency mappings for Design discipline.
    These map hiring rubric competencies to career ladder facets.
    """
    print("\nSeeding competency mappings for Design...")
    
    mappings = [
        # (hiring_competency, ladder_facet, relationship_type, notes)
        ('Craft & Visual Design:', 'Craft', 'direct', 
         'Both focus on design execution quality, visual design, and attention to detail'),
        
        ('Product Sense & Strategy:', 'Strategy', 'partial',
         'Hiring focuses on product/business context; ladder expands to strategic leadership'),
        
        ('Collaboration', 'Collaboration & Communication', 'partial',
         'Ladder combines Collaboration and Communication into one facet'),
        
        ('Communication', 'Collaboration & Communication', 'partial',
         'Ladder combines Collaboration and Communication into one facet'),
        
        ('Ownership & Drive:', 'Ownership & Autonomy', 'direct',
         'Both cover initiative, autonomy, and taking responsibility for outcomes'),
        
        # Hiring-only competency (no ladder equivalent)
        ('User-Centered Problem Solving:', 'User-Centered Problem Solving', 'hiring_only',
         'Core interview skill - assessed during hiring but not a separate ladder facet'),
        
        # Ladder-only facets (no hiring equivalent)
        ('Innovation', 'Innovation', 'ladder_only',
         'Difficult to fully assess in interviews; evaluated post-hire through actual work'),
        
        ('Culture', 'Culture', 'ladder_only',
         'Can only be properly assessed after someone joins the team'),
    ]
    
    created = 0
    for hiring_comp, ladder_facet, rel_type, notes in mappings:
        try:
            create_competency_mapping('Design', hiring_comp, ladder_facet, rel_type, notes)
            created += 1
            print(f"  ✓ {hiring_comp} → {ladder_facet} ({rel_type})")
        except Exception as e:
            print(f"  ✗ Error mapping {hiring_comp}: {e}")
    
    print(f"Created {created} competency mappings")


def import_all_ladders():
    """Import ladder data for all disciplines that have a Ladders.csv file."""
    print("Starting ladder data import...")
    
    # Initialize database (creates tables if needed)
    init_db()
    
    # Look for Ladders.csv in each discipline folder
    if not os.path.exists(DISCIPLINES_PATH):
        print(f"Disciplines path not found: {DISCIPLINES_PATH}")
        return
    
    for discipline in os.listdir(DISCIPLINES_PATH):
        discipline_path = os.path.join(DISCIPLINES_PATH, discipline)
        if not os.path.isdir(discipline_path):
            continue
        
        ladders_csv = os.path.join(discipline_path, 'Ladders.csv')
        if os.path.exists(ladders_csv):
            import_ladders_csv(discipline, ladders_csv)
    
    # Seed Design competency mappings
    seed_design_competency_mappings()
    
    print("\n✓ Ladder import complete!")


def show_ladder_summary():
    """Show a summary of imported ladder data."""
    conn = get_connection()
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("LADDER DATA SUMMARY")
    print("="*60)
    
    # Get disciplines
    cursor.execute('SELECT DISTINCT discipline FROM ladder_data ORDER BY discipline')
    disciplines = [row['discipline'] for row in cursor.fetchall()]
    
    for discipline in disciplines:
        print(f"\n{discipline}:")
        
        # Get facets
        cursor.execute('''
            SELECT facet, COUNT(*) as level_count 
            FROM ladder_data 
            WHERE discipline = ? 
            GROUP BY facet 
            ORDER BY facet
        ''', (discipline,))
        
        for row in cursor.fetchall():
            print(f"  • {row['facet']}: {row['level_count']} levels")
    
    # Show mappings
    print("\n" + "-"*60)
    print("COMPETENCY MAPPINGS")
    print("-"*60)
    
    cursor.execute('''
        SELECT discipline, hiring_competency, ladder_facet, relationship_type
        FROM competency_mappings
        ORDER BY discipline, hiring_competency
    ''')
    
    current_discipline = None
    for row in cursor.fetchall():
        if row['discipline'] != current_discipline:
            current_discipline = row['discipline']
            print(f"\n{current_discipline}:")
        
        arrow = "→" if row['relationship_type'] in ('direct', 'partial') else "⊘"
        print(f"  {row['hiring_competency']} {arrow} {row['ladder_facet']} [{row['relationship_type']}]")
    
    conn.close()


if __name__ == '__main__':
    import_all_ladders()
    show_ladder_summary()
