const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const Joi = require('joi');
const { sendContactEmail, sendAppointmentEmail, sendBlogSubmissionEmail } = require('./config/email.config');
const { verifyAuth } = require('./config/auth.middleware');

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

const blogPostSchema = Joi.object({
  title: Joi.string().required().max(200),
  excerpt: Joi.string().required().max(500),
  content: Joi.string().required().max(50000),
  category: Joi.string().required().max(100),
  image: Joi.string().optional().allow('').max(500),
  date: Joi.date().required(),
  published: Joi.boolean().default(false)
});

const blogPostUpdateSchema = Joi.object({
  postId: Joi.string().required(),
  title: Joi.string().optional().max(200),
  excerpt: Joi.string().optional().max(500),
  content: Joi.string().optional().max(50000),
  category: Joi.string().optional().max(100),
  image: Joi.string().optional().allow('').max(500),
  date: Joi.date().optional(),
  published: Joi.boolean().optional()
});

const blogSubmissionSchema = Joi.object({
  title: Joi.string().required().max(200),
  excerpt: Joi.string().required().max(500),
  content: Joi.string().required().max(50000),
  category: Joi.string().required().max(100),
  image: Joi.string().optional().allow('').max(500),
  authorName: Joi.string().required().max(100),
  authorEmail: Joi.string().email().required()
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

// ============================================================================
// BLOG CMS FUNCTIONS
// ============================================================================

// Create Blog Post (Protected)
exports.createBlogPost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Verify authentication
      const decoded = await verifyAuth(req);

      // Validate input
      const { error, value } = blogPostSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Create post in Firestore
      const docRef = await db.collection('blog_posts').add({
        ...value,
        date: admin.firestore.Timestamp.fromDate(new Date(value.date)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: decoded.email
      });

      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        postId: docRef.id
      });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  });
});

// Update Blog Post (Protected)
exports.updateBlogPost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await verifyAuth(req);

      const { error, value } = blogPostUpdateSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { postId, ...updates } = value;

      // Convert date if provided
      if (updates.date) {
        updates.date = admin.firestore.Timestamp.fromDate(new Date(updates.date));
      }

      await db.collection('blog_posts').doc(postId).update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({
        success: true,
        message: 'Blog post updated successfully'
      });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Failed to update blog post' });
    }
  });
});

// Delete Blog Post (Protected)
exports.deleteBlogPost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await verifyAuth(req);

      const postId = req.body.postId || req.query.postId;
      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
      }

      await db.collection('blog_posts').doc(postId).delete();

      res.json({
        success: true,
        message: 'Blog post deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  });
});

// Get Blog Posts (Public - published only)
exports.getBlogPosts = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const limit = parseInt(req.query.limit) || 20;

      const snapshot = await db.collection('blog_posts')
        .where('published', '==', true)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();

      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toISOString()
      }));

      res.json(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });
});

// Get Single Blog Post (Public)
exports.getBlogPost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const postId = req.query.id;
      if (!postId) {
        return res.status(400).json({ error: 'Post ID is required' });
      }

      const doc = await db.collection('blog_posts').doc(postId).get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const post = {
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toISOString()
      };

      // Only return published posts for public access
      if (!post.published) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  });
});

// Get All Blog Posts for Admin (Protected - includes unpublished)
exports.getAdminBlogPosts = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await verifyAuth(req);

      const snapshot = await db.collection('blog_posts')
        .orderBy('updatedAt', 'desc')
        .get();

      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate().toISOString(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      }));

      res.json(posts);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error fetching admin blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });
});

// ============================================================================
// BLOG SUBMISSION FUNCTIONS (Public Submissions)
// ============================================================================

// Submit Blog Post for Review (Public)
exports.submitBlogPost = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Validate input
      const { error, value } = blogSubmissionSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Save to Firestore
      const docRef = await db.collection('blog_post_submissions').add({
        ...value,
        status: 'pending',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: req.ip,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null
      });

      // Send email notification to admin
      await sendBlogSubmissionEmail(value, docRef.id);

      res.status(200).json({
        success: true,
        message: 'Thank you for your submission! Our team will review it within 48 hours.',
        submissionId: docRef.id
      });
    } catch (error) {
      console.error('Blog submission error:', error);
      res.status(500).json({
        error: 'Failed to submit your post. Please try again.'
      });
    }
  });
});

// Get Pending Submissions (Protected)
exports.getPendingSubmissions = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      await verifyAuth(req);

      const snapshot = await db.collection('blog_post_submissions')
        .orderBy('submittedAt', 'desc')
        .get();

      const submissions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate().toISOString()
      }));

      res.json(submissions);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  });
});

// Approve Submission (Protected)
exports.approveSubmission = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const decoded = await verifyAuth(req);
      const { submissionId } = req.body;

      if (!submissionId) {
        return res.status(400).json({ error: 'Submission ID is required' });
      }

      // Get submission
      const submissionDoc = await db.collection('blog_post_submissions').doc(submissionId).get();

      if (!submissionDoc.exists) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      const submission = submissionDoc.data();

      // Create published blog post
      await db.collection('blog_posts').add({
        title: submission.title,
        excerpt: submission.excerpt,
        content: submission.content,
        category: submission.category,
        image: submission.image || '',
        date: admin.firestore.Timestamp.now(),
        published: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: decoded.email,
        submittedBy: submission.authorEmail,
        authorName: submission.authorName
      });

      // Update submission status
      await db.collection('blog_post_submissions').doc(submissionId).update({
        status: 'approved',
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: decoded.email
      });

      res.json({
        success: true,
        message: 'Submission approved and published successfully'
      });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error approving submission:', error);
      res.status(500).json({ error: 'Failed to approve submission' });
    }
  });
});

// Reject Submission (Protected)
exports.rejectSubmission = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const decoded = await verifyAuth(req);
      const { submissionId, reason } = req.body;

      if (!submissionId) {
        return res.status(400).json({ error: 'Submission ID is required' });
      }

      await db.collection('blog_post_submissions').doc(submissionId).update({
        status: 'rejected',
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: decoded.email,
        rejectionReason: reason || 'Not specified'
      });

      res.json({
        success: true,
        message: 'Submission rejected successfully'
      });
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error rejecting submission:', error);
      res.status(500).json({ error: 'Failed to reject submission' });
    }
  });
});
