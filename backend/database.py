"""
SQLite database setup and queries for the Rubric Editor.
"""

import sqlite3
import os
from datetime import datetime
from contextlib import contextmanager

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'rubrics.db')


def get_connection():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Initialize the database with required tables."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Rubric data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rubric_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discipline TEXT NOT NULL,
                level TEXT NOT NULL,
                stage TEXT NOT NULL,
                competency TEXT NOT NULL,
                score_1 TEXT,
                score_2 TEXT,
                score_3 TEXT,
                score_4 TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(discipline, level, stage, competency)
            )
        ''')
        
        # Change history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS change_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rubric_id INTEGER NOT NULL,
                field TEXT NOT NULL,
                old_value TEXT,
                new_value TEXT,
                changed_by TEXT NOT NULL,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rubric_id) REFERENCES rubric_data(id)
            )
        ''')
        
        # Users table for role management
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL DEFAULT 'viewer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Competency definitions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS competency_definitions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discipline TEXT NOT NULL,
                competency TEXT NOT NULL,
                definition TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(discipline, competency)
            )
        ''')
        
        # Questions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discipline TEXT NOT NULL,
                stage TEXT NOT NULL,
                competency TEXT NOT NULL,
                question TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(discipline, stage, competency, question)
            )
        ''')
        
        # Ladder data table - for career progression/leveling
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ladder_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discipline TEXT NOT NULL,
                level TEXT NOT NULL,
                facet TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(discipline, level, facet)
            )
        ''')
        
        # Competency mappings table - links hiring competencies to ladder facets
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS competency_mappings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discipline TEXT NOT NULL,
                hiring_competency TEXT NOT NULL,
                ladder_facet TEXT NOT NULL,
                relationship_type TEXT NOT NULL DEFAULT 'direct',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(discipline, hiring_competency, ladder_facet)
            )
        ''')
        
        # Create indexes for faster queries
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_rubric_discipline ON rubric_data(discipline)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_rubric_level ON rubric_data(level)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_history_rubric ON change_history(rubric_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_ladder_discipline ON ladder_data(discipline)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_ladder_level ON ladder_data(level)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_mappings_discipline ON competency_mappings(discipline)')
        
        print("Database initialized successfully.")


# ============ Rubric Data Operations ============

def get_rubrics_by_discipline(discipline):
    """Get all rubrics for a discipline."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM rubric_data 
            WHERE discipline = ?
            ORDER BY level, stage, competency
        ''', (discipline,))
        return [dict(row) for row in cursor.fetchall()]


def get_rubric_by_id(rubric_id):
    """Get a single rubric by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM rubric_data WHERE id = ?', (rubric_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def get_rubrics_by_level(discipline, level):
    """Get rubrics for a specific discipline and level."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM rubric_data 
            WHERE discipline = ? AND level = ?
            ORDER BY stage, competency
        ''', (discipline, level))
        return [dict(row) for row in cursor.fetchall()]


def update_rubric(rubric_id, field, new_value, changed_by):
    """Update a rubric field and record the change in history."""
    allowed_fields = ['score_1', 'score_2', 'score_3', 'score_4', 'competency', 'stage']
    if field not in allowed_fields:
        raise ValueError(f"Field '{field}' is not editable")
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get current value
        cursor.execute(f'SELECT {field} FROM rubric_data WHERE id = ?', (rubric_id,))
        row = cursor.fetchone()
        if not row:
            raise ValueError(f"Rubric with id {rubric_id} not found")
        
        old_value = row[0]
        
        # Update the rubric
        cursor.execute(f'''
            UPDATE rubric_data 
            SET {field} = ?, updated_at = ?
            WHERE id = ?
        ''', (new_value, datetime.now(), rubric_id))
        
        # Record in history
        cursor.execute('''
            INSERT INTO change_history (rubric_id, field, old_value, new_value, changed_by)
            VALUES (?, ?, ?, ?, ?)
        ''', (rubric_id, field, old_value, new_value, changed_by))
        
        return {'success': True, 'old_value': old_value, 'new_value': new_value}


def create_rubric(discipline, level, stage, competency, score_1='', score_2='', score_3='', score_4=''):
    """Create a new rubric entry."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO rubric_data (discipline, level, stage, competency, score_1, score_2, score_3, score_4)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (discipline, level, stage, competency, score_1, score_2, score_3, score_4))
        return cursor.lastrowid


def delete_rubric(rubric_id):
    """Delete a rubric entry."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM rubric_data WHERE id = ?', (rubric_id,))
        return cursor.rowcount > 0


# ============ Change History Operations ============

def get_history_by_rubric(rubric_id, limit=50):
    """Get change history for a specific rubric."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM change_history 
            WHERE rubric_id = ?
            ORDER BY changed_at DESC
            LIMIT ?
        ''', (rubric_id, limit))
        return [dict(row) for row in cursor.fetchall()]


def get_all_history(discipline=None, limit=100):
    """Get all change history, optionally filtered by discipline."""
    with get_db() as conn:
        cursor = conn.cursor()
        if discipline:
            cursor.execute('''
                SELECT ch.*, rd.discipline, rd.level, rd.stage, rd.competency
                FROM change_history ch
                JOIN rubric_data rd ON ch.rubric_id = rd.id
                WHERE rd.discipline = ?
                ORDER BY ch.changed_at DESC
                LIMIT ?
            ''', (discipline, limit))
        else:
            cursor.execute('''
                SELECT ch.*, rd.discipline, rd.level, rd.stage, rd.competency
                FROM change_history ch
                JOIN rubric_data rd ON ch.rubric_id = rd.id
                ORDER BY ch.changed_at DESC
                LIMIT ?
            ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]


