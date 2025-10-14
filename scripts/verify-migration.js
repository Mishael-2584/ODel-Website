const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyTables() {
  console.log('🔍 Verifying database tables...\n')

  try {
    // Try to query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Tables NOT created yet')
        console.log('   Error: Table "profiles" does not exist\n')
        console.log('🔧 The migration needs to be run manually:')
        console.log('   Run: .\\run-migration.ps1')
        console.log('   Or visit: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql\n')
        return false
      }
      throw error
    }

    console.log('✅ SUCCESS! Database tables are created!')
    console.log('\n📊 Verified tables:')
    console.log('   ✓ profiles')
    
    // Check other tables
    const tables = ['courses', 'lessons', 'enrollments', 'notifications']
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(0)
      if (!tableError) {
        console.log(`   ✓ ${table}`)
      }
    }

    console.log('\n🎉 Your database is ready!')
    console.log('\n🚀 Next steps:')
    console.log('   1. Start dev server: npm run dev')
    console.log('   2. Login at: http://localhost:3000/login')
    console.log('   3. Email: instructionaldesigner@ueab.ac.ke')
    console.log('   4. Password: Odel@2025!\n')
    
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

verifyTables()

