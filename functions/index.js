const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const Joi = require('joi');
const { sendContactEmail, sendAppointmentEmail } = require('./config/email.config');

admin.initializeApp();
const db = admin.firestore();

// Validation schemas
const contactSchema = Joi.object({
  firstName: Joi.string().required().max(50),
  lastName: Joi.string().required().max(50),
  email: Joi.string().email().required(),
  phone: Joi.string().required().max(20),
  subject: Joi.string().required().max(200),
  service: Joi.string().optional().max(100),
  message: Joi.string().required().max(2000)
});

const appointmentSchema = Joi.object({
  firstName: Joi.string().required().max(50),
  lastName: Joi.string().required().max(50),
  email: Joi.string().email().required(),
  phone: Joi.string().required().max(20),
  dateOfBirth: Joi.string().optional(),
  service: Joi.string().required().max(100),
  preferredDate: Joi.string().required(),
  preferredTime: Joi.string().required(),
  additionalInfo: Joi.string().optional().max(1000)
});

const newsletterSchema = Joi.object({
  email: Joi.string().email().required()
});

// Contact Form Handler
exports.submitContactForm = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Validate input
      const { error, value } = contactSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Save to Firestore
      const docRef = await db.collection('contact_submissions').add({
        ...value,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new',
        ipAddress: req.ip
      });

      // Send email notification
      await sendContactEmail(value, docRef.id);

      res.status(200).json({
        success: true,
        message: 'Thank you for contacting us! We will get back to you within 24 hours.',
        submissionId: docRef.id
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        error: 'Failed to process your request. Please try again.'
      });
    }
  });
});

// Appointment Booking Handler
exports.submitAppointment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Validate input
      const { error, value } = appointmentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check for duplicate appointments (same email + date + time)
      const duplicateCheck = await db.collection('appointment_bookings')
        .where('email', '==', value.email)
        .where('preferredDate', '==', value.preferredDate)
        .where('preferredTime', '==', value.preferredTime)
        .get();

      if (!duplicateCheck.empty) {
        return res.status(409).json({
          error: 'You already have an appointment request for this date and time.'
        });
      }

      // Save to Firestore
      const docRef = await db.collection('appointment_bookings').add({
        ...value,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        confirmed: false,
        ipAddress: req.ip
      });

      // Send email notification
      await sendAppointmentEmail(value, docRef.id);

      res.status(200).json({
        success: true,
        message: 'Thank you for your appointment request! Our team will contact you within 24 hours to confirm.',
        appointmentId: docRef.id
      });
    } catch (error) {
      console.error('Appointment form error:', error);
      res.status(500).json({
        error: 'Failed to process your appointment request. Please try again.'
      });
    }
  });
});

// Newsletter Subscription Handler
exports.subscribeNewsletter = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Validate input
      const { error, value } = newsletterSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if already subscribed
      const existingSubscriber = await db.collection('newsletter_subscribers')
        .where('email', '==', value.email)
        .get();

      if (!existingSubscriber.empty) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter!'
        });
      }

      // Save to Firestore
      await db.collection('newsletter_subscribers').add({
        email: value.email,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        subscribed: true,
        ipAddress: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Thank you for subscribing! We will send you updates on fertility and reproductive health.'
      });
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({
        error: 'Failed to subscribe. Please try again.'
      });
    }
  });
});
