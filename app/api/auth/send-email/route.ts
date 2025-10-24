import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// SMTP Configuration for Local Postfix
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '25'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false // For self-signed certificates
    }
  }

  // Add authentication only if credentials are provided
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    config.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }

  return nodemailer.createTransporter(config)
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

    // Create SMTP transporter
    const transporter = createTransporter()

    // Send email via SMTP
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@yourdomain.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    })

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
