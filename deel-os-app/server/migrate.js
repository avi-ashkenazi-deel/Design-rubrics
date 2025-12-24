import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';
import Papa from 'papaparse';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'rubrics',
  password: process.env.POSTGRES_PASSWORD || 'rubrics123',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'rubrics_db',
});

const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'disciplines');

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}

// Get the interview stage column name (varies by discipline)
function getStageColumn(headers) {
  // Design uses "Assessment Stage", Engineering uses "Focus Area"
  if (headers.includes('Assessment Stage')) return 'Assessment Stage';
  if (headers.includes('Focus Area')) return 'Focus Area';
  return headers[0]; // fallback to first column
}

// Get score columns
function getScoreColumns(headers) {
  const scoreColumns = [];
  for (const header of headers) {
    if (header.toLowerCase().includes('level 1')) scoreColumns[0] = header;
    else if (header.toLowerCase().includes('level 2')) scoreColumns[1] = header;
    else if (header.toLowerCase().includes('level 3')) scoreColumns[2] = header;
    else if (header.toLowerCase().includes('level 4')) scoreColumns[3] = header;
  }
  return scoreColumns;
}

async function migrate() {
  console.log('🚀 Starting migration...\n');
  
  try {
    // Read disciplines index
    const indexPath = path.join(PUBLIC_DIR, 'index.json');
    const disciplinesIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const disciplines = disciplinesIndex.disciplines;
    
    console.log(`Found ${disciplines.length} disciplines: ${disciplines.join(', ')}\n`);
    
    for (const disciplineName of disciplines) {
      console.log(`\n📁 Processing discipline: ${disciplineName}`);
      
      const disciplineDir = path.join(PUBLIC_DIR, disciplineName);
      
      // Check if discipline directory exists
      if (!fs.existsSync(disciplineDir)) {
        console.log(`  ⚠️ Directory not found, skipping...`);
        continue;
      }
      
      // Insert discipline
      const disciplineResult = await pool.query(
        'INSERT INTO disciplines (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
        [disciplineName]
      );
      const disciplineId = disciplineResult.rows[0].id;
      console.log(`  ✅ Discipline ID: ${disciplineId}`);
      
      // Read files.json for this discipline
      const filesJsonPath = path.join(disciplineDir, 'files.json');
      if (!fs.existsSync(filesJsonPath)) {
        console.log(`  ⚠️ No files.json found, skipping rubrics...`);
        continue;
      }
      
      const filesConfig = JSON.parse(fs.readFileSync(filesJsonPath, 'utf-8'));
      
      // Insert designer levels and rubrics for each file
      for (let i = 0; i < filesConfig.files.length; i++) {
        const fileConfig = filesConfig.files[i];
        const { file, level } = fileConfig;
        
        // Insert designer level
        await pool.query(
          `INSERT INTO designer_levels (discipline_id, level_name, file_name, sort_order) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (discipline_id, level_name) DO UPDATE SET file_name = $3, sort_order = $4`,
          [disciplineId, level, file, i]
        );
        console.log(`  📄 Processing level: ${level} (${file})`);
        
        // Parse and import rubric CSV
        const rubricPath = path.join(disciplineDir, file);
        if (!fs.existsSync(rubricPath)) {
          console.log(`    ⚠️ File not found: ${file}`);
          continue;
        }
        
        const rubricData = parseCSV(rubricPath);
        if (rubricData.length === 0) continue;
        
        const headers = Object.keys(rubricData[0]);
        const stageColumn = getStageColumn(headers);
        const scoreColumns = getScoreColumns(headers);
        
        let lastStage = '';
        let insertedCount = 0;
        
        for (const row of rubricData) {
          // Get interview stage (use previous if empty - for merged cells in CSV)
          const stage = row[stageColumn]?.trim() || lastStage;
          if (stage) lastStage = stage;
          
          const competency = row['Competency']?.trim();
          if (!competency) continue; // Skip rows without competency
          
          const score1 = row[scoreColumns[0]]?.trim() || '';
          const score2 = row[scoreColumns[1]]?.trim() || '';
          const score3 = row[scoreColumns[2]]?.trim() || '';
          const score4 = row[scoreColumns[3]]?.trim() || '';
          
          // Insert rubric
          await pool.query(
            `INSERT INTO rubrics (discipline_id, interview_stage, competency, designer_level, score_1, score_2, score_3, score_4)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [disciplineId, stage, competency, level, score1, score2, score3, score4]
          );
          insertedCount++;
        }
        console.log(`    ✅ Inserted ${insertedCount} rubric entries`);
      }
      
      // Import competency definitions
      const competenciesPath = path.join(disciplineDir, 'Competencies.csv');
      if (fs.existsSync(competenciesPath)) {
        console.log(`  📄 Importing competency definitions...`);
        const competenciesData = parseCSV(competenciesPath);
        
        let competencyCount = 0;
        for (const row of competenciesData) {
          const focusArea = row['Focus Area']?.trim() || '';
          const competency = row['Competency']?.trim();
          const description = row['Description']?.trim() || '';
          
          if (!competency) continue;
          
          await pool.query(
            `INSERT INTO competency_definitions (discipline_id, competency, focus_area, description)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (discipline_id, competency) DO UPDATE SET focus_area = $3, description = $4`,
            [disciplineId, competency, focusArea, description]
          );
          competencyCount++;
        }
        console.log(`    ✅ Inserted ${competencyCount} competency definitions`);
      }
      
      // Import questions
      const questionsPath = path.join(disciplineDir, 'Questions.csv');
      if (fs.existsSync(questionsPath)) {
        console.log(`  📄 Importing questions...`);
        const questionsData = parseCSV(questionsPath);
        
        let questionsCount = 0;
        for (const row of questionsData) {
          const stage = row['Stage']?.trim();
          const competency = row['Competency']?.trim();
          const questions = row['Questions']?.trim() || '';
          
          if (!stage || !competency) continue;
          
          await pool.query(
            `INSERT INTO questions (discipline_id, stage, competency, questions)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (discipline_id, stage, competency) DO UPDATE SET questions = $4`,
            [disciplineId, stage, competency, questions]
          );
          questionsCount++;
        }
        console.log(`    ✅ Inserted ${questionsCount} question entries`);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    // Print summary
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM disciplines) as disciplines,
        (SELECT COUNT(*) FROM designer_levels) as levels,
        (SELECT COUNT(*) FROM rubrics) as rubrics,
        (SELECT COUNT(*) FROM competency_definitions) as competencies,
        (SELECT COUNT(*) FROM questions) as questions
    `);
    
    console.log('\n📊 Summary:');
    console.log(`  - Disciplines: ${summary.rows[0].disciplines}`);
    console.log(`  - Designer Levels: ${summary.rows[0].levels}`);
    console.log(`  - Rubric Entries: ${summary.rows[0].rubrics}`);
    console.log(`  - Competency Definitions: ${summary.rows[0].competencies}`);
    console.log(`  - Question Entries: ${summary.rows[0].questions}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();

