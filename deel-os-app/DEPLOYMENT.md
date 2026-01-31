# Deployment Guide: Supabase + Vercel

This guide walks you through deploying the Design Rubrics app to production using Supabase (database + auth) and Vercel (hosting).

## Prerequisites

- GitHub account (your repo is already connected)
- Supabase account (free tier works)
- Vercel account (free tier works)

---

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `design-rubrics` (or your preference)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project" (takes ~2 minutes)

### 1.2 Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/schema.sql` from this repo
4. Paste and click "Run"
5. You should see "Success. No rows returned" for each statement

### 1.3 Enable Google Authentication

1. Go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. You'll need Google OAuth credentials:

#### Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URI:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   (Get YOUR-PROJECT-REF from Supabase dashboard URL)
7. Copy the **Client ID** and **Client Secret**

Back in Supabase:
1. Paste the Client ID and Client Secret
2. Click "Save"

### 1.4 Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...`

---

## Step 2: Deploy to Vercel

### 2.1 Import Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `deel-os-app` folder as the root directory

### 2.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### 2.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete (~1-2 minutes)
3. Your app is live at `https://your-project.vercel.app`

### 2.4 Update Google OAuth Redirect

Add your Vercel URL to Google OAuth:
1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add authorized redirect URI:
   ```
   https://your-project.vercel.app
   ```
4. Add authorized JavaScript origin:
   ```
   https://your-project.vercel.app
   ```

---

## Step 3: Migrate Existing Data (Optional)

If you have data in the SQLite database, you can migrate it to Supabase.

### Export from SQLite

```bash
# In the backend folder
python3 -c "
import sqlite3
import json

conn = sqlite3.connect('rubrics.db')
conn.row_factory = sqlite3.Row

# Export rubric_data
cursor = conn.execute('SELECT * FROM rubric_data')
rubrics = [dict(row) for row in cursor.fetchall()]
with open('rubrics_export.json', 'w') as f:
    json.dump(rubrics, f, indent=2)

# Export questions
cursor = conn.execute('SELECT * FROM questions')
questions = [dict(row) for row in cursor.fetchall()]
with open('questions_export.json', 'w') as f:
    json.dump(questions, f, indent=2)

print(f'Exported {len(rubrics)} rubrics and {len(questions)} questions')
"
```

### Import to Supabase

1. Go to Supabase → Table Editor
2. Select the table (e.g., `rubric_data`)
3. Click "Insert" → "Import data from CSV"
4. Or use the SQL Editor to insert JSON data

---

## Step 4: Set Up Admin Users

After deployment, add admin users:

1. Have users sign in with their @deel.com Google accounts
2. In Supabase → Table Editor → `profiles`
3. Find the user and change their `role` to `admin` or `editor`

---

## Local Development

For local development with Supabase:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials

3. Run the dev server:
   ```bash
   npm run dev
   ```

---

## Troubleshooting

### "Access denied" error on login
- Make sure the user has a @deel.com email
- Check that Google OAuth is properly configured in Supabase

### Data not showing up
- Verify the schema was created (check Table Editor)
- Check browser console for API errors
- Ensure environment variables are set correctly

### Build fails on Vercel
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- These must be prefixed with `VITE_` for Vite to include them

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Vercel        │────▶│   Supabase      │
│   (Frontend)    │     │   (Backend)     │
│                 │     │                 │
│   - React App   │     │   - PostgreSQL  │
│   - Static Host │     │   - Auth        │
│                 │     │   - RLS         │
└─────────────────┘     └─────────────────┘
```

- **Vercel** hosts the React frontend
- **Supabase** provides:
  - PostgreSQL database
  - Google OAuth authentication
  - Row Level Security for authorization
  - Real-time subscriptions (optional)
