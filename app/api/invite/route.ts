import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { to, name, inviterName, role } = await req.json();

        // Validate required fields
        if (!to || !name || !inviterName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Configure SMTP transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email content
        const mailOptions = {
            from: process.env.SMTP_FROM || `"TaskMaster" <${process.env.SMTP_USER}>`,
            to: to,
            subject: `You've been invited to join TaskMaster!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #059669; margin-bottom: 24px;">TaskMaster Invitation</h2>
                    <p style="font-size: 16px; color: #334155; line-height: 1.5;">
                        Hello <strong>${name}</strong>,
                    </p>
                    <p style="font-size: 16px; color: #334155; line-height: 1.5;">
                        <strong>${inviterName}</strong> has invited you to collaborate on their tasks in TaskMaster as a <strong>${role}</strong>.
                    </p>
                    <div style="margin: 32px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                            Join Team
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">
                        If you didn't expect this invitation, you can ignore this email.
                    </p>
                </div>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Invitation email sent successfully' });

    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        );
    }
}
