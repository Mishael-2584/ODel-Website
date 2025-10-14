const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Starting UEAB ODel Database Setup...\n')

  try {
    // Step 1: Read and execute migration SQL
    console.log('📊 Step 1: Running database migration...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250114000000_initial_schema.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Note: Supabase JS client doesn't support raw SQL execution
    // We'll need to use the Management API or manual execution
    console.log('⚠️  Migration SQL needs to be run manually in Supabase SQL Editor')
    console.log('   URL: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql')
    console.log('   File: supabase/migrations/20250114000000_initial_schema.sql\n')

    // Step 2: Create admin account
    console.log('👤 Step 2: Creating admin account...')
    
    const adminEmail = 'instructionaldesigner@ueab.ac.ke'
    const adminPassword = 'Odel@2025!'
    const adminName = 'Instructional Designer'

    // Sign up the admin user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: adminName,
          role: 'admin'
        }
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️  Admin account already exists')
        
        // Try to update the role
        const { data: users, error: listError } = await supabase.auth.admin.listUsers()
        
        if (!listError) {
          const adminUser = users.users.find(u => u.email === adminEmail)
          if (adminUser) {
            // Update profile to admin role
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin', full_name: adminName })
              .eq('id', adminUser.id)
            
            if (!updateError) {
              console.log('✅ Admin role updated successfully')
            }
          }
        }
      } else {
        console.error('❌ Error creating admin:', signUpError.message)
      }
    } else {
      console.log('✅ Admin account created successfully!')
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Password: ${adminPassword}`)
      
      // Update the profile to ensure admin role
      if (signUpData.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin', full_name: adminName })
          .eq('id', signUpData.user.id)
        
        if (!updateError) {
          console.log('✅ Admin role assigned')
        }
      }
    }

    console.log('\n🎉 Setup Complete!')
    console.log('\n📝 Admin Credentials:')
    console.log('   Email: instructionaldesigner@ueab.ac.ke')
    console.log('   Password: Odel@2025!')
    console.log('\n🌐 Next Steps:')
    console.log('   1. If migration wasn\'t run, copy SQL from: supabase/migrations/20250114000000_initial_schema.sql')
    console.log('   2. Run it in: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql')
    console.log('   3. Start dev server: npm run dev')
    console.log('   4. Login at: http://localhost:3000/login')
    console.log('   5. You\'ll be redirected to: http://localhost:3000/admin/dashboard')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()

