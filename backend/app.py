"""
Flask API server for the Rubric Editor.
Compatible with the React frontend API expectations.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import os
import json

from database import (
    init_db,
    get_rubrics_by_discipline,
    get_rubric_by_id,
    get_rubrics_by_level,
    update_rubric,
    create_rubric,
    delete_rubric,
    get_history_by_rubric,
    get_all_history,
    get_user_role,
    set_user_role,
    get_all_users,
    delete_user,
    get_competency_definitions,
    upsert_competency_definition,
    get_questions,
    add_question,
    get_disciplines,
    get_levels_by_discipline,
    get_stages_by_discipline,
    get_competencies_by_discipline_stage,
    get_connection,
    # Ladder operations
    get_ladders_by_discipline,
    get_ladder_by_id,
    get_ladders_by_facet,
    create_ladder_entry,
    update_ladder_entry,
    delete_ladder_entry,
    get_ladder_facets,
    get_ladder_levels,
    get_ladder_disciplines,
    # Competency mapping operations
    get_competency_mappings,
    get_mapping_by_hiring_competency,
    get_mapping_by_ladder_facet,
    create_competency_mapping,
    delete_competency_mapping
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize database on startup
init_db()

DISCIPLINES_PATH = os.path.join(os.path.dirname(__file__), '..', 'disciplines')


# ============ Middleware ============

def require_role(required_roles):
    """Decorator to require specific roles for an endpoint."""
    if isinstance(required_roles, str):
        required_roles = [required_roles]
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get user email from header (in production, verify via auth token)
            user_email = request.headers.get('X-User-Email')
            
            if not user_email:
                # Allow anonymous access for now (will be restricted later)
                return f(*args, **kwargs)
            
            role = get_user_role(user_email)
            
            # Admin has access to everything
            if role == 'admin' or role in required_roles:
                return f(*args, **kwargs)
            
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        return decorated_function
    return decorator


def get_current_user():
    """Get the current user's email from request headers."""
    return request.headers.get('X-User-Email', 'anonymous')


# ============ Disciplines ============

@app.route('/api/disciplines', methods=['GET'])
def api_get_disciplines():
    """Get all disciplines from the database or filesystem."""
    try:
        # Try database first
        disciplines = get_disciplines()
        if disciplines:
            return jsonify(disciplines)
        
        # Fallback to index.json
        index_path = os.path.join(DISCIPLINES_PATH, 'index.json')
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                data = json.load(f)
                return jsonify(data.get('disciplines', []))
        
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/disciplines/<discipline>/config', methods=['GET'])
def api_get_discipline_config(discipline):
    """Get config (levels) for a discipline."""
    try:
        # Try database first
        levels = get_levels_by_discipline(discipline)
        if levels:
            files = [{'file': f'{level}.csv', 'level': level} for level in levels]
            return jsonify({'files': files})
        
        # Fallback to files.json
        files_path = os.path.join(DISCIPLINES_PATH, discipline, 'files.json')
        if os.path.exists(files_path):
            with open(files_path, 'r') as f:
                return jsonify(json.load(f))
        
        return jsonify({'files': []})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Rubrics ============

@app.route('/api/rubrics/<discipline>', methods=['GET'])
def api_get_rubrics(discipline):
    """Get all rubrics for a discipline."""
    try:
        level = request.args.get('level')
        if level:
            rubrics = get_rubrics_by_level(discipline, level)
        else:
            rubrics = get_rubrics_by_discipline(discipline)
        
        # Transform to match frontend expectations
        transformed = []
        for r in rubrics:
            transformed.append({
                'id': r['id'],
                'interview_stage': r['stage'],
                'competency': r['competency'],
                'designer_level': r['level'],
                'score_1': r['score_1'] or '',
                'score_2': r['score_2'] or '',
                'score_3': r['score_3'] or '',
                'score_4': r['score_4'] or ''
            })
        
        return jsonify(transformed)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/rubrics/<int:rubric_id>', methods=['PUT'])
