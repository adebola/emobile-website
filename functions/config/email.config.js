const brevo = require('@getbrevo/brevo');
const functions = require('firebase-functions');

// Get config from Firebase (or fallback to process.env for local testing)
const config = functions.config();
const BREVO_API_KEY = config.brevo?.api_key || process.env.BREVO_API_KEY;
const SENDER_EMAIL = config.email?.sender || process.env.SENDER_EMAIL;
const HOSPITAL_EMAIL = config.email?.hospital || process.env.HOSPITAL_EMAIL;

// Initialize Brevo API client
let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  BREVO_API_KEY
);

async function sendContactEmail(data, submissionId) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: "Emobile Hospital Website",
    email: SENDER_EMAIL
  };
  sendSmtpEmail.to = [{
    email: HOSPITAL_EMAIL,
    name: "Hospital Staff"
  }];
  sendSmtpEmail.subject = `New Contact Form Submission: ${data.subject}`;
  sendSmtpEmail.htmlContent = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Submission ID:</strong> ${submissionId}</p>
    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Subject:</strong> ${data.subject}</p>
    <p><strong>Service Interested:</strong> ${data.service || 'Not specified'}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message}</p>
    <hr>
    <p><small>Submitted from Emobile Hospital Website</small></p>
  `;

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Contact email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Brevo email error:', error);
    throw error;
  }
}

async function sendAppointmentEmail(data, appointmentId) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: "Emobile Hospital Website",
    email: SENDER_EMAIL
  };
  sendSmtpEmail.to = [{
    email: HOSPITAL_EMAIL,
    name: "Hospital Staff"
  }];
  sendSmtpEmail.subject = `New Appointment Request: ${data.firstName} ${data.lastName}`;
  sendSmtpEmail.htmlContent = `
    <h2>New Appointment Booking Request</h2>
    <p><strong>Appointment ID:</strong> ${appointmentId}</p>
    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Date of Birth:</strong> ${data.dateOfBirth || 'Not provided'}</p>
    <p><strong>Service Required:</strong> ${data.service}</p>
    <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
    <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
    <p><strong>Additional Information:</strong></p>
    <p>${data.additionalInfo || 'None provided'}</p>
    <hr>
    <p><strong>Action Required:</strong> Please contact the patient to confirm the appointment.</p>
    <p><small>Submitted from Emobile Hospital Website</small></p>
  `;

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Appointment email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Brevo email error:', error);
    throw error;
  }
}

async function sendBlogSubmissionEmail(data, submissionId) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: "Emobile Hospital Website",
    email: SENDER_EMAIL
  };
  sendSmtpEmail.to = [{
    email: HOSPITAL_EMAIL,
    name: "Hospital Staff"
  }];
  sendSmtpEmail.subject = `New Blog Post Submission: ${data.title}`;
  sendSmtpEmail.htmlContent = `
    <h2>New Blog Post Submission for Review</h2>
    <p><strong>Submission ID:</strong> ${submissionId}</p>
    <hr>
    <h3>Author Information</h3>
    <p><strong>Name:</strong> ${data.authorName}</p>
    <p><strong>Email:</strong> ${data.authorEmail}</p>
    <hr>
    <h3>Post Details</h3>
    <p><strong>Title:</strong> ${data.title}</p>
    <p><strong>Category:</strong> ${data.category}</p>
    <p><strong>Excerpt:</strong></p>
    <p>${data.excerpt}</p>
    ${data.image ? `<p><strong>Image URL:</strong> ${data.image}</p>` : ''}
    <hr>
    <p><strong>Content Preview (first 500 chars):</strong></p>
    <p>${data.content.substring(0, 500)}${data.content.length > 500 ? '...' : ''}</p>
    <hr>
    <p><strong>Action Required:</strong> Please review this submission in the blog admin panel.</p>
    <p><a href="https://www.emobilespecialisthospital.health/blog-admin.html" style="display: inline-block; padding: 12px 24px; background: #00A3E0; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px;">Review Submission</a></p>
    <p><small>Submitted from Emobile Hospital Website</small></p>
  `;

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Blog submission email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Brevo email error:', error);
    throw error;
  }
}

module.exports = { sendContactEmail, sendAppointmentEmail, sendBlogSubmissionEmail };
