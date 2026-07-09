import AIAnalysisLog from '../model/AIAnalysisLog.js';

// ── Current Gemini model names to try in order (most recent first) ────────────
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro',
];

// ── Call Gemini REST API directly (avoids SDK model-name caching issues) ──────
async function callGemini(apiKey, modelName, messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const body = {
    contents: messages,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[${response.status} ${response.statusText}] ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// ── Try each model name until one works ──────────────────────────────────────
async function analyzeWithGemini(apiKey, symptoms) {
  const systemInstruction = `You are MediAI, an advanced medical assistant bot. You analyze patient symptoms and respond ONLY in strict JSON matching this structure exactly:
{
  "aiResponse": "A friendly, detailed analysis of the symptoms including general advice and safety warnings.",
  "predictedConditions": ["Condition 1", "Condition 2"],
  "recommendedSpecialist": "One doctor specialty (e.g. Cardiologist, Neurologist, General Practitioner, Dermatologist, Orthopedic, Pediatrician, Gynecologist)"
}`;

  const messages = [
    {
      role: 'user',
      parts: [
        { text: systemInstruction },
        { text: `Analyze the following patient symptoms: "${symptoms}"` },
      ],
    },
  ];

  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);
      const text = await callGemini(apiKey, modelName, messages);
      if (!text) throw new Error('Empty response from model');
      const parsed = JSON.parse(text.trim());
      console.log(`✓ Gemini model "${modelName}" responded successfully.`);
      return parsed;
    } catch (err) {
      console.warn(`✗ Model "${modelName}" failed: ${err.message.slice(0, 120)}`);
      lastError = err;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
}

// @desc    Analyze symptoms using Gemini AI and log the analysis
// @route   POST /api/ai/analyze
// @access  Private
export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const patientId = req.user.id;

    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms description is required' });
    }

    const apiKey = process.env.Gemini_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API Key is missing on the server' });
    }

    // Try all available Gemini models until one succeeds
    const parsedData = await analyzeWithGemini(apiKey, symptoms);

    // Save the successful analysis to DB
    const log = await AIAnalysisLog.create({
      patient: patientId,
      symptomsProvided: symptoms,
      aiResponse: parsedData.aiResponse,
      predictedConditions: parsedData.predictedConditions || [],
      recommendedSpecialist: parsedData.recommendedSpecialist || 'General Practitioner',
    });

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    console.error('Gemini AI Integration Error:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get patient's symptom analysis history
// @route   GET /api/ai/history
// @access  Private
export const getAIHistory = async (req, res) => {
  try {
    const patientId = req.user.id;

    const logs = await AIAnalysisLog.find({ patient: patientId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
