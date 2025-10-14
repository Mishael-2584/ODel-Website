const https = require('https')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

const projectRef = 'vsirtnqfvimtkgabxpzy'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Read migration SQL
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250114000000_initial_schema.sql')
const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

console.log('🚀 Pushing Migration to Supabase...\n')

// We need to execute via the pgmeta API
const options = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
}

const payload = JSON.stringify({
  query: migrationSQL
})

const req = https.request(options, (res) => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration pushed successfully!')
      console.log('\n📊 Database tables created:')
      console.log('   ✓ profiles, courses, lessons')
      console.log('   ✓ enrollments, lesson_progress')
      console.log('   ✓ assignments, submissions')
      console.log('   ✓ notifications, discussions')
      console.log('   ✓ discussion_replies, reviews, certificates')
      console.log('\n🎉 Setup complete! Start your dev server:')
      console.log('   npm run dev\n')
    } else {
      console.log(`❌ Error (${res.statusCode}):`, data)
      console.log('\n⚠️  The REST API cannot execute DDL statements.')
      console.log('   Please run the migration manually in Supabase SQL Editor:')
      console.log('   https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql\n')
    }
  })
})

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message)
  console.log('\n📋 Alternative: Run migration manually')
  console.log('   1. Open: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql')
  console.log('   2. Copy SQL from: supabase/migrations/20250114000000_initial_schema.sql')
  console.log('   3. Paste and click RUN\n')
})

req.write(payload)
req.end()