@require_role(['editor', 'admin'])
def api_update_rubric(rubric_id):
    """Update a rubric field."""
    try:
        data = request.get_json()
        field = data.get('field')
        value = data.get('value')
        
        if not field or value is None:
            return jsonify({'error': 'Field and value are required'}), 400
        
        changed_by = get_current_user()
        result = update_rubric(rubric_id, field, value, changed_by)
        
        # Return updated rubric
        rubric = get_rubric_by_id(rubric_id)
        return jsonify({
            'id': rubric['id'],
            'interview_stage': rubric['stage'],
            'competency': rubric['competency'],
            'designer_level': rubric['level'],
            'score_1': rubric['score_1'] or '',
            'score_2': rubric['score_2'] or '',
            'score_3': rubric['score_3'] or '',
            'score_4': rubric['score_4'] or ''
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Competency Definitions ============

@app.route('/api/competencies/<discipline>', methods=['GET'])
def api_get_competencies(discipline):
    """Get competency definitions for a discipline."""
    try:
        definitions = get_competency_definitions(discipline)
        
        # Transform to expected format: { [competency]: { focusArea, description } }
        result = {}
        for d in definitions:
            # Extract focus area from definition if stored there
            result[d['competency']] = {
                'id': d['id'],
                'focusArea': '',  # Not stored separately in our schema
                'description': d['definition'] or ''
            }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/competencies/<discipline>', methods=['POST'])
@require_role(['editor', 'admin'])
def api_create_competency(discipline):
    """Create a new competency definition."""
    try:
        data = request.get_json()
        competency = data.get('competency')
        focus_area = data.get('focus_area', '')
        description = data.get('description', '')
        
        if not competency:
            return jsonify({'error': 'Competency name is required'}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if competency already exists
        cursor.execute('''
            SELECT id FROM competency_definitions 
            WHERE discipline = ? AND competency = ?
        ''', (discipline, competency))
        existing = cursor.fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Competency already exists'}), 400
        
        # Insert new competency
        cursor.execute('''
            INSERT INTO competency_definitions (discipline, competency, definition)
            VALUES (?, ?, ?)
        ''', (discipline, competency, description))
        
        comp_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'id': comp_id, 'success': True}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/competencies/<int:comp_id>', methods=['PUT'])
@require_role(['editor', 'admin'])
def api_update_competency(comp_id):
    """Update a competency definition."""
    try:
        data = request.get_json()
        
        # Support both old format (field/value) and new format (full object)
        if 'field' in data:
            # Old format
            field = data.get('field')
            value = data.get('value')
            db_field = 'definition' if field == 'description' else field
            
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(f'''
                UPDATE competency_definitions 
                SET {db_field} = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (value, comp_id))
            conn.commit()
            conn.close()
        else:
            # New format - update all fields
            description = data.get('description', '')
            
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE competency_definitions 
                SET definition = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (description, comp_id))
            conn.commit()
            conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/competencies/<int:comp_id>', methods=['DELETE'])
@require_role(['admin'])
def api_delete_competency(comp_id):
    """Delete a competency definition."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM competency_definitions WHERE id = ?', (comp_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Competency not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Questions ============

@app.route('/api/questions/<discipline>', methods=['GET'])
def api_get_questions(discipline):
    """Get questions for a discipline."""
    try:
        questions = get_questions(discipline)
        
        # Transform to expected format: { [stage|competency]: { id, text } }
        result = {}
        for q in questions:
            key = f"{q['stage']}|{q['competency']}"
            result[key] = {
                'id': q['id'],
                'text': q['question']
            }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/questions/<int:question_id>', methods=['PUT'])
@require_role(['editor', 'admin'])
def api_update_question(question_id):
    """Update questions."""
    try:
        data = request.get_json()
        questions_text = data.get('questions')
        
        if questions_text is None:
            return jsonify({'error': 'Questions text is required'}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE questions 
            SET question = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (questions_text, question_id))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Change Log / History ============

@app.route('/api/changelog', methods=['GET'])
def api_get_changelog():
    """Get all change history."""
    try:
        limit = request.args.get('limit', 50, type=int)
        history = get_all_history(limit=limit)
        
        # Transform to expected format
        result = []
        for h in history:
            result.append({
                'id': h['id'],
                'table_name': 'rubrics',  # Simplified
                'record_id': h['rubric_id'],
                'field_name': h['field'],
                'old_value': h['old_value'],
                'new_value': h['new_value'],
                'changed_at': h['changed_at'],
                'changed_by': h.get('changed_by', 'unknown')
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/changelog/<int:history_id>/revert', methods=['POST'])
@require_role(['editor', 'admin'])
def api_revert_change(history_id):
    """Revert a change by restoring the old value. Creates a new history entry."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get the history entry
        cursor.execute('''
            SELECT rubric_id, field, old_value, new_value 
            FROM change_history 
            WHERE id = ?
        ''', (history_id,))
        history_entry = cursor.fetchone()
        
        if not history_entry:
            conn.close()
            return jsonify({'error': 'History entry not found'}), 404
        
        rubric_id = history_entry['rubric_id']
        field = history_entry['field']
        value_to_restore = history_entry['old_value']
        
        # Get current value (which will become the "old" value in the new history entry)
        cursor.execute(f'SELECT {field} FROM rubric_data WHERE id = ?', (rubric_id,))
        current = cursor.fetchone()
        
        if not current:
            conn.close()
            return jsonify({'error': 'Rubric not found'}), 404
        
        current_value = current[0]
        
        # Update the rubric to the old value
        cursor.execute(f'''
            UPDATE rubric_data 
            SET {field} = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (value_to_restore, rubric_id))
        
        # Create a NEW history entry for this revert (so it appears in timeline)
        changed_by = get_current_user()
        cursor.execute('''
            INSERT INTO change_history (rubric_id, field, old_value, new_value, changed_by)
            VALUES (?, ?, ?, ?, ?)
        ''', (rubric_id, field, current_value, value_to_restore, f'{changed_by} (revert)'))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'reverted_to': value_to_restore,
            'message': 'Change reverted successfully. A new history entry was created.'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ User Roles ============

@app.route('/api/user/role', methods=['GET'])
def api_get_user_role():
    """Get the current user's role."""
    try:
        email = get_current_user()
        role = get_user_role(email)
        return jsonify({'email': email, 'role': role})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users', methods=['GET'])
@require_role(['admin'])
def api_get_all_users():
    """Get all users (admin only)."""
    try:
        users = get_all_users()
        return jsonify({'users': users})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users', methods=['POST'])
@require_role(['admin'])
def api_set_user_role():
    """Set a user's role (admin only)."""
    try:
        data = request.get_json()
        email = data.get('email')
        role = data.get('role')
        
        if not email or not role:
            return jsonify({'error': 'Email and role are required'}), 400
        
        result = set_user_role(email, role)
        return jsonify(result)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Create Stage ============

@app.route('/api/stages/<discipline>', methods=['POST'])
@require_role(['editor', 'admin'])
def api_create_stage(discipline):
    """Create a new interview stage with competencies for all levels."""
    try:
        data = request.get_json()
        stage_name = data.get('stage')
        competencies = data.get('competencies', [])  # List of competency names
        
        if not stage_name:
            return jsonify({'error': 'Stage name is required'}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get all levels for this discipline
        cursor.execute('''
            SELECT DISTINCT level FROM rubric_data WHERE discipline = ?
        ''', (discipline,))
        levels = [row['level'] for row in cursor.fetchall()]
        
        if not levels:
            conn.close()
            return jsonify({'error': 'No levels found for this discipline. Create roles first.'}), 400
        
        # Create rubric entries for each level and competency
        created_count = 0
        for level in levels:
            for competency in competencies:
                try:
                    cursor.execute('''
                        INSERT INTO rubric_data (discipline, level, stage, competency, score_1, score_2, score_3, score_4)
                        VALUES (?, ?, ?, ?, '', '', '', '')
                    ''', (discipline, level, stage_name, competency))
                    created_count += 1
                except Exception:
                    pass  # Skip duplicates
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'created': created_count}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/stages/<discipline>/<stage>', methods=['DELETE'])
@require_role(['admin'])
def api_delete_stage(discipline, stage):
    """Delete an entire interview stage."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            DELETE FROM rubric_data WHERE discipline = ? AND stage = ?
        ''', (discipline, stage))
        
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        
        if deleted == 0:
            return jsonify({'error': 'Stage not found'}), 404
        
        return jsonify({'success': True, 'deleted': deleted})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Create Role/Level ============

@app.route('/api/roles/<discipline>', methods=['POST'])
@require_role(['editor', 'admin'])
def api_create_role(discipline):
    """Create a new role/level for a discipline."""
    try:
        data = request.get_json()
        role_name = data.get('role')
        copy_from = data.get('copy_from')  # Optional: copy structure from existing role
        
        if not role_name:
            return jsonify({'error': 'Role name is required'}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if role already exists
        cursor.execute('''
            SELECT COUNT(*) as count FROM rubric_data 
            WHERE discipline = ? AND level = ?
        ''', (discipline, role_name))
        if cursor.fetchone()['count'] > 0:
            conn.close()
            return jsonify({'error': 'Role already exists'}), 400
        
        if copy_from:
            # Copy structure from existing role
            cursor.execute('''
                SELECT stage, competency FROM rubric_data 
                WHERE discipline = ? AND level = ?
            ''', (discipline, copy_from))
            existing = cursor.fetchall()
            
            for row in existing:
                cursor.execute('''
                    INSERT INTO rubric_data (discipline, level, stage, competency, score_1, score_2, score_3, score_4)
                    VALUES (?, ?, ?, ?, '', '', '', '')
                ''', (discipline, role_name, row['stage'], row['competency']))
        else:
            # Get all existing stage/competency combinations
            cursor.execute('''
                SELECT DISTINCT stage, competency FROM rubric_data WHERE discipline = ?
            ''', (discipline,))
            combinations = cursor.fetchall()
            
            if not combinations:
                # No existing data - create empty role marker
                # We'll just return success, the role will be created when stages are added
                conn.close()
                return jsonify({'success': True, 'message': 'Role registered. Add stages to populate.'}), 201
            
            for row in combinations:
                cursor.execute('''
                    INSERT INTO rubric_data (discipline, level, stage, competency, score_1, score_2, score_3, score_4)
                    VALUES (?, ?, ?, ?, '', '', '', '')
                ''', (discipline, role_name, row['stage'], row['competency']))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/roles/<discipline>/<role>', methods=['DELETE'])
@require_role(['admin'])
def api_delete_role(discipline, role):
    """Delete a role/level from a discipline."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            DELETE FROM rubric_data WHERE discipline = ? AND level = ?
        ''', (discipline, role))
        
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        
        if deleted == 0:
            return jsonify({'error': 'Role not found'}), 404
        
        return jsonify({'success': True, 'deleted': deleted})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Create Discipline ============

@app.route('/api/disciplines', methods=['POST'])
@require_role(['editor', 'admin'])
def api_create_discipline():
    """Create a new discipline."""
    try:
        data = request.get_json()
        discipline_name = data.get('name')
        initial_roles = data.get('roles', [])  # Optional initial roles
        
        if not discipline_name:
            return jsonify({'error': 'Discipline name is required'}), 400
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if discipline already exists
        cursor.execute('''
            SELECT COUNT(*) as count FROM rubric_data WHERE discipline = ?
        ''', (discipline_name,))
        if cursor.fetchone()['count'] > 0:
            conn.close()
            return jsonify({'error': 'Discipline already exists'}), 400
        
        # If initial roles provided, create placeholder entries
        if initial_roles:
            for role in initial_roles:
                # Create a placeholder entry so the discipline shows up
                cursor.execute('''
                    INSERT INTO rubric_data (discipline, level, stage, competency, score_1, score_2, score_3, score_4)
                    VALUES (?, ?, 'General', 'General', '', '', '', '')
                ''', (discipline_name, role))
        else:
            # Create a single placeholder
            cursor.execute('''
                INSERT INTO rubric_data (discipline, level, stage, competency, score_1, score_2, score_3, score_4)
                VALUES (?, 'Default Role', 'General', 'General', '', '', '', '')
            ''', (discipline_name,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/disciplines/<discipline>', methods=['DELETE'])
@require_role(['admin'])
def api_delete_discipline(discipline):
    """Delete an entire discipline."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Delete all rubric data
        cursor.execute('DELETE FROM rubric_data WHERE discipline = ?', (discipline,))
        rubric_deleted = cursor.rowcount
        
        # Delete competency definitions
        cursor.execute('DELETE FROM competency_definitions WHERE discipline = ?', (discipline,))
        
        # Delete questions
        cursor.execute('DELETE FROM questions WHERE discipline = ?', (discipline,))
        
        conn.commit()
        conn.close()
        
        if rubric_deleted == 0:
            return jsonify({'error': 'Discipline not found'}), 404
        
        return jsonify({'success': True, 'deleted': rubric_deleted})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Get Stages for Discipline ============

@app.route('/api/stages/<discipline>', methods=['GET'])
def api_get_stages(discipline):
    """Get all stages for a discipline."""
    try:
        stages = get_stages_by_discipline(discipline)
        return jsonify({'stages': stages})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Get Competencies for Stage ============

@app.route('/api/stages/<discipline>/<stage>/competencies', methods=['GET'])
def api_get_stage_competencies(discipline, stage):
    """Get competencies for a specific stage."""
    try:
        competencies = get_competencies_by_discipline_stage(discipline, stage)
        return jsonify({'competencies': competencies})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Ladders ============

@app.route('/api/ladders', methods=['GET'])
def api_get_ladder_disciplines():
    """Get all disciplines that have ladder data."""
    try:
        disciplines = get_ladder_disciplines()
        return jsonify({'disciplines': disciplines})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ladders/<discipline>', methods=['GET'])
def api_get_ladders(discipline):
    """Get all ladder data for a discipline."""
    try:
        facet = request.args.get('facet')
        if facet:
            ladders = get_ladders_by_facet(discipline, facet)
        else:
            ladders = get_ladders_by_discipline(discipline)
        
        # Transform to a more usable format: group by facet with levels
        grouped = {}
        for ladder in ladders:
            facet_name = ladder['facet']
            if facet_name not in grouped:
                grouped[facet_name] = {
                    'facet': facet_name,
                    'levels': {}
                }
            grouped[facet_name]['levels'][ladder['level']] = {
                'id': ladder['id'],
                'description': ladder['description'] or ''
            }
        
        return jsonify({
            'discipline': discipline,
            'facets': list(grouped.values()),
            'raw': ladders  # Also include raw data for flexibility
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ladders/<discipline>/facets', methods=['GET'])
def api_get_ladder_facets(discipline):
    """Get all facets for a discipline's ladder."""
    try:
        facets = get_ladder_facets(discipline)
        return jsonify({'facets': facets})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ladders/<discipline>/levels', methods=['GET'])
def api_get_ladder_levels(discipline):
    """Get all levels for a discipline's ladder."""
    try:
        levels = get_ladder_levels(discipline)
        return jsonify({'levels': levels})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ladders/<discipline>', methods=['POST'])
@require_role(['editor', 'admin'])
def api_create_ladder_entry(discipline):
    """Create a new ladder entry."""
    try:
        data = request.get_json()
        level = data.get('level')
        facet = data.get('facet')
        description = data.get('description', '')
        
        if not level or not facet:
            return jsonify({'error': 'Level and facet are required'}), 400
        
        ladder_id = create_ladder_entry(discipline, level, facet, description)
        
        return jsonify({
            'id': ladder_id,
            'discipline': discipline,
            'level': level,
            'facet': facet,
            'description': description,
            'success': True
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ladders/<int:ladder_id>', methods=['PUT'])
@require_role(['editor', 'admin'])
def api_update_ladder_entry(ladder_id):
    """Update a ladder entry."""
    try:
        data = request.get_json()
        field = data.get('field')
        value = data.get('value')
        
        if not field or value is None:
            return jsonify({'error': 'Field and value are required'}), 400
        
        success = update_ladder_entry(ladder_id, field, value)
        
        if not success:
            return jsonify({'error': 'Ladder entry not found'}), 404
        
        ladder = get_ladder_by_id(ladder_id)
        return jsonify(ladder)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ladders/<int:ladder_id>', methods=['DELETE'])
@require_role(['admin'])
def api_delete_ladder_entry(ladder_id):
    """Delete a ladder entry."""
    try:
        success = delete_ladder_entry(ladder_id)
        
        if not success:
            return jsonify({'error': 'Ladder entry not found'}), 404
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Competency Mappings ============

@app.route('/api/competency-mappings/<discipline>', methods=['GET'])
def api_get_competency_mappings(discipline):
    """Get all competency mappings for a discipline."""
    try:
        mappings = get_competency_mappings(discipline)
        
        # Also get lists of hiring competencies and ladder facets for reference
        hiring_competencies = get_competencies_by_discipline_stage(discipline)
        ladder_facets = get_ladder_facets(discipline)
        
        return jsonify({
            'mappings': mappings,
            'hiring_competencies': hiring_competencies,
            'ladder_facets': ladder_facets
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/competency-mappings/<discipline>/by-hiring/<hiring_competency>', methods=['GET'])
def api_get_mapping_by_hiring(discipline, hiring_competency):
    """Get mappings for a specific hiring competency."""
    try:
        mappings = get_mapping_by_hiring_competency(discipline, hiring_competency)
        return jsonify({'mappings': mappings})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/competency-mappings/<discipline>/by-ladder/<ladder_facet>', methods=['GET'])
def api_get_mapping_by_ladder(discipline, ladder_facet):
    """Get mappings for a specific ladder facet."""
    try:
        mappings = get_mapping_by_ladder_facet(discipline, ladder_facet)
        return jsonify({'mappings': mappings})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/competency-mappings/<discipline>', methods=['POST'])
@require_role(['editor', 'admin'])
def api_create_competency_mapping(discipline):
    """Create or update a competency mapping."""
    try:
        data = request.get_json()
        hiring_competency = data.get('hiring_competency')
        ladder_facet = data.get('ladder_facet')
        relationship_type = data.get('relationship_type', 'direct')
        notes = data.get('notes', '')
        
        if not hiring_competency or not ladder_facet:
            return jsonify({'error': 'hiring_competency and ladder_facet are required'}), 400
        
        mapping_id = create_competency_mapping(
            discipline, hiring_competency, ladder_facet, relationship_type, notes
        )
        
        return jsonify({
            'id': mapping_id,
            'discipline': discipline,
            'hiring_competency': hiring_competency,
            'ladder_facet': ladder_facet,
            'relationship_type': relationship_type,
            'notes': notes,
            'success': True
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/competency-mappings/<int:mapping_id>', methods=['DELETE'])
@require_role(['admin'])
def api_delete_competency_mapping(mapping_id):
    """Delete a competency mapping."""
    try:
        success = delete_competency_mapping(mapping_id)
        
        if not success:
            return jsonify({'error': 'Mapping not found'}), 404
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============ Health Check ============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        # Test database connection
        conn = get_connection()
        conn.execute('SELECT 1')
        conn.close()
        return jsonify({'status': 'ok', 'database': 'connected'})
    except Exception as e:
        return jsonify({'status': 'error', 'database': 'disconnected', 'error': str(e)}), 500


if __name__ == '__main__':
    print("Starting Flask API server...")
    print("API available at http://localhost:5000")
    app.run(debug=True, port=5000)
