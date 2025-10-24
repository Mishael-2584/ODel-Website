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
    default:
      return { subject: 'ODeL Notification', html: '<p>Notification</p>' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, data } = await request.json()

    if (!to || !template) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get email template
    const emailContent = getEmailTemplate(template, { ...data, email: to })

    // Create email transporter
    const transporter = createTransporter()

    // Send email
    let info
    try {
      info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@ueab.ac.ke',
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
