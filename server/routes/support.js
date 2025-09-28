const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { generateSafaiAnswer } = require('../config/samba');

const router = express.Router();

// Create a transporter with environment-based config
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass },
    });
  }

  // Fallback: no SMTP configured; use JSON transport so requests still succeed in dev
  return nodemailer.createTransport({ jsonTransport: true });
}

// @desc   Send email to support
// @route  POST /api/support/email
// @access Public
router.post(
  '/email',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().isLength({ min: 3 }).withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;

      const transporter = createTransporter();
      const toAddress = process.env.SUPPORT_EMAIL_TO || 'support@pixelbin.app';
      const fromAddress = process.env.SUPPORT_EMAIL_FROM || 'no-reply@pixelbin.app';

      const info = await transporter.sendMail({
        from: fromAddress,
        to: toAddress,
        subject: `[Support] ${subject}`,
        replyTo: email,
        text: `Support request from ${name} <${email}>

Subject: ${subject}

Message:
${message}
`,
        html: `
          <p><strong>Support request from:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `,
      });

      const isJsonTransport = transporter.transporter && transporter.transporter.name === 'JSONTransport';

      return res.json({
        success: true,
        message: isJsonTransport
          ? 'Email simulated (no SMTP configured). Set SMTP_* env vars to send real emails.'
          : 'Email sent successfully',
        id: info.messageId || undefined,
      });
    } catch (error) {
      console.error('Support email error:', error);
      return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  }
);

module.exports = router;

// @desc   Safai Master guidance
// @route  POST /api/support/safai-master
// @access Public
router.post('/safai-master', async (req, res) => {
  try {
    const { question, context, faqData } = req.body || {};
    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const result = await generateSafaiAnswer({ question, context, faqData: Array.isArray(faqData) ? faqData : [] });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('Safai Master error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate guidance' });
  }
});




