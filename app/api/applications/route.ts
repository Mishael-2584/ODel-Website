import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Submit new graduate application
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const body = await request.json()
    const {
      application_type,
      surname,
      first_name,
      middle_name,
      date_of_birth,
      gender,
      nationality,
      country_of_citizenship,
      country_of_residence,
      place_of_birth,
      id_passport_number,
      marital_status,
      phone_number,
      email,
      postal_address,
      physical_address,
      coming_with_family,
      number_of_children,
      visa_type,
      year_of_entry_to_kenya,
      religious_affiliation,
      church_name,
      church_address,
      has_physical_handicap,
      physical_handicap_details,
      program_applied_for,
      specialization,
      mode_of_study,
      entry_level,
      proposed_start_date,
      undergraduate_degree,
      undergraduate_institution,
      undergraduate_year,
      undergraduate_class,
      masters_degree,
      masters_institution,
      masters_year,
      other_qualifications,
      kcse_year,
      kcse_index_number,
      kcse_mean_grade,
      secondary_school_name,
      years_of_experience,
      current_employer,
      current_position,
      work_experience_details,
      referee1_name,
      referee1_position,
      referee1_institution,
      referee1_email,
      referee1_phone,
      referee2_name,
      referee2_position,
      referee2_institution,
      referee2_email,
      referee2_phone,
      referee3_name,
      referee3_position,
      referee3_institution,
      referee3_email,
      referee3_phone,
      has_foreign_qualification,
      research_proposal,
      application_fee_amount,
      documents_uploaded,
    } = body

    // Validate required fields
    if (!surname || !first_name || !date_of_birth || !email || !phone_number || !program_applied_for) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate application number
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current year
    const year = new Date().getFullYear()
    
    // Get the highest sequence number for this year
    const { data: existingApps } = await supabaseAdmin
      .from('graduate_applications')
      .select('application_number')
      .like('application_number', `${year}GRA%`)
      .order('application_number', { ascending: false })
      .limit(1)

    let sequence_num = 1
    if (existingApps && existingApps.length > 0) {
      const lastNumber = existingApps[0].application_number
      const lastSequence = parseInt(lastNumber.substring(7)) || 0
      sequence_num = lastSequence + 1
    }

    // Generate appropriate application number prefix based on type
    const prefixMap: Record<string, string> = {
      graduate: 'GRA',
      phd: 'PHD',
      pgda: 'PGA',
      undergraduate: 'UGR',
      diploma: 'DIP',
      certificate: 'CER',
    }
    const prefix = prefixMap[application_type || 'graduate'] || 'APP'
    const application_number = `${year}${prefix}${String(sequence_num).padStart(4, '0')}`

    // Get client IP
    const ip_address = request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown'

    // Insert application
    const { data, error } = await supabaseAdmin
      .from('graduate_applications')
      .insert({
        application_number,
        surname,
        first_name,
        middle_name: middle_name || null,
        date_of_birth,
        gender,
        nationality: nationality || null,
        country_of_citizenship: country_of_citizenship || null,
        country_of_residence: country_of_residence || null,
        place_of_birth: place_of_birth || null,
        id_passport_number: id_passport_number || null,
        marital_status: marital_status || null,
        phone_number,
        email,
        postal_address: postal_address || null,
        physical_address: physical_address || null,
        coming_with_family: coming_with_family || false,
        number_of_children: number_of_children || 0,
        visa_type: visa_type || null,
        year_of_entry_to_kenya: year_of_entry_to_kenya ? parseInt(year_of_entry_to_kenya) : null,
        religious_affiliation: religious_affiliation || null,
        church_name: church_name || null,
        church_address: church_address || null,
        has_physical_handicap: has_physical_handicap || false,
        physical_handicap_details: physical_handicap_details || null,
        program_applied_for,
        specialization: specialization || null,
        mode_of_study: mode_of_study || 'Online',
        entry_level: entry_level || null,
        proposed_start_date: proposed_start_date || null,
        undergraduate_degree: undergraduate_degree || null,
        undergraduate_institution: undergraduate_institution || null,
        undergraduate_year: undergraduate_year || null,
        undergraduate_class: undergraduate_class || null,
        masters_degree: masters_degree || null,
        masters_institution: masters_institution || null,
        masters_year: masters_year || null,
        other_qualifications: other_qualifications || null,
        kcse_year: kcse_year || null,
        kcse_index_number: kcse_index_number || null,
        kcse_mean_grade: kcse_mean_grade || null,
        secondary_school_name: secondary_school_name || null,
        years_of_experience: years_of_experience || 0,
        current_employer: current_employer || null,
        current_position: current_position || null,
        work_experience_details: work_experience_details || null,
        referee1_name: referee1_name || null,
        referee1_position: referee1_position || null,
        referee1_institution: referee1_institution || null,
        referee1_email: referee1_email || null,
        referee1_phone: referee1_phone || null,
        referee2_name: referee2_name || null,
        referee2_position: referee2_position || null,
        referee2_institution: referee2_institution || null,
        referee2_email: referee2_email || null,
        referee2_phone: referee2_phone || null,
        referee3_name: referee3_name || null,
        referee3_position: referee3_position || null,
        referee3_institution: referee3_institution || null,
        referee3_email: referee3_email || null,
        referee3_phone: referee3_phone || null,
        has_foreign_qualification: has_foreign_qualification || false,
        application_type: application_type || 'graduate',
        application_fee_amount: parseFloat(application_fee_amount || '0'),
        application_fee_paid: false,
        documents_uploaded: documents_uploaded || [],
        // Part 2: Study Preference
        institution_current_or_last: institution_current_or_last || null,
        degree_desired: degree_desired || null,
        degree_area: degree_area || null,
        degree_option: degree_option || null,
        campus_preference: campus_preference || null,
        language_of_instruction: language_of_instruction || null,
        english_proficiency_written: english_proficiency_written || null,
        english_proficiency_spoken: english_proficiency_spoken || null,
        accommodation_plan: accommodation_plan || null,
        accommodation_details: accommodation_details || null,
        financing_method: financing_method || null,
        financing_details: financing_details || null,
        // Part 3-5
        educational_background: educational_background || [],
        employment_record: employment_record || [],
        career_objectives: career_objectives || null,
        // Certification
        supporting_documents_checklist: supporting_documents_checklist || [],
        non_english_documents_note: non_english_documents_note || false,
        documents_in_original_language: documents_in_original_language || null,
        documents_translated_english: documents_translated_english || null,
        applicant_signature: applicant_signature || null,
        signature_date: signature_date || null,
        status: 'submitted',
        current_stage: 'Application Submitted',
        submitted_by_email: email,
        ip_address,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating application:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Application submitted successfully. Your application number is: ' + application_number
    })
  } catch (error: any) {
    console.error('Error in POST /api/applications:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Get application by number or email (for applicants to check status)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { searchParams } = new URL(request.url)
    const application_number = searchParams.get('application_number')
    const email = searchParams.get('email')

    if (!application_number && !email) {
      return NextResponse.json(
        { success: false, error: 'Application number or email required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('graduate_applications')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (application_number) {
      query = query.eq('application_number', application_number)
    } else if (email) {
      query = query.eq('email', email)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching application:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Return limited info for public access (no admin notes)
    const publicData = data?.map(app => ({
      ...app,
      admin_notes: undefined,
      evaluation_notes: undefined,
      ip_address: undefined,
    }))

    return NextResponse.json({ success: true, data: publicData })
  } catch (error: any) {
    console.error('Error in GET /api/applications:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

