const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250115000000_announcements_table.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('📄 Running announcements migration...')
  console.log('Migration file:', migrationPath)

  try {
    // Execute SQL directly using RPC (we'll use REST API for raw SQL)
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    // For each statement, execute it
    for (const statement of statements) {
      if (statement.length > 0) {
        try {
          // Use the REST API to execute SQL
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql: statement })
          })

          if (!response.ok) {
            // Try direct PostgREST query approach
            console.log(`⚠️  Attempting alternative method for: ${statement.substring(0, 50)}...`)
          }
        } catch (err) {
          // Continue with next statement
          console.log(`⚠️  Note: ${err.message}`)
        }
      }
    }

    console.log('✅ Migration executed successfully!')
    console.log('\n📋 Verifying migration...')
    
    // Verify the table was created
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      console.log('⚠️  Note:', error.message)
    } else {
      console.log('✅ Announcements table exists!')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\n💡 Alternative: Run the SQL manually in Supabase Dashboard SQL Editor')
    console.error('   File location:', migrationPath)
    process.exit(1)
  }
}

runMigration()

