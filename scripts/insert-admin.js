const { createClient } = require('@supabase/supabase-js')

async function insertAdmin() {
  const supabase = createClient(
    'https://vsirtnqfvimtkgabxpzy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaXJ0bnFmdmltdGtnYWJ4cHl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDQxMzc5OSwiZXhwIjoyMDc1OTg5Nzk5fQ.2yEPhE1-pZyM0VQJd5CnWgWbECj4l1u4aHhGNz5f8Lw'
  )

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
      return
    }

    console.log('✅ Admin account created!\n')
    console.log('📧 Email: admin@ueab.ac.ke')
    console.log('🔑 Password: Changes@2025\n')
    console.log('🎉 You can now login at http://localhost:3000/admin/login')
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

insertAdmin()