# ============ User Role Operations ============

def get_user_role(email):
    """Get the role for a user by email."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT role FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        return row['role'] if row else 'viewer'  # Default to viewer


def set_user_role(email, role):
    """Set or update a user's role."""
    valid_roles = ['viewer', 'editor', 'admin']
    if role not in valid_roles:
        raise ValueError(f"Invalid role. Must be one of: {valid_roles}")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (email, role, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET role = ?, updated_at = ?
        ''', (email, role, datetime.now(), role, datetime.now()))
        return {'email': email, 'role': role}


def get_all_users():
    """Get all users and their roles."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users ORDER BY email')
        return [dict(row) for row in cursor.fetchall()]


def delete_user(email):
    """Delete a user."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM users WHERE email = ?', (email,))
        return cursor.rowcount > 0


# ============ Competency Definitions Operations ============

def get_competency_definitions(discipline):
    """Get competency definitions for a discipline."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM competency_definitions 
            WHERE discipline = ?
            ORDER BY competency
        ''', (discipline,))
        return [dict(row) for row in cursor.fetchall()]


def upsert_competency_definition(discipline, competency, definition):
    """Insert or update a competency definition."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO competency_definitions (discipline, competency, definition, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(discipline, competency) DO UPDATE SET definition = ?, updated_at = ?
        ''', (discipline, competency, definition, datetime.now(), definition, datetime.now()))
        return cursor.lastrowid


# ============ Questions Operations ============

def get_questions(discipline, stage=None, competency=None):
    """Get questions, optionally filtered by stage and/or competency."""
    with get_db() as conn:
        cursor = conn.cursor()
        query = 'SELECT * FROM questions WHERE discipline = ?'
        params = [discipline]
        
        if stage:
            query += ' AND stage = ?'
            params.append(stage)
        if competency:
            query += ' AND competency = ?'
            params.append(competency)
        
        query += ' ORDER BY stage, competency, question'
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def add_question(discipline, stage, competency, question):
    """Add a new question."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR IGNORE INTO questions (discipline, stage, competency, question)
            VALUES (?, ?, ?, ?)
        ''', (discipline, stage, competency, question))
        return cursor.lastrowid


# ============ Utility Functions ============

def get_disciplines():
    """Get all unique disciplines."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT DISTINCT discipline FROM rubric_data ORDER BY discipline')
        return [row['discipline'] for row in cursor.fetchall()]


def get_levels_by_discipline(discipline):
    """Get all levels for a discipline."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT DISTINCT level FROM rubric_data 
            WHERE discipline = ?
            ORDER BY level
        ''', (discipline,))
        return [row['level'] for row in cursor.fetchall()]


