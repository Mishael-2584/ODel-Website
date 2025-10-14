const https = require('https')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const projectRef = 'vsirtnqfvimtkgabxpzy'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials')
  process.exit(1)
}

// Read the migration SQL file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250114000000_initial_schema.sql')
const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

console.log('🚀 Running UEAB ODel Database Migration...\n')
console.log('📊 Creating 12 database tables...')
console.log('   - profiles, courses, lessons')
console.log('   - enrollments, lesson_progress')
console.log('   - assignments, submissions')
console.log('   - notifications, discussions')
console.log('   - discussion_replies, reviews, certificates\n')

// Split SQL into individual statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

// Execute SQL using Supabase REST API
async function executeSQLStatements() {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey)

  let successCount = 0
  let errorCount = 0

  console.log('⚙️  Executing migration...\n')

  // Since we can't execute raw SQL directly via the JS client for DDL,
  // we need to use the PostgREST API or SQL Editor
  // For now, let's try using the rpc function approach

  // Actually, the best approach is to use fetch with the SQL endpoint
  const sqlEndpoint = `${supabaseUrl}/rest/v1/rpc/exec_sql`
  
  try {
    // Try executing as one batch
    const fullSQL = statements.join(';\n')
    
    console.log('Attempting to execute full migration...')
    console.log('Note: This requires database admin access\n')
    
    // We'll need to guide the user to run this manually
    console.log('⚠️  IMPORTANT: Direct SQL execution requires admin privileges')
    console.log('   The JavaScript client cannot execute DDL statements\n')
    
    console.log('✅ Migration SQL is ready!')
    console.log('📋 Next step: Copy and paste the SQL in Supabase SQL Editor\n')
    
    // Save a formatted version for easy copying
    const formattedSQL = `-- UEAB ODel Database Migration\n-- Auto-generated on ${new Date().toISOString()}\n\n${fullSQL}`
    const outputPath = path.join(__dirname, 'migration-ready.sql')
    fs.writeFileSync(outputPath, formattedSQL, 'utf8')
    
    console.log(`📝 Migration SQL saved to: ${outputPath}`)
    console.log('\n🌐 To complete setup:')
    console.log('   1. Open: https://supabase.com/dashboard/project/${projectRef}/sql')
    console.log('   2. Click "New query"')
    console.log('   3. Copy content from: scripts/migration-ready.sql')
    console.log('   4. Paste and click RUN')
    console.log('\nOR simply run this command if you have Supabase CLI installed:')
    console.log('   supabase db push\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

executeSQLStatements()

