import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

// Generic Luxury 5Star Email Template Wrapper
const wrapTemplate = (title, contentHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background-color: #0b0b0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e5e7eb; }
    .wrapper { max-width: 600px; margin: 30px auto; background-color: #16161a; border: 1px solid #2d2922; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #1f1b13 0%, #11100e 100%); padding: 36px 30px; text-align: center; border-bottom: 2px solid #d4af37; }
    .logo-badge { font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #d4af37; text-transform: uppercase; margin: 0; }
    .subtitle { color: #a3a3a3; font-size: 13px; letter-spacing: 3px; margin-top: 6px; text-transform: uppercase; }
    .body-content { padding: 32px 30px; line-height: 1.6; }
    .h1-gold { color: #f5e6c8; font-size: 20px; margin-top: 0; margin-bottom: 16px; font-weight: 700; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #0f0f12; border-radius: 8px; border: 1px solid #26262b; }
    .details-table td { padding: 12px 16px; border-bottom: 1px solid #1f1f24; font-size: 14px; }
    .details-table td.label { color: #9ca3af; width: 40%; font-weight: 600; }
    .details-table td.val { color: #f3f4f6; font-weight: 500; }
    .otp-code { display: inline-block; padding: 14px 28px; background: #1f1b13; border: 2px dashed #d4af37; color: #f7df94; font-size: 32px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .footer { background: #0e0e11; padding: 24px 30px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #222226; }
    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #d4af37 0%, #aa820a 100%); color: #0b0b0d; font-weight: 700; text-decoration: none; border-radius: 6px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">★ 5STAR CINEMATOGRAPHY ★</div>
      <div class="subtitle">Every Moment, A Timeless Story</div>
    </div>
    <div class="body-content">
      <h2 class="h1-gold">${title}</h2>
      ${contentHtml}
    </div>
    <div class="footer">
      <p>5Star Cinematography Studio • Luxury Photography & Films</p>
      <p>Need assistance? Contact us at support@5starcinematography.com or call +91 98765 43210</p>
      <p>&copy; ${new Date().getFullYear()} 5Star Cinematography. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendMailSafe = async ({ to, subject, html }) => {
  try {
    const transport = getTransporter();
    if (!transport) {
      console.warn(`[SMTP Warning] SMTP credentials not set in .env. Email to "${to}" with subject "${subject}" was logged rather than sent.`);
      return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"5Star Cinematography" <contact@5starcinematography.com>',
      to,
      subject,
      html
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`[SMTP Success] Email sent to ${to} (MessageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP Error] Failed sending email to ${to}:`, error.message);
    return { sent: false, error: error.message };
  }
};

/**
 * Send Booking Submission Confirmation to Customer
 */
export const sendBookingCustomerConfirmation = async (booking) => {
  const formattedDate = new Date(booking.eventDetails.eventDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <p>Dear <strong>${booking.customerDetails.fullName}</strong>,</p>
    <p>Thank you for choosing <strong>5Star Cinematography</strong> to capture your special occasion. We have received your booking inquiry and our production director is reviewing the schedule.</p>
    
    <table class="details-table">
      <tr><td class="label">Booking Reference:</td><td class="val"><strong style="color: #d4af37;">${booking.bookingReference}</strong></td></tr>
      <tr><td class="label">Event Category:</td><td class="val">${booking.eventDetails.eventType}</td></tr>
      <tr><td class="label">Event Date:</td><td class="val">${formattedDate}</td></tr>
      <tr><td class="label">Event Timing:</td><td class="val">${booking.eventDetails.startTime} ${booking.eventDetails.endTime ? 'to ' + booking.eventDetails.endTime : ''}</td></tr>
      <tr><td class="label">Venue Location:</td><td class="val">${booking.eventDetails.venueName}, ${booking.eventDetails.fullAddress}</td></tr>
      <tr><td class="label">Selected Package:</td><td class="val">${booking.packageSnapshot.name}</td></tr>
      <tr><td class="label">Estimated Price:</td><td class="val">₹${booking.totalQuotedPrice.toLocaleString('en-IN')}</td></tr>
      <tr><td class="label">Initial Status:</td><td class="val"><span style="color: #eab308; font-weight: bold;">${booking.bookingStatus}</span></td></tr>
    </table>

    <p>Our team will contact you shortly via <strong>${booking.eventDetails.preferredContact}</strong> at <strong>${booking.customerDetails.primaryMobile}</strong> to discuss venue logistics and finalize confirmation.</p>
    <p>You can track the progress of your booking anytime by logging into your customer dashboard.</p>
  `;

  return await sendMailSafe({
    to: booking.customerDetails.email,
    subject: `Booking Received [${booking.bookingReference}] - 5Star Cinematography`,
    html: wrapTemplate('Booking Confirmation Request', content)
  });
};

/**
 * Send Booking Alert to Studio Admin
 */
export const sendBookingAdminNotification = async (booking) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_INITIAL_EMAIL || 'admin@5starcinematography.com';
  const formattedDate = new Date(booking.eventDetails.eventDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const content = `
    <p>A new event booking inquiry has been submitted by a client:</p>
    
    <table class="details-table">
      <tr><td class="label">Booking Ref:</td><td class="val"><strong style="color: #d4af37;">${booking.bookingReference}</strong></td></tr>
      <tr><td class="label">Client Name:</td><td class="val">${booking.customerDetails.fullName}</td></tr>
      <tr><td class="label">Client Phone:</td><td class="val">${booking.customerDetails.primaryMobile}</td></tr>
      <tr><td class="label">Client Email:</td><td class="val">${booking.customerDetails.email}</td></tr>
      <tr><td class="label">Event Type & Date:</td><td class="val">${booking.eventDetails.eventType} on ${formattedDate}</td></tr>
      <tr><td class="label">Venue:</td><td class="val">${booking.eventDetails.venueName} (${booking.customerDetails.city})</td></tr>
      <tr><td class="label">Package:</td><td class="val">${booking.packageSnapshot.name} (₹${booking.totalQuotedPrice.toLocaleString('en-IN')})</td></tr>
      <tr><td class="label">Notes / Requests:</td><td class="val">${booking.eventDetails.specialRequirements || 'None'}</td></tr>
    </table>

    <p>Please log in to the 5Star Admin Dashboard to review the calendar, check availability, and update the booking status.</p>
  `;

  return await sendMailSafe({
    to: adminEmail,
    subject: `🚨 New Booking Request: ${booking.bookingReference} - ${booking.customerDetails.fullName}`,
    html: wrapTemplate('New Event Booking Alert', content)
  });
};

/**
 * Send Booking Status Change Notification to Customer
 */
export const sendBookingStatusUpdate = async (booking) => {
  const content = `
    <p>Dear <strong>${booking.customerDetails.fullName}</strong>,</p>
    <p>There is an update on your event booking with <strong>5Star Cinematography</strong>:</p>

    <table class="details-table">
      <tr><td class="label">Booking Reference:</td><td class="val"><strong>${booking.bookingReference}</strong></td></tr>
      <tr><td class="label">Event:</td><td class="val">${booking.eventDetails.eventType}</td></tr>
      <tr><td class="label">Updated Status:</td><td class="val"><strong style="color: #d4af37; font-size: 16px;">${booking.bookingStatus.toUpperCase()}</strong></td></tr>
    </table>

    <p>If you have any questions or wish to discuss changes, please feel free to reach out to our studio coordinator directly.</p>
  `;

  return await sendMailSafe({
    to: booking.customerDetails.email,
    subject: `Booking Status Update [${booking.bookingReference}]: ${booking.bookingStatus}`,
    html: wrapTemplate('Booking Status Update', content)
  });
};

/**
 * Send 5-minute Password Reset OTP to User
 */
export const sendPasswordResetOTP = async (email, otp) => {
  const content = `
    <p>We received a request to reset the password for your 5Star Cinematography customer account.</p>
    <p>Use the following verification code to proceed. This code is strictly time-limited and <strong>valid for 5 minutes only</strong>:</p>
    
    <div style="text-align: center;">
      <div class="otp-code">${otp}</div>
    </div>

    <p style="color: #9ca3af; font-size: 13px;">If you did not make this request, please ignore this email. Your account password remains unchanged.</p>
  `;

  return await sendMailSafe({
    to: email,
    subject: `Password Reset Verification Code - 5Star Cinematography`,
    html: wrapTemplate('Password Reset Request', content)
  });
};

/**
 * Send Contact Form Enquiry Alert to Admin
 */
export const sendContactEnquiryAlert = async (enquiry) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_INITIAL_EMAIL || 'admin@5starcinematography.com';

  const content = `
    <p>A new contact enquiry has been submitted through the 5Star Cinematography website:</p>

    <table class="details-table">
      <tr><td class="label">Name:</td><td class="val">${enquiry.name}</td></tr>
      <tr><td class="label">Email:</td><td class="val">${enquiry.email}</td></tr>
      <tr><td class="label">Phone:</td><td class="val">${enquiry.mobile}</td></tr>
      <tr><td class="label">Subject:</td><td class="val">${enquiry.subject}</td></tr>
      <tr><td class="label">Message:</td><td class="val">${enquiry.message}</td></tr>
    </table>
  `;

  return await sendMailSafe({
    to: adminEmail,
    subject: `📬 New Website Enquiry: ${enquiry.subject} (${enquiry.name})`,
    html: wrapTemplate('New Contact Message', content)
  });
};