def get_stages_by_discipline(discipline):
    """Get all stages for a discipline."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT DISTINCT stage FROM rubric_data 
            WHERE discipline = ?
            ORDER BY stage
        ''', (discipline,))
        return [row['stage'] for row in cursor.fetchall()]


def get_competencies_by_discipline_stage(discipline, stage=None):
    """Get competencies for a discipline, optionally filtered by stage."""
    with get_db() as conn:
        cursor = conn.cursor()
        if stage:
            cursor.execute('''
                SELECT DISTINCT competency FROM rubric_data 
                WHERE discipline = ? AND stage = ?
                ORDER BY competency
            ''', (discipline, stage))
        else:
            cursor.execute('''
                SELECT DISTINCT competency FROM rubric_data 
                WHERE discipline = ?
                ORDER BY competency
            ''', (discipline,))
        return [row['competency'] for row in cursor.fetchall()]


# ============ Ladder Data Operations ============

def get_ladders_by_discipline(discipline):
    """Get all ladder data for a discipline."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM ladder_data 
            WHERE discipline = ?
            ORDER BY facet, level
        ''', (discipline,))
        return [dict(row) for row in cursor.fetchall()]


def get_ladder_by_id(ladder_id):
    """Get a single ladder entry by ID."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM ladder_data WHERE id = ?', (ladder_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


def get_ladders_by_facet(discipline, facet):
    """Get ladder data for a specific discipline and facet."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM ladder_data 
            WHERE discipline = ? AND facet = ?
            ORDER BY level
        ''', (discipline, facet))
        return [dict(row) for row in cursor.fetchall()]


def create_ladder_entry(discipline, level, facet, description=''):
    """Create a new ladder entry."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO ladder_data (discipline, level, facet, description)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(discipline, level, facet) DO UPDATE SET 
                description = excluded.description,
                updated_at = CURRENT_TIMESTAMP
        ''', (discipline, level, facet, description))
        return cursor.lastrowid


def update_ladder_entry(ladder_id, field, new_value):
    """Update a ladder entry field."""
    allowed_fields = ['description', 'facet', 'level']
    if field not in allowed_fields:
        raise ValueError(f"Field '{field}' is not editable")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(f'''
            UPDATE ladder_data 
            SET {field} = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (new_value, ladder_id))
        return cursor.rowcount > 0


def delete_ladder_entry(ladder_id):
    """Delete a ladder entry."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM ladder_data WHERE id = ?', (ladder_id,))
        return cursor.rowcount > 0


def get_ladder_facets(discipline):
    """Get all unique facets for a discipline's ladder."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT DISTINCT facet FROM ladder_data 
            WHERE discipline = ?
            ORDER BY facet
        ''', (discipline,))
        return [row['facet'] for row in cursor.fetchall()]


def get_ladder_levels(discipline):
    """Get all unique levels for a discipline's ladder."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT DISTINCT level FROM ladder_data 
            WHERE discipline = ?
            ORDER BY level
        ''', (discipline,))
        return [row['level'] for row in cursor.fetchall()]


# ============ Competency Mapping Operations ============

def get_competency_mappings(discipline):
    """Get all competency mappings for a discipline."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM competency_mappings 
            WHERE discipline = ?
            ORDER BY hiring_competency
        ''', (discipline,))
        return [dict(row) for row in cursor.fetchall()]


def get_mapping_by_hiring_competency(discipline, hiring_competency):
    """Get mappings for a specific hiring competency."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM competency_mappings 
            WHERE discipline = ? AND hiring_competency = ?
        ''', (discipline, hiring_competency))
        return [dict(row) for row in cursor.fetchall()]


def get_mapping_by_ladder_facet(discipline, ladder_facet):
    """Get mappings for a specific ladder facet."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM competency_mappings 
            WHERE discipline = ? AND ladder_facet = ?
        ''', (discipline, ladder_facet))
        return [dict(row) for row in cursor.fetchall()]


def create_competency_mapping(discipline, hiring_competency, ladder_facet, relationship_type='direct', notes=''):
    """Create or update a competency mapping."""
    valid_types = ['direct', 'partial', 'hiring_only', 'ladder_only']
    if relationship_type not in valid_types:
        raise ValueError(f"Invalid relationship type. Must be one of: {valid_types}")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO competency_mappings (discipline, hiring_competency, ladder_facet, relationship_type, notes)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(discipline, hiring_competency, ladder_facet) DO UPDATE SET 
                relationship_type = excluded.relationship_type,
                notes = excluded.notes,
                updated_at = CURRENT_TIMESTAMP
        ''', (discipline, hiring_competency, ladder_facet, relationship_type, notes))
        return cursor.lastrowid


def delete_competency_mapping(mapping_id):
    """Delete a competency mapping."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM competency_mappings WHERE id = ?', (mapping_id,))
        return cursor.rowcount > 0


def get_ladder_disciplines():
    """Get all disciplines that have ladder data."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT DISTINCT discipline FROM ladder_data ORDER BY discipline')
        return [row['discipline'] for row in cursor.fetchall()]


if __name__ == '__main__':
    init_db()

