"""
Migration script to import existing CSVs into the SQLite database.
"""

import os
import csv
import json
from database import (
    init_db,
    create_rubric,
    upsert_competency_definition,
    add_question,
    set_user_role,
    get_connection
)

DISCIPLINES_PATH = os.path.join(os.path.dirname(__file__), '..', 'disciplines')


def clear_tables():
    """Clear all data from tables before migration."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM questions')
    cursor.execute('DELETE FROM competency_definitions')
    cursor.execute('DELETE FROM rubric_data')
    conn.commit()
    conn.close()
    print("Cleared existing data from tables.")


def load_disciplines():
    """Load the list of disciplines from index.json."""
    index_path = os.path.join(DISCIPLINES_PATH, 'index.json')
    if os.path.exists(index_path):
        with open(index_path, 'r') as f:
            data = json.load(f)
            return data.get('disciplines', [])
    
    # Fallback: list directories
    return [d for d in os.listdir(DISCIPLINES_PATH) 
            if os.path.isdir(os.path.join(DISCIPLINES_PATH, d))]


def load_files_json(discipline):
    """Load files.json for a discipline."""
    files_path = os.path.join(DISCIPLINES_PATH, discipline, 'files.json')
    if os.path.exists(files_path):
        with open(files_path, 'r') as f:
            data = json.load(f)
            return data.get('files', [])
    return []


def parse_csv_file(filepath):
    """Parse a CSV file and return rows."""
    rows = []
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        for row in reader:
            rows.append(row)
    return rows


def detect_csv_format(rows):
    """Detect whether the CSV uses 'Assessment Stage' or 'Focus Area' format."""
    if not rows:
        return None, None
    
    header = rows[0]
    if len(header) < 2:
        return None, None
    
    first_col = header[0].strip().lower()
    
    if 'assessment stage' in first_col:
        return 'assessment_stage', header
    elif 'focus area' in first_col:
        return 'focus_area', header
    else:
        return 'unknown', header


def migrate_rubric_csv(discipline, level, filepath):
    """Migrate a rubric CSV file to the database."""
    if not os.path.exists(filepath):
        print(f"  Skipping {filepath} - file not found")
        return 0
    
    rows = parse_csv_file(filepath)
    if len(rows) < 2:
        print(f"  Skipping {filepath} - empty or no data rows")
        return 0
    
    csv_format, header = detect_csv_format(rows)
    
    count = 0
    current_stage = None
    
    for row in rows[1:]:  # Skip header
        if len(row) < 6:
            continue
        
        # Handle different formats
        if csv_format == 'assessment_stage':
            # Format: Assessment Stage, Competency, Level1, Level2, Level3, Level4
            stage = row[0].strip() if row[0].strip() else current_stage
            competency = row[1].strip()
            score_1 = row[2].strip() if len(row) > 2 else ''
            score_2 = row[3].strip() if len(row) > 3 else ''
            score_3 = row[4].strip() if len(row) > 4 else ''
            score_4 = row[5].strip() if len(row) > 5 else ''
        else:
            # Format: Focus Area, Competency, Level1, Level2, Level3, Level4
            stage = row[0].strip() if row[0].strip() else current_stage
            competency = row[1].strip()
            score_1 = row[2].strip() if len(row) > 2 else ''
            score_2 = row[3].strip() if len(row) > 3 else ''
            score_3 = row[4].strip() if len(row) > 4 else ''
            score_4 = row[5].strip() if len(row) > 5 else ''
        
        if stage:
            current_stage = stage
        
        if not competency or competency.startswith('Level '):
            continue
        
        # Skip empty rows or header-like rows
        if not current_stage or current_stage.lower() in ['assessment stage', 'focus area']:
            continue
        
        try:
            create_rubric(
                discipline=discipline,
                level=level,
                stage=current_stage,
                competency=competency,
                score_1=score_1,
                score_2=score_2,
                score_3=score_3,
                score_4=score_4
            )
            count += 1
        except Exception as e:
            print(f"  Warning: Could not insert {competency} for {level}/{current_stage}: {e}")
    
    return count


def migrate_competency_definitions(discipline, filepath):
    """Migrate competency definitions from a Competencies.csv file."""
    if not os.path.exists(filepath):
        print(f"  No competency definitions file found for {discipline}")
        return 0
    
    rows = parse_csv_file(filepath)
    if len(rows) < 2:
        return 0
    
    header = rows[0]
    
    # Check if this is a definitions file (has Description column) or a rubric file
    has_description = any('description' in col.lower() for col in header)
    
    count = 0
    current_focus_area = None
    
    for row in rows[1:]:
        if len(row) < 2:
            continue
        
        focus_area = row[0].strip() if row[0].strip() else current_focus_area
        competency = row[1].strip()
        
        if focus_area:
            current_focus_area = focus_area
        
        if not competency:
            continue
        
        # Get definition - either from Description column or infer from Level 1
        if has_description:
            # Find description column index
            desc_idx = next((i for i, col in enumerate(header) if 'description' in col.lower()), 2)
            definition = row[desc_idx].strip() if len(row) > desc_idx else ''
        else:
            # For rubric-style files, use Level 1 as a basic definition hint
            # or just store the competency name
            definition = row[2].strip() if len(row) > 2 else ''
        
        try:
            upsert_competency_definition(discipline, competency, definition)
            count += 1
        except Exception as e:
            print(f"  Warning: Could not insert competency definition {competency}: {e}")
    
    return count


def migrate_questions(discipline, filepath):
    """Migrate questions from a Questions.csv file."""
    if not os.path.exists(filepath):
        print(f"  No questions file found for {discipline}")
        return 0
    
    rows = parse_csv_file(filepath)
    if len(rows) < 2:
        return 0
    
    header = rows[0]
    count = 0
    
    # Expected format: Stage, Competency, Question
    for row in rows[1:]:
        if len(row) < 3:
            continue
        
        stage = row[0].strip()
        competency = row[1].strip()
        question = row[2].strip()
        
        if not all([stage, competency, question]):
            continue
        
        try:
            add_question(discipline, stage, competency, question)
            count += 1
        except Exception as e:
            print(f"  Warning: Could not insert question: {e}")
    
    return count


def add_default_admin(email):
    """Add a default admin user."""
    try:
        set_user_role(email, 'admin')
        print(f"Added admin user: {email}")
    except Exception as e:
        print(f"Warning: Could not add admin user: {e}")


def migrate_all():
    """Run the full migration."""
    print("=" * 60)
    print("Starting CSV to SQLite Migration")
    print("=" * 60)
    
    # Initialize database
    init_db()
    
    # Clear existing data
    clear_tables()
    
    # Load disciplines
    disciplines = load_disciplines()
    print(f"\nFound {len(disciplines)} disciplines: {', '.join(disciplines)}")
    
    total_rubrics = 0
    total_definitions = 0
    total_questions = 0
    
    for discipline in disciplines:
        print(f"\n--- Migrating {discipline} ---")
        discipline_path = os.path.join(DISCIPLINES_PATH, discipline)
        
        if not os.path.isdir(discipline_path):
            print(f"  Directory not found: {discipline_path}")
            continue
        
        # Load files.json
        files = load_files_json(discipline)
        
        # Migrate rubric files
        for file_info in files:
            filename = file_info.get('file', '')
            level = file_info.get('level', filename.replace('.csv', ''))
            filepath = os.path.join(discipline_path, filename)
            
            count = migrate_rubric_csv(discipline, level, filepath)
            total_rubrics += count
            print(f"  Imported {count} rubric entries for {level}")
        
        # Migrate competency definitions
        comp_path = os.path.join(discipline_path, 'Competencies.csv')
        count = migrate_competency_definitions(discipline, comp_path)
        total_definitions += count
        if count > 0:
            print(f"  Imported {count} competency definitions")
        
        # Migrate questions
        questions_path = os.path.join(discipline_path, 'Questions.csv')
        count = migrate_questions(discipline, questions_path)
        total_questions += count
        if count > 0:
            print(f"  Imported {count} questions")
    
    # Add a default admin user (replace with your email)
    add_default_admin('avi.ashkenazi@deel.com')
    
    print("\n" + "=" * 60)
    print("Migration Complete!")
    print(f"  Total rubric entries: {total_rubrics}")
    print(f"  Total competency definitions: {total_definitions}")
    print(f"  Total questions: {total_questions}")
    print("=" * 60)


if __name__ == '__main__':
    migrate_all()

