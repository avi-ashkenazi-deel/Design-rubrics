#!/usr/bin/env python3
"""
Export CSV data to Supabase SQL INSERT statements.
Run this script and copy the output SQL to Supabase SQL Editor.
"""

import csv
import os
import json
from pathlib import Path

# Path to the disciplines folder
BASE_DIR = Path(__file__).parent.parent.parent / "disciplines"

def escape_sql(value):
    """Escape single quotes for SQL."""
    if value is None:
        return ''
    return str(value).replace("'", "''")

def export_rubrics():
    """Export rubric data from CSV files."""
    # Use dict to deduplicate by unique key (discipline, level, stage, competency)
    unique_rubrics = {}
    
    # Get all disciplines
    index_file = BASE_DIR / "index.json"
    if index_file.exists():
        with open(index_file) as f:
            data = json.load(f)
            disciplines = data.get('disciplines', [])
    else:
        disciplines = [d.name for d in BASE_DIR.iterdir() if d.is_dir()]
    
    for discipline in disciplines:
        discipline_dir = BASE_DIR / discipline
        if not discipline_dir.is_dir():
            continue
            
        # Get files.json for levels
        files_json = discipline_dir / "files.json"
        if not files_json.exists():
            continue
            
        with open(files_json) as f:
            config = json.load(f)
        
        for file_info in config.get('files', []):
            csv_file = discipline_dir / file_info['file']
            level = file_info['level']
            
            if not csv_file.exists():
                continue
            
            with open(csv_file, encoding='utf-8') as f:
                reader = csv.DictReader(f)
                last_stage = ''
                for row in reader:
                    stage = row.get('Assessment Stage', '').strip()
                    competency = row.get('Competency', '').strip()
                    
                    if not stage and not competency:
                        continue
                    
                    # Handle rows where stage is empty (continuation)
                    if not stage:
                        stage = last_stage
                    else:
                        last_stage = stage
                    
                    if not competency:
                        continue
                    
                    # Get score columns
                    score_1 = escape_sql(row.get('Level 1:\nBasic Basic awareness and foundational knowledge. Requires close supervision and detailed guidance.', 
                                                 row.get('Level 1:', '')))
                    score_2 = escape_sql(row.get('Level 2:\nIntermediate Working knowledge and consistent application. Needs periodic supervision and support for complex tasks.',
                                                 row.get('Level 2:', '')))
                    score_3 = escape_sql(row.get('Level 3:\nAdvanced Comprehensive understanding and independent application. Can handle most complex situations and guide others.',
                                                 row.get('Level 3:', '')))
                    score_4 = escape_sql(row.get('Level 4:\nExpert Complete mastery, innovation, and leadership. Sets standards, develops new approaches, and mentors others.',
                                                 row.get('Level 4:', '')))
                    
                    # Try shorter column names if full names don't work
                    if not score_1:
                        for key in row.keys():
                            if 'Level 1' in key:
                                score_1 = escape_sql(row[key])
                            elif 'Level 2' in key:
                                score_2 = escape_sql(row[key])
                            elif 'Level 3' in key:
                                score_3 = escape_sql(row[key])
                            elif 'Level 4' in key:
                                score_4 = escape_sql(row[key])
                    
                    # Use unique key to deduplicate
                    unique_key = (discipline, level, stage, competency)
                    sql = f"('{escape_sql(discipline)}', '{escape_sql(level)}', '{escape_sql(stage)}', '{escape_sql(competency)}', '{score_1}', '{score_2}', '{score_3}', '{score_4}')"
                    unique_rubrics[unique_key] = sql
    
    return list(unique_rubrics.values())

def export_questions():
    """Export questions from CSV files."""
    # Use dict to deduplicate by unique key (discipline, stage, competency)
    unique_questions = {}
    
    index_file = BASE_DIR / "index.json"
    if index_file.exists():
        with open(index_file) as f:
            data = json.load(f)
            disciplines = data.get('disciplines', [])
    else:
        disciplines = [d.name for d in BASE_DIR.iterdir() if d.is_dir()]
    
    for discipline in disciplines:
        discipline_dir = BASE_DIR / discipline
        questions_file = discipline_dir / "Questions.csv"
        
        if not questions_file.exists():
            continue
        
        with open(questions_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                stage = row.get('Stage', '').strip()
                competency = row.get('Competency', '').strip()
                questions = row.get('Questions', '').strip()
                
                if stage and competency and questions:
                    unique_key = (discipline, stage, competency)
                    sql = f"('{escape_sql(discipline)}', '{escape_sql(stage)}', '{escape_sql(competency)}', '{escape_sql(questions)}')"
                    unique_questions[unique_key] = sql
    
    return list(unique_questions.values())

def export_competencies():
    """Export competency definitions from CSV files."""
    # Use dict to deduplicate by unique key (discipline, competency)
    unique_competencies = {}
    
    index_file = BASE_DIR / "index.json"
    if index_file.exists():
        with open(index_file) as f:
            data = json.load(f)
            disciplines = data.get('disciplines', [])
    else:
        disciplines = [d.name for d in BASE_DIR.iterdir() if d.is_dir()]
    
    for discipline in disciplines:
        discipline_dir = BASE_DIR / discipline
        competencies_file = discipline_dir / "Competencies.csv"
        
        if not competencies_file.exists():
            continue
        
        with open(competencies_file, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                competency = row.get('Competency', '').strip()
                definition = row.get('Definition', row.get('Description', '')).strip()
                
                if competency:
                    unique_key = (discipline, competency)
                    sql = f"('{escape_sql(discipline)}', '{escape_sql(competency)}', '{escape_sql(definition)}')"
                    unique_competencies[unique_key] = sql
    
    return list(unique_competencies.values())

def main():
    print("-- Supabase Data Import Script")
    print("-- Generated from CSV files")
    print("")
    
    # Export rubrics
    rubrics = export_rubrics()
    if rubrics:
        print("-- Insert rubric data")
        print("INSERT INTO public.rubric_data (discipline, level, stage, competency, score_1, score_2, score_3, score_4) VALUES")
        print(",\n".join(rubrics))
        print("ON CONFLICT (discipline, level, stage, competency) DO UPDATE SET")
        print("  score_1 = EXCLUDED.score_1,")
        print("  score_2 = EXCLUDED.score_2,")
        print("  score_3 = EXCLUDED.score_3,")
        print("  score_4 = EXCLUDED.score_4;")
        print("")
    
    # Export questions
    questions = export_questions()
    if questions:
        print("-- Insert questions")
        print("INSERT INTO public.questions (discipline, stage, competency, question) VALUES")
        print(",\n".join(questions))
        print("ON CONFLICT (discipline, stage, competency) DO UPDATE SET")
        print("  question = EXCLUDED.question;")
        print("")
    
    # Export competencies
    competencies = export_competencies()
    if competencies:
        print("-- Insert competency definitions")
        print("INSERT INTO public.competency_definitions (discipline, competency, definition) VALUES")
        print(",\n".join(competencies))
        print("ON CONFLICT (discipline, competency) DO UPDATE SET")
        print("  definition = EXCLUDED.definition;")
        print("")
    
    print("-- Verify counts")
    print("SELECT 'rubric_data' as table_name, COUNT(*) as count FROM public.rubric_data")
    print("UNION ALL SELECT 'questions', COUNT(*) FROM public.questions")
    print("UNION ALL SELECT 'competency_definitions', COUNT(*) FROM public.competency_definitions;")

if __name__ == "__main__":
    main()
