import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Generate PDF for application
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID required' },
        { status: 400 }
      )
    }

    // Fetch application
    const { data: application, error } = await supabaseAdmin
      .from('graduate_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Generate PDF HTML content (matching UEAB form structure)
    const pdfHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 18pt;
            }
            .header p {
              margin: 5px 0;
              font-size: 10pt;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              background-color: #f0f0f0;
              padding: 8px;
              font-weight: bold;
              margin-bottom: 10px;
              border-left: 4px solid #0066cc;
            }
            .field-row {
              display: flex;
              margin-bottom: 8px;
            }
            .field {
              flex: 1;
              margin-right: 10px;
            }
            .field:last-child {
              margin-right: 0;
            }
            .label {
              font-weight: bold;
              font-size: 9pt;
              color: #333;
            }
            .value {
              padding: 5px;
              border-bottom: 1px solid #ccc;
              min-height: 20px;
            }
            .full-width {
              width: 100%;
            }
            .signature-section {
              margin-top: 40px;
              border-top: 1px solid #000;
              padding-top: 20px;
            }
            .signature-box {
              display: inline-block;
              width: 300px;
              margin-right: 50px;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              font-size: 9pt;
              color: #666;
              text-align: center;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>UNIVERSITY OF EASTERN AFRICA, BARATON (UEAB)</h1>
            <p>APPLICATION AND EVALUATION FORM</p>
            <p>Application Type: ${(application.application_type || 'Graduate').toUpperCase()}</p>
            <p>Application Number: ${application.application_number}</p>
          </div>

          <!-- Personal Information -->
          <div class="section">
            <div class="section-title">PERSONAL INFORMATION</div>
            <div class="field-row">
              <div class="field">
                <div class="label">Surname:</div>
                <div class="value">${application.surname || ''}</div>
              </div>
              <div class="field">
                <div class="label">First Name:</div>
                <div class="value">${application.first_name || ''}</div>
              </div>
              <div class="field">
                <div class="label">Middle Name:</div>
                <div class="value">${application.middle_name || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Date of Birth:</div>
                <div class="value">${application.date_of_birth || ''}</div>
              </div>
              <div class="field">
                <div class="label">Gender:</div>
                <div class="value">${application.gender || ''}</div>
              </div>
              <div class="field">
                <div class="label">Nationality:</div>
                <div class="value">${application.nationality || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">ID/Passport Number:</div>
                <div class="value">${application.id_passport_number || ''}</div>
              </div>
              <div class="field">
                <div class="label">Marital Status:</div>
                <div class="value">${application.marital_status || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Phone Number:</div>
                <div class="value">${application.phone_number || ''}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${application.email || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field full-width">
                <div class="label">Postal Address:</div>
                <div class="value">${application.postal_address || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field full-width">
                <div class="label">Physical Address:</div>
                <div class="value">${application.physical_address || ''}</div>
              </div>
            </div>
          </div>

          <!-- Program Information -->
          <div class="section">
            <div class="section-title">PROGRAM INFORMATION</div>
            <div class="field-row">
              <div class="field">
                <div class="label">Program Applied For:</div>
                <div class="value">${application.program_applied_for || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Specialization:</div>
                <div class="value">${application.specialization || ''}</div>
              </div>
              <div class="field">
                <div class="label">Mode of Study:</div>
                <div class="value">${application.mode_of_study || ''}</div>
              </div>
              <div class="field">
                <div class="label">Entry Level:</div>
                <div class="value">${application.entry_level || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Proposed Start Date:</div>
                <div class="value">${application.proposed_start_date || ''}</div>
              </div>
            </div>
          </div>

          <!-- Academic Qualifications -->
          <div class="section">
            <div class="section-title">ACADEMIC QUALIFICATIONS</div>
            ${application.kcse_year ? `
              <div class="field-row">
                <div class="field">
                  <div class="label">KCSE Year:</div>
                  <div class="value">${application.kcse_year || ''}</div>
                </div>
                <div class="field">
                  <div class="label">KCSE Mean Grade:</div>
                  <div class="value">${application.kcse_mean_grade || ''}</div>
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <div class="label">Index Number:</div>
                  <div class="value">${application.kcse_index_number || ''}</div>
                </div>
                <div class="field">
                  <div class="label">Secondary School:</div>
                  <div class="value">${application.secondary_school_name || ''}</div>
                </div>
              </div>
            ` : ''}
            ${application.undergraduate_degree ? `
              <div class="field-row">
                <div class="field">
                  <div class="label">Undergraduate Degree:</div>
                  <div class="value">${application.undergraduate_degree || ''}</div>
                </div>
                <div class="field">
                  <div class="label">Institution:</div>
                  <div class="value">${application.undergraduate_institution || ''}</div>
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <div class="label">Year of Completion:</div>
                  <div class="value">${application.undergraduate_year || ''}</div>
                </div>
                <div class="field">
                  <div class="label">Class/Division:</div>
                  <div class="value">${application.undergraduate_class || ''}</div>
                </div>
              </div>
            ` : ''}
            ${application.masters_degree ? `
              <div class="field-row">
                <div class="field">
                  <div class="label">Master's Degree:</div>
                  <div class="value">${application.masters_degree || ''}</div>
                </div>
                <div class="field">
                  <div class="label">Institution:</div>
                  <div class="value">${application.masters_institution || ''}</div>
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <div class="label">Year of Completion:</div>
                  <div class="value">${application.masters_year || ''}</div>
                </div>
              </div>
            ` : ''}
            <div class="field-row">
              <div class="field full-width">
                <div class="label">Other Qualifications:</div>
                <div class="value">${application.other_qualifications || ''}</div>
              </div>
            </div>
          </div>

          <!-- Work Experience -->
          <div class="section">
            <div class="section-title">WORK EXPERIENCE</div>
            <div class="field-row">
              <div class="field">
                <div class="label">Years of Experience:</div>
                <div class="value">${application.years_of_experience || 0}</div>
              </div>
              <div class="field">
                <div class="label">Current Employer:</div>
                <div class="value">${application.current_employer || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Current Position:</div>
                <div class="value">${application.current_position || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field full-width">
                <div class="label">Work Experience Details:</div>
                <div class="value">${application.work_experience_details || ''}</div>
              </div>
            </div>
          </div>

          <!-- References -->
          <div class="section">
            <div class="section-title">REFERENCES</div>
            <div class="field-row">
              <div class="field">
                <div class="label">Referee 1 - Name:</div>
                <div class="value">${application.referee1_name || ''}</div>
              </div>
              <div class="field">
                <div class="label">Position:</div>
                <div class="value">${application.referee1_position || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Institution:</div>
                <div class="value">${application.referee1_institution || ''}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${application.referee1_email || ''}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${application.referee1_phone || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Referee 2 - Name:</div>
                <div class="value">${application.referee2_name || ''}</div>
              </div>
              <div class="field">
                <div class="label">Position:</div>
                <div class="value">${application.referee2_position || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Institution:</div>
                <div class="value">${application.referee2_institution || ''}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${application.referee2_email || ''}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${application.referee2_phone || ''}</div>
              </div>
            </div>
            ${application.referee3_name ? `
            <div class="field-row">
              <div class="field">
                <div class="label">Referee 3 - Name:</div>
                <div class="value">${application.referee3_name || ''}</div>
              </div>
              <div class="field">
                <div class="label">Position:</div>
                <div class="value">${application.referee3_position || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Institution:</div>
                <div class="value">${application.referee3_institution || ''}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${application.referee3_email || ''}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${application.referee3_phone || ''}</div>
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Application Status -->
          <div class="section">
            <div class="section-title">APPLICATION STATUS</div>
            <div class="field-row">
              <div class="field">
                <div class="label">Status:</div>
                <div class="value">${application.status?.toUpperCase().replace('_', ' ') || ''}</div>
              </div>
              <div class="field">
                <div class="label">Current Stage:</div>
                <div class="value">${application.current_stage || ''}</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <div class="label">Submitted Date:</div>
                <div class="value">${new Date(application.submitted_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <!-- Admin Notes Section (if exists) -->
          ${application.admin_notes ? `
            <div class="section">
              <div class="section-title">ADMIN NOTES</div>
              <div class="field-row">
                <div class="field full-width">
                  <div class="value">${application.admin_notes}</div>
                </div>
              </div>
            </div>
          ` : ''}

          <div class="footer">
            <p>This form was generated on ${new Date().toLocaleDateString()} from UEAB ODeL Application System</p>
            <p>Application Number: ${application.application_number}</p>
          </div>
        </body>
      </html>
    `

    // Return HTML for browser to print/save as PDF
    // Note: For server-side PDF generation, you'd use a library like puppeteer or pdfkit
    return new NextResponse(pdfHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="application-${application.application_number}.html"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

