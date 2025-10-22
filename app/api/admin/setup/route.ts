import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists in auth
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    let authUser = existingUsers?.users?.find(u => u.email === email);

    // If not exists, create it
    if (!authUser) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        return NextResponse.json(
          { error: `Auth error: ${authError.message}` },
          { status: 400 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 400 }
        );
      }

      authUser = authData.user;
    }

    // Check if admin_users entry already exists
    const { data: existingAdmin, error: existingError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    // If already exists, update it
    if (existingAdmin) {
      const { data: updatedAdmin, error: updateError } = await supabase
        .from('admin_users')
        .update({
          email,
          full_name: fullName || email.split('@')[0],
          role: 'admin',
          is_active: true,
        })
        .eq('id', authUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Admin user update error:', updateError);
        return NextResponse.json(
          { error: `Update error: ${updateError.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Admin user updated successfully',
          user: updatedAdmin,
          isNew: false,
        },
        { status: 200 }
      );
    }

    // Create new admin_users entry
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authUser.id,
        email,
        full_name: fullName || email.split('@')[0],
        role: 'admin',
        is_active: true,
      })
      .select()
      .single();

    if (adminError) {
      console.error('Admin user creation error:', adminError);
      return NextResponse.json(
        { error: `Admin creation error: ${adminError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully',
        user: adminUser,
        isNew: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: `Setup error: ${error}` },
      { status: 500 }
    );
  }
}

// GET to check admin status
export async function GET() {
  try {
    const { count: adminCount, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    const { data: adminUsers } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, is_active');

    return NextResponse.json(
      {
        exists: (adminCount || 0) > 0,
        count: adminCount || 0,
        admins: adminUsers || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json(
      { error: `Check error: ${error}` },
      { status: 500 }
    );
  }
}
