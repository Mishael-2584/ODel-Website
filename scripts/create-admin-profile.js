const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdminProfile() {
  console.log('👑 Creating Admin Profile...\n')

  try {
    // First, try to sign in to get the user ID
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'instructionaldesigner@ueab.ac.ke',
      password: 'Odel@2025!'
    })

    if (signInError) {
      console.log('⚠️  Could not sign in - admin account may not exist yet')
      console.log('   Creating admin account...\n')
      
      // Create the admin user
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: 'instructionaldesigner@ueab.ac.ke',
        password: 'Odel@2025!',
        options: {
          data: {
            full_name: 'Instructional Designer',
            role: 'admin'
          }
        }
      })

      if (signUpError) {
        console.error('❌ Error creating admin:', signUpError.message)
        return
      }

      console.log('✅ Admin account created!')
      console.log(`   User ID: ${newUser.user?.id}\n`)

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          username: 'admin',
          full_name: 'Instructional Designer',
          role: 'admin',
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.log('⚠️  Profile creation note:', profileError.message)
        console.log('   (This may be handled by trigger automatically)\n')
      } else {
        console.log('✅ Admin profile created in database!\n')
      }
    } else {
      console.log('✅ Admin user exists!')
      console.log(`   User ID: ${authData.user.id}`)
      console.log(`   Email: ${authData.user.email}\n`)

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileCheckError || !existingProfile) {
        console.log('📝 Creating profile in database...')
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: 'instructionaldesigner',
            full_name: 'Instructional Designer',
            role: 'admin',
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.log('⚠️  Note:', insertError.message)
        } else {
          console.log('✅ Profile created successfully!\n')
        }
      } else {
        console.log('✅ Profile already exists!')
        console.log(`   Name: ${existingProfile.full_name}`)
        console.log(`   Role: ${existingProfile.role}\n`)
      }

      // Sign out
      await supabase.auth.signOut()
    }

    console.log('=' . repeat(60))
    console.log('🎉 ADMIN SETUP COMPLETE!\n')
    console.log('📋 Login Credentials:')
    console.log('   Email: instructionaldesigner@ueab.ac.ke')
    console.log('   Password: Odel@2025!')
    console.log('\n🌐 Visit: http://localhost:3001/login')
    console.log('=' . repeat(60))

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createAdminProfile()


