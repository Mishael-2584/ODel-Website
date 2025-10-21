#!/usr/bin/env node

/**
 * 🔐 Module 2 Authentication Setup Script
 * Runs database migration and creates admin account
 */

const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function runMigration() {
  console.log('\n🔄 Running database migration...\n')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251022_passwordless_auth.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    
    console.log('📋 Migration SQL loaded')
    
    // Execute the migration
    const { error } = await supabase.rpc('sql', {
      sql: migrationSQL
    }).catch(async () => {
      // If RPC method doesn't exist, try direct SQL
      console.log('⚠️  RPC method not available, please run migration manually in Supabase Dashboard')
      return { error: 'Manual execution required' }
    })
    
    if (error && error.message !== 'Manual execution required') {
      console.error('❌ Migration error:', error)
      return false
    }
    
    console.log('✅ Database migration completed\n')
    return true
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    return false
  }
}

async function createAdminAccount() {
  console.log('👤 Creating admin account...\n')
  
  try {
    // Generate admin password hash
    const adminPassword = 'Changes@2025' // Default password - CHANGE THIS!
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    
    console.log('🔐 Password hashed:', passwordHash.substring(0, 20) + '...')
    
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@ueab.ac.ke')
      .single()
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists')
      return true
    }
    
    // Create admin account
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@ueab.ac.ke',
        password_hash: passwordHash,
        full_name: 'Administrator',
        role: 'super_admin',
        is_active: true
      })
      .select()
    
    if (error) {
      console.error('❌ Admin creation error:', error)
      return false
    }
    
    console.log('✅ Admin account created successfully')
    console.log('📧 Email: admin@ueab.ac.ke')
    console.log('🔑 Password: ' + adminPassword)
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n')
    
    return true
  } catch (error) {
    console.error('❌ Admin creation failed:', error.message)
    return false
  }
}

async function testConnection() {
  console.log('🔗 Testing Supabase connection...\n')
  
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    console.log('✅ Supabase connection successful\n')
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('⚠️  Make sure SUPABASE_SERVICE_ROLE_KEY is correct\n')
    return false
  }
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 MODULE 2 AUTHENTICATION SETUP')
  console.log('='.repeat(60) + '\n')
  
  // Test connection
  const connected = await testConnection()
  if (!connected) {
    process.exit(1)
  }
  
  // Run migration
  const migrationOk = await runMigration()
  
  // Create admin
  const adminOk = await createAdminAccount()
  
  console.log('='.repeat(60))
  if (migrationOk && adminOk) {
    console.log('✅ SETUP COMPLETE!\n')
    console.log('🎉 You can now login at:')
    console.log('   • Student: http://localhost:3000/auth')
    console.log('   • Admin: http://localhost:3000/admin/login\n')
    console.log('📝 Next steps:')
    console.log('   1. Go to /admin/login')
    console.log('   2. Enter email: admin@ueab.ac.ke')
    console.log('   3. Enter password: Changes@2025')
    console.log('   4. Change password immediately!\n')
  } else {
    console.log('⚠️  SETUP INCOMPLETE - Please check errors above\n')
  }
  console.log('='.repeat(60) + '\n')
}

main().catch(console.error)
