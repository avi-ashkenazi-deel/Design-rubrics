import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'rubrics',
  password: process.env.POSTGRES_PASSWORD || 'rubrics123',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'rubrics_db',
});

// Test database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL');
  }
});

// ============ DISCIPLINES ============

// GET /api/disciplines - List all disciplines
app.get('/api/disciplines', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM disciplines ORDER BY name'
    );
    res.json(result.rows.map(r => r.name));
  } catch (err) {
    console.error('Error fetching disciplines:', err);
    res.status(500).json({ error: 'Failed to fetch disciplines' });
  }
});

// GET /api/disciplines/:name/config - Get discipline config (levels)
app.get('/api/disciplines/:name/config', async (req, res) => {
  try {
    const { name } = req.params;
    const result = await pool.query(
      `SELECT dl.file_name as file, dl.level_name as level
       FROM designer_levels dl
       JOIN disciplines d ON d.id = dl.discipline_id
       WHERE d.name = $1
       ORDER BY dl.sort_order`,
      [name]
    );
    res.json({ files: result.rows });
  } catch (err) {
    console.error('Error fetching config:', err);
    res.status(500).json({ error: 'Failed to fetch discipline config' });
  }
});

// ============ RUBRICS ============

// GET /api/rubrics/:discipline - Get rubric data for a discipline
app.get('/api/rubrics/:discipline', async (req, res) => {
  try {
    const { discipline } = req.params;
    const { level } = req.query; // Optional filter by level
    
    let query = `
      SELECT r.id, r.interview_stage, r.competency, r.designer_level,
             r.score_1, r.score_2, r.score_3, r.score_4
      FROM rubrics r
      JOIN disciplines d ON d.id = r.discipline_id
      WHERE d.name = $1
    `;
    const params = [discipline];
    
    if (level) {
      query += ' AND r.designer_level = $2';
      params.push(level);
    }
    
    query += ' ORDER BY r.interview_stage, r.competency';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching rubrics:', err);
    res.status(500).json({ error: 'Failed to fetch rubrics' });
  }
});

// PUT /api/rubrics/:id - Update a rubric cell
app.put('/api/rubrics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;
    
    // Validate field name to prevent SQL injection
    const allowedFields = ['score_1', 'score_2', 'score_3', 'score_4', 'interview_stage', 'competency'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid field name' });
    }
    
    const result = await pool.query(
      `UPDATE rubrics SET ${field} = $1 WHERE id = $2 RETURNING *`,
      [value, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rubric not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating rubric:', err);
    res.status(500).json({ error: 'Failed to update rubric' });
  }
});

// ============ COMPETENCY DEFINITIONS ============

// GET /api/competencies/:discipline - Get competency definitions
app.get('/api/competencies/:discipline', async (req, res) => {
  try {
    const { discipline } = req.params;
    const result = await pool.query(
      `SELECT cd.id, cd.competency, cd.focus_area, cd.description
       FROM competency_definitions cd
       JOIN disciplines d ON d.id = cd.discipline_id
       WHERE d.name = $1
       ORDER BY cd.competency`,
      [discipline]
    );
    
    // Transform to the expected format: { [competency]: { focusArea, description } }
    const definitions = {};
    for (const row of result.rows) {
      definitions[row.competency] = {
        id: row.id,
        focusArea: row.focus_area,
        description: row.description
      };
    }
    
    res.json(definitions);
  } catch (err) {
    console.error('Error fetching competencies:', err);
    res.status(500).json({ error: 'Failed to fetch competencies' });
  }
});

// PUT /api/competencies/:id - Update a competency definition
app.put('/api/competencies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;
    
    // Validate field name
    const allowedFields = ['competency', 'focus_area', 'description'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid field name' });
    }
    
    const result = await pool.query(
      `UPDATE competency_definitions SET ${field} = $1 WHERE id = $2 RETURNING *`,
      [value, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Competency not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating competency:', err);
    res.status(500).json({ error: 'Failed to update competency' });
  }
});

// ============ QUESTIONS ============

// GET /api/questions/:discipline - Get questions
app.get('/api/questions/:discipline', async (req, res) => {
  try {
    const { discipline } = req.params;
    const result = await pool.query(
      `SELECT q.id, q.stage, q.competency, q.questions
       FROM questions q
       JOIN disciplines d ON d.id = q.discipline_id
       WHERE d.name = $1
       ORDER BY q.stage, q.competency`,
      [discipline]
    );
    
    // Transform to the expected format: { [stage|competency]: questions }
    const questions = {};
    for (const row of result.rows) {
      const key = `${row.stage}|${row.competency}`;
      questions[key] = {
        id: row.id,
        text: row.questions
      };
    }
    
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// PUT /api/questions/:id - Update questions
app.put('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;
    
    const result = await pool.query(
      'UPDATE questions SET questions = $1 WHERE id = $2 RETURNING *',
      [questions, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Questions not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating questions:', err);
    res.status(500).json({ error: 'Failed to update questions' });
  }
});

// ============ CHANGE LOG ============

// GET /api/changelog - Get recent changes
app.get('/api/changelog', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const result = await pool.query(
      `SELECT id, table_name, record_id, field_name, old_value, new_value, changed_at
       FROM change_log
       ORDER BY changed_at DESC
       LIMIT $1`,
      [parseInt(limit)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching changelog:', err);
    res.status(500).json({ error: 'Failed to fetch changelog' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Start server
const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

