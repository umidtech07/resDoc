const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit to 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  }
});

// ✅ Endpoint to analyze raw resume text
app.post('/analyze', async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ error: 'No resume text provided' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You're a professional resume reviewer.
Provide feedback on the following resume using ✅ for strengths and ⚠️ for weaknesses.

Resume:
${resumeText}
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();

    res.json({ feedback });
  } catch (error) {
    console.error('❌ Gemini error:', error.message);
    res.status(500).json({ error: 'Gemini API failed' });
  }
});

// ✅ New endpoint to analyze uploaded PDF resume
app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const parsed = await pdfParse(req.file.buffer);
    const resumeText = parsed.text;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You're a professional resume reviewer.
Provide feedback on the following resume using ✅ for strengths and ⚠️ for weaknesses.

Resume:
${resumeText}
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();

    res.json({ feedback });
  } catch (error) {
    console.error('❌ PDF Upload error:', error.message);
    res.status(500).json({ error: 'Failed to analyze uploaded resume.' });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
