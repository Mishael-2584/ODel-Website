#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')

console.log('\n' + '='.repeat(60))
console.log('🚀 SUPABASE MIGRATION RUNNER')
console.log('='.repeat(60) + '\n')

// Read migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20251022_passwordless_auth.sql')
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

console.log('📋 Migration file loaded')
console.log('📝 Size:', (migrationSQL.length / 1024).toFixed(2), 'KB')
console.log('📊 Lines:', migrationSQL.split('\n').length)

console.log('\n' + '='.repeat(60))
console.log('INSTRUCTIONS:')
console.log('='.repeat(60) + '\n')

console.log('1️⃣  Go to Supabase Dashboard:')
console.log('   https://app.supabase.com\n')

console.log('2️⃣  Select Project: UEAB ODeL\n')

console.log('3️⃣  Go to: SQL Editor → New Query\n')

console.log('4️⃣  Copy and paste the SQL below:')
console.log('\n' + '─'.repeat(60))
console.log(migrationSQL)
console.log('─'.repeat(60) + '\n')

console.log('5️⃣  Click "Run" button\n')

console.log('6️⃣  Verify tables created in "Table Editor":\n')
console.log('   ✅ magic_codes')
console.log('   ✅ student_sessions')
console.log('   ✅ admin_users')
console.log('   ✅ admin_sessions')
console.log('   ✅ admin_audit_log\n')

console.log('='.repeat(60))
console.log('✅ After migration completes, run:')
console.log('   npm run auth:setup')
console.log('='.repeat(60) + '\n')
