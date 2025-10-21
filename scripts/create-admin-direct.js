const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createAdmin() {
  console.log('🔐 Creating admin account...\n')
  
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@ueab.ac.ke',
        password_hash: '$2b$10$NfOEZsGn/E753DWdSUN/weobXe0uHYY7HrehHHbAIDuXD/lFWIJoG',
        full_name: 'Administrator',
        role: 'super_admin',
        is_active: true
      })
      .select()

    if (error) {
      console.error('❌ Error:', error.message)
      return false
    }

    console.log('✅ Admin account created successfully!\n')
    console.log('📧 Email: admin@ueab.ac.ke')
    console.log('🔑 Password: Changes@2025\n')
    return true
  } catch (err) {
    console.error('❌ Error:', err.message)
    return false
  }
}

createAdmin().then(success => {
  if (success) {
    console.log('✅ Setup complete! You can now login.')
  }
  process.exit(success ? 0 : 1)
})
