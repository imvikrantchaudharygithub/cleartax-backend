import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

export const initializeEmailService = (): void => {
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('✅ Email service initialized');
  } else {
    console.warn('⚠️  Email credentials not found. Email notifications will be disabled.');
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!transporter) {
    console.warn('Email service not configured. Skipping email send.');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendInquiryNotification = async (
  inquiryData: {
    name: string;
    email: string;
    phone: string;
    message: string;
    type: string;
  }
): Promise<void> => {
  const html = `
    <h2>New Inquiry Received</h2>
    <p><strong>Name:</strong> ${inquiryData.name}</p>
    <p><strong>Email:</strong> ${inquiryData.email}</p>
    <p><strong>Phone:</strong> ${inquiryData.phone}</p>
    <p><strong>Type:</strong> ${inquiryData.type}</p>
    <p><strong>Message:</strong></p>
    <p>${inquiryData.message}</p>
  `;

  await sendEmail({
    to: process.env.EMAIL_USER || '',
    subject: `New ${inquiryData.type} Inquiry from ${inquiryData.name}`,
    html,
  });
};

