/**
 * Script to create admin users for counselors
 * Run with: node scripts/create-counselor-admins.js
 * 
 * Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env file
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const counselors = [
  {
    email: 'ogachia@ueab.ac.ke',
    password: 'ogachia@2026',
    fullName: 'Counselor Ogachia',
    role: 'admin',
    gender: 'male'
  },
  {
    email: 'ngetichl@ueab.ac.ke',
    password: 'ngetichl@2026',
    fullName: 'Counselor Ngetich',
    role: 'admin',
    gender: 'female'
  }
]

async function createAdminUser(counselor) {
  try {
    console.log(`\n📧 Creating admin user for ${counselor.email}...`)

    // Check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    let authUser = existingUsers?.users?.find(u => u.email === counselor.email)

    // Create auth user if doesn't exist
    if (!authUser) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: counselor.email,
        password: counselor.password,
        email_confirm: true,
      })

      if (authError) {
        throw new Error(`Auth creation error: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Failed to create auth user')
      }

      authUser = authData.user
      console.log(`  ✅ Auth user created: ${authUser.id}`)
    } else {
      console.log(`  ℹ️  Auth user already exists: ${authUser.id}`)
    }

    // Check if admin_users entry exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existingAdmin) {
      // Update existing admin user
      const { data: updatedAdmin, error: updateError } = await supabase
        .from('admin_users')
        .update({
          email: counselor.email,
          full_name: counselor.fullName,
          role: counselor.role,
          is_active: true,
        })
        .eq('id', authUser.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`)
      }

      console.log(`  ✅ Admin user updated in database`)
      return { success: true, adminUser: updatedAdmin, authUser, isNew: false }
    } else {
      // Create new admin_users entry
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: authUser.id,
          email: counselor.email,
          full_name: counselor.fullName,
          role: counselor.role,
          is_active: true,
        })
        .select()
        .single()

      if (adminError) {
        throw new Error(`Admin creation error: ${adminError.message}`)
      }

      console.log(`  ✅ Admin user created in database`)
      return { success: true, adminUser, authUser, isNew: true }
    }
  } catch (error) {
    console.error(`  ❌ Error creating admin user for ${counselor.email}:`, error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Starting counselor admin user creation...\n')
  console.log('=' .repeat(60))

  const results = []

  for (const counselor of counselors) {
    const result = await createAdminUser(counselor)
    results.push({ counselor, result })
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Summary:\n')

  results.forEach(({ counselor, result }) => {
    if (result.success) {
      console.log(`✅ ${counselor.email} - ${result.isNew ? 'Created' : 'Updated'}`)
      console.log(`   Admin User ID: ${result.adminUser.id}`)
    } else {
      console.log(`❌ ${counselor.email} - Failed: ${result.error}`)
    }
  })

  const successCount = results.filter(r => r.result.success).length
  const failCount = results.filter(r => !r.result.success).length

  console.log(`\n✅ Success: ${successCount}`)
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`)
  }

  console.log('\n✨ Next steps:')
  console.log('1. Go to /admin/dashboard → "Counselors" tab')
  console.log('2. Click "Add Counselor"')
  console.log('3. Select the admin user from dropdown')
  console.log('4. Fill in counselor details and create profile')
  console.log('\n')
}

main().catch(console.error)
