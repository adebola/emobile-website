const brevo = require('@getbrevo/brevo');

// Initialize Brevo API client
let apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

async function sendContactEmail(data, submissionId) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: "Emobile Hospital Website",
    email: process.env.SENDER_EMAIL
  };
  sendSmtpEmail.to = [{
    email: process.env.HOSPITAL_EMAIL,
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
    email: process.env.SENDER_EMAIL
  };
  sendSmtpEmail.to = [{
    email: process.env.HOSPITAL_EMAIL,
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

module.exports = { sendContactEmail, sendAppointmentEmail };
