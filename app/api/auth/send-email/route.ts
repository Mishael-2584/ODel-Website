import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Email Configuration for Webmin/Virtualmin
const createTransporter = () => {
  console.log('📧 Creating email transporter...')
  
  try {
    // Use sendmail transport which works better with Webmin/Virtualmin
    const transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail'
    })
    
    console.log('📧 Using sendmail transport for Webmin/Virtualmin')
    return transporter
  } catch (error) {
    console.error('Failed to create sendmail transporter:', error)
    
    // Fallback to SMTP
    try {
      const smtpTransporter = nodemailer.createTransport({
        host: 'localhost',
        port: 25,
        secure: false,
        ignoreTLS: true,
        auth: false
      })
      
      console.log('📧 Using SMTP fallback')
      return smtpTransporter
    } catch (smtpError) {
      console.error('Failed to create SMTP transporter:', smtpError)
      
      // Final fallback to console logging
      return {
        sendMail: async (options: any) => {
          console.log('📧 EMAIL (Console Fallback):')
          console.log('📧 To:', options.to)
          console.log('📧 Subject:', options.subject)
          console.log('📧 Code:', options.html.match(/code">(\d+)</)?.[1] || 'N/A')
          console.log('📧 Full HTML:', options.html)
          return { messageId: 'console-fallback-' + Date.now() }
        }
      }
    }
  }
}

const getEmailTemplate = (template: string, data: any): { subject: string; html: string } => {
  switch (template) {
    case 'magic_code':
      return {
        subject: 'Your ODeL Dashboard Access Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px; }
                .header { text-align: center; padding: 20px 0; border-bottom: 3px solid #1e3a8a; }
                .logo { font-size: 28px; font-weight: bold; color: #1e3a8a; }
                .content { padding: 30px 0; }
                .code-box { 
                  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                  color: white;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: center;
                  margin: 20px 0;
                }
                .code { font-size: 36px; font-weight: bold; letter-spacing: 3px; font-family: monospace; }
                .expiry { font-size: 14px; color: #666; margin: 15px 0; }
                .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🎓 ODeL Dashboard</div>
                </div>
                <div class="content">
                  <h2>Hi ${data.studentName}!</h2>
                  <p>Your one-time access code is:</p>
                  <div class="code-box">
                    <div class="code">${data.code}</div>
                  </div>
                  <p>This code will expire in <strong>${data.expiryMinutes} minutes</strong>.</p>
                  <p>
                    <a href="https://odel.ueab.ac.ke/auth/verify?code=${data.code}&email=${encodeURIComponent(data.email)}" 
                       style="display: inline-block; background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                       Verify Code
                    </a>
                  </p>
                  <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>© 2025 University of Eastern Africa, Baraton - Open Distance eLearning Centre</p>
                </div>
              </div>
            </body>
          </html>
        `
      }
    case 'counseling_confirmation':
      const appointmentDate = new Date(`${data.appointment_date}T${data.appointment_time}`)
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      return {
        subject: 'Appointment Confirmed - Counseling Session',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: #f0f4ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #667eea; }
                .info-box h3 { margin-top: 0; color: #667eea; }
                .info-box p { margin: 10px 0; }
                .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                .contact-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✓ Appointment Confirmed</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Your counseling session is scheduled</p>
                </div>
                <div class="content">
                  <p>Dear <strong>${data.student_name}</strong>,</p>
                  <p>Great news! Your counseling appointment has been confirmed by your counselor.</p>
                  
                  <div class="info-box">
                    <h3>📅 Appointment Details</h3>
                    <p><strong>Date & Time:</strong> ${formattedDate}</p>
                    <p><strong>Counselor:</strong> ${data.counselor_name || 'TBA'}</p>
                    <p><strong>Service Type:</strong> ${data.appointment_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    ${data.zoom_meeting_url ? `
                      <p><strong>Meeting Link:</strong> <a href="${data.zoom_meeting_url}" style="color: #667eea; font-weight: bold; text-decoration: underline;">Join Zoom Meeting</a></p>
                      <p style="font-size: 13px; color: #666; margin-top: 5px;">
                        <strong>Note:</strong> Your counselor will start the meeting as the host. Please wait for them to begin the session.
                      </p>
                    ` : ''}
                  </div>

                  ${data.zoom_meeting_url ? `
                    <p style="background: #e8f4f8; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                      <strong>💻 Online Session via Zoom:</strong><br><br>
                      <strong>How it works:</strong><br>
                      • Your counselor will start the Zoom meeting as the host<br>
                      • You can join using the link above a few minutes before your scheduled time<br>
                      • The counselor will begin the session when they're ready<br>
                      • Please be patient if you join before the counselor - they will start shortly
                    </p>
                  ` : `
                    <p style="background: #fff4e6; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                      <strong>📍 In-Person Session:</strong> Please arrive on time for your appointment at the counseling office. 
                      If you need directions or have any questions, feel free to contact us.
                    </p>
                  `}

                  <div class="contact-info">
                    <h3 style="margin-top: 0;">📞 Need to Reschedule or Cancel?</h3>
                    <p>If you need to reschedule or cancel your appointment, please contact us as soon as possible:</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      <li><strong>Email:</strong> Counselling@ueab.ac.ke</li>
                      <li><strong>Counselor Loice:</strong> 0705571104</li>
                      <li><strong>Counselor Pr. Zachary:</strong> 0727416106</li>
                    </ul>
                  </div>

                  <p>We look forward to supporting you on your journey to wellness.</p>
                  <p>Best regards,<br><strong>UEAB Counseling Department</strong></p>
                </div>
                <div class="footer">
                  <p>© 2025 University of Eastern Africa, Baraton - Counseling & Psychological Services</p>
                  <p style="font-size: 11px; color: #999; margin-top: 5px;">This is an automated email. Please do not reply directly to this message.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }
    case 'counseling_cancellation':
      const cancelDate = new Date(`${data.appointment_date}T${data.appointment_time}`)
      const cancelFormattedDate = cancelDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      return {
        subject: 'Appointment Cancelled - Counseling Session',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: #ffeaea; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #e74c3c; }
                .info-box h3 { margin-top: 0; color: #e74c3c; }
                .info-box p { margin: 10px 0; }
                .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                .contact-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Appointment Cancelled</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">We're sorry to inform you</p>
                </div>
                <div class="content">
                  <p>Dear <strong>${data.student_name}</strong>,</p>
                  <p>We regret to inform you that your counseling appointment has been cancelled.</p>
                  
                  <div class="info-box">
                    <h3>📅 Cancelled Appointment Details</h3>
                    <p><strong>Date & Time:</strong> ${cancelFormattedDate}</p>
                    <p><strong>Reason:</strong> ${data.cancelled_reason || 'Not specified'}</p>
                  </div>

                  <p>If you would like to reschedule, please visit our booking page or contact us directly.</p>

                  <div class="contact-info">
                    <h3 style="margin-top: 0;">📞 Contact Us to Reschedule</h3>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      <li><strong>Email:</strong> Counselling@ueab.ac.ke</li>
                      <li><strong>Counselor Loice:</strong> 0705571104</li>
                      <li><strong>Counselor Pr. Zachary:</strong> 0727416106</li>
                    </ul>
                    <p style="margin-top: 15px;">
                      <a href="https://odel.ueab.ac.ke/counseling" class="button">Book New Appointment</a>
                    </p>
                  </div>

                  <p>We apologize for any inconvenience and hope to serve you in the future.</p>
                  <p>Best regards,<br><strong>UEAB Counseling Department</strong></p>
                </div>
                <div class="footer">
                  <p>© 2025 University of Eastern Africa, Baraton - Counseling & Psychological Services</p>
                </div>
              </div>
            </body>
          </html>
        `
      }
    case 'counseling_reschedule':
      const oldDate = new Date(`${data.old_appointment_date}T${data.old_appointment_time}`)
      const newDate = new Date(`${data.new_appointment_date}T${data.new_appointment_time}`)
      const oldFormattedDate = oldDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      const newFormattedDate = newDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      return {
        subject: 'Appointment Rescheduled - Counseling Session',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                .header { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: #fff4e6; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #f39c12; }
                .info-box h3 { margin-top: 0; color: #f39c12; }
                .info-box p { margin: 10px 0; }
                .old-date { background: #ffeaea; padding: 15px; border-radius: 8px; margin: 15px 0; }
                .new-date { background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
                .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                .contact-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📅 Appointment Rescheduled</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Your appointment has been moved</p>
                </div>
                <div class="content">
                  <p>Dear <strong>${data.student_name}</strong>,</p>
                  <p>Your counseling appointment has been rescheduled. Please see the new details below.</p>
                  
                  <div class="info-box">
                    <h3>📅 Appointment Change Details</h3>
                    <div class="old-date">
                      <p><strong>Previous Date & Time:</strong></p>
                      <p>${oldFormattedDate}</p>
                    </div>
                    <div class="new-date">
                      <p><strong>New Date & Time:</strong></p>
                      <p style="font-size: 18px; font-weight: bold; color: #3b82f6;">${newFormattedDate}</p>
                    </div>
                    ${data.reschedule_reason ? `
                      <p><strong>Reason:</strong> ${data.reschedule_reason}</p>
                    ` : ''}
                    <p><strong>Counselor:</strong> ${data.counselor_name || 'TBA'}</p>
                  </div>

                  <p style="background: #e8f4f8; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <strong>⚠️ Important:</strong> Your appointment status has been reset to pending. 
                    Your counselor will confirm the new appointment time shortly. You will receive another confirmation email once it's confirmed.
                  </p>

                  <div class="contact-info">
                    <h3 style="margin-top: 0;">📞 Need to Discuss the Change?</h3>
                    <p>If you have any questions or concerns about this reschedule, please contact us:</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                      <li><strong>Email:</strong> Counselling@ueab.ac.ke</li>
                      <li><strong>Counselor Loice:</strong> 0705571104</li>
                      <li><strong>Counselor Pr. Zachary:</strong> 0727416106</li>
                    </ul>
                  </div>

                  <p>We apologize for any inconvenience and look forward to meeting with you at the new time.</p>
                  <p>Best regards,<br><strong>UEAB Counseling Department</strong></p>
                </div>
                <div class="footer">
                  <p>© 2025 University of Eastern Africa, Baraton - Counseling & Psychological Services</p>
                  <p style="font-size: 11px; color: #999; margin-top: 5px;">This is an automated email. Please do not reply directly to this message.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }
    default:
      // If template is not found but html is provided, use it directly
      if (data.html && data.subject) {
        return { subject: data.subject, html: data.html }
      }
      return { subject: 'ODeL Notification', html: '<p>Notification</p>' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, data } = await request.json()

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: to (recipient email)' },
        { status: 400 }
      )
    }

    // If subject and html are provided directly (for custom emails), use them
    // Otherwise, use template system
    let emailContent: { subject: string; html: string }
    
    if (subject && data?.html) {
      // Direct HTML email
      emailContent = { subject, html: data.html }
    } else if (template) {
      // Template-based email
      emailContent = getEmailTemplate(template, { ...data, email: to })
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing required field: either template or subject+html' },
        { status: 400 }
      )
    }

    // Create email transporter
    const transporter = createTransporter()

    // Send email
    let info
    try {
      const fromEmail = process.env.EMAIL_FROM || 'noreply@ueab.ac.ke'
      const fromName = process.env.EMAIL_FROM_NAME || 'ODeL'
      info = await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html
      })
      console.log('📧 Email sent successfully via SMTP:', info.messageId)
    } catch (sendError) {
      console.error('📧 Email send error:', sendError.message)
      // Re-throw the error to trigger the fallback
      throw sendError
    }

    console.log('📧 Email sent successfully:', info.messageId)
    console.log('📧 To:', to)
    console.log('📧 Subject:', emailContent.subject)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
