import AIAnalysisLog from '../model/AIAnalysisLog.js';
import MedicalRecord from '../model/MedicalRecord.js';
import User from '../model/User.js';
import fs from 'fs';
import path from 'path';

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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Try each model name until one works ──────────────────────────────────────
async function analyzeWithGemini(apiKey, symptoms, medicalHistoryText = '', attachmentDataList = [], patientName = 'Patient') {
  const systemInstruction = `You are MediAI, an advanced medical assistant bot. You are assisting a patient named ${patientName}. You analyze patient symptoms and respond ONLY in strict JSON matching this structure exactly:
{
  "aiResponse": "A friendly, detailed analysis of the symptoms. You MUST explicitly state the suspected diseases or conditions based on the symptoms provided, along with general advice and safety warnings. Start by greeting the patient by their name. You can refer to the patient's medical history or uploaded documents to provide better context.",
  "predictedConditions": ["Condition 1", "Condition 2"],
  "recommendedSpecialist": "One doctor specialty (e.g. Cardiologist, Neurologist, General Practitioner, Dermatologist, Orthopedic, Pediatrician, Gynecologist)"
}

Patient's Medical History:
${medicalHistoryText || 'No medical history available.'}`;

  const messages = [
    {
      role: 'user',
      parts: [
        { text: systemInstruction },
        { text: `Analyze the following patient symptoms: "${symptoms}"` },
      ],
    },
  ];

  if (attachmentDataList && attachmentDataList.length > 0) {
    for (const attachment of attachmentDataList) {
      messages[0].parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64Data
        }
      });
    }
  }

  let lastError = null;
  const MAX_RETRIES = 3;

  for (const modelName of GEMINI_MODELS) {
    let attempt = 0;
    
    while (attempt <= MAX_RETRIES) {
      try {
        console.log(`Trying Gemini model: ${modelName} (Attempt ${attempt + 1})`);
        const text = await callGemini(apiKey, modelName, messages);
        if (!text) throw new Error('Empty response from model');
        const parsed = JSON.parse(text.trim());
        console.log(`✓ Gemini model "${modelName}" responded successfully.`);
        return parsed;
      } catch (err) {
        lastError = err;
        const errMsg = err.message || '';
        
        // If it's a 429 (Quota) or 503 (Overload), wait and retry
        if (errMsg.includes('429') || errMsg.includes('503')) {
          console.warn(`[${modelName}] Rate limit / Overload (429/503). Retrying in ${Math.pow(2, attempt)}s...`);
          await sleep(Math.pow(2, attempt) * 1000);
          attempt++;
        } else {
          // If it's a 404 or other error, break the retry loop and try the next model
          console.warn(`✗ Model "${modelName}" failed: ${errMsg.slice(0, 120)}`);
          break;
        }
      }
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
    const user = await User.findById(patientId);
    const patientName = user ? user.name : 'Patient';

    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms description is required' });
    }

    const apiKey = process.env.Gemini_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API Key is missing on the server' });
    }

    // Try all available Gemini models until one succeeds
    const context = await fetchPatientContext(patientId);
    const parsedData = await analyzeWithGemini(apiKey, symptoms, context.formattedRecords, context.attachmentDataList, patientName);

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

// @desc    Clear patient's symptom analysis history
// @route   DELETE /api/ai/history
// @access  Private
export const clearAIHistory = async (req, res) => {
  try {
    const patientId = req.user.id;
    await AIAnalysisLog.deleteMany({ patient: patientId });

    res.status(200).json({
      success: true,
      message: 'AI chat history cleared successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

async function chatWithGemini(apiKey, message, medicalHistoryText, attachmentDataList = [], patientName = 'Patient') {
  const systemInstruction = `You are MediAI, an advanced medical assistant bot. A patient named ${patientName} is asking you a question about their medical reports. Use their provided medical history and any attached documents to answer accurately, safely, and politely. Start by greeting the patient by their name if appropriate. DO NOT provide a JSON response. Respond in plain conversational text or markdown. If their question is unrelated to medical context, answer it briefly but remind them you are a medical assistant.

Patient's Medical History:
${medicalHistoryText || 'No medical history available.'}`;

  const messages = [
    {
      role: 'user',
      parts: [
        { text: systemInstruction },
        { text: `Patient Question: "${message}"` },
      ],
    },
  ];

  // Append multimodal attachments if present
  if (attachmentDataList && attachmentDataList.length > 0) {
    for (const attachment of attachmentDataList) {
      messages[0].parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64Data
        }
      });
    }
  }

  let lastError = null;
  const MAX_RETRIES = 3;

  for (const modelName of GEMINI_MODELS) {
    let attempt = 0;
    while (attempt <= MAX_RETRIES) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const body = {
          contents: messages,
          // Removed responseMimeType to allow plain text/markdown
        };
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`[${response.status}] ${errText}`);
        }
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiText) throw new Error('Empty response from model');
        return aiText;
      } catch (err) {
        lastError = err;
        const errMsg = err.message || '';
        if (errMsg.includes('429') || errMsg.includes('503')) {
          await sleep(Math.pow(2, attempt) * 1000);
          attempt++;
        } else {
          break;
        }
      }
    }
  }
  throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
}

async function fetchPatientContext(patientId) {
  const records = await MedicalRecord.find({ patient: patientId }).sort({ date: -1 }).limit(10);
    
  let formattedRecords = '';
  const attachmentDataList = [];

  if (records.length > 0) {
    formattedRecords = records.map((r, i) => {
      let details = `Report ${i + 1}:\n- Title: ${r.title}\n- Date: ${new Date(r.date || r.createdAt).toLocaleDateString()}\n- Type: ${r.category || r.type}\n`;
      if (r.hospital) details += `- Hospital/Lab: ${r.hospital}\n`;
      if (r.doctor) details += `- Doctor: ${r.doctor}\n`;
      if (r.doctorNotes) details += `- Notes: ${r.doctorNotes}\n`;
      if (r.values && Object.keys(r.values).length > 0) {
        details += `- Values: ${JSON.stringify(r.values)}\n`;
      }
      
      if (i < 3 && r.attachments && r.attachments.length > 0) {
        for (const attachmentPath of r.attachments) {
          try {
            const fullPath = path.join(process.cwd(), attachmentPath);
            if (fs.existsSync(fullPath)) {
              const fileBuffer = fs.readFileSync(fullPath);
              const base64Data = fileBuffer.toString('base64');
              
              const ext = path.extname(fullPath).toLowerCase();
              let mimeType = 'image/jpeg';
              if (ext === '.pdf') mimeType = 'application/pdf';
              else if (ext === '.png') mimeType = 'image/png';
              else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

              attachmentDataList.push({ base64Data, mimeType });
            }
          } catch (err) {
            console.error(`Failed to load attachment ${attachmentPath}:`, err.message);
          }
        }
      }
      
      return details;
    }).join('\n');
  }

  return { formattedRecords, attachmentDataList };
}

export const analyzeReports = async (req, res) => {
  try {
    const { message } = req.body;
    const patientId = req.user.id;
    const user = await User.findById(patientId);
    const patientName = user ? user.name : 'Patient';

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.Gemini_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API Key is missing on the server' });
    }

    const context = await fetchPatientContext(patientId);
    
    const aiResponse = await chatWithGemini(apiKey, message, context.formattedRecords, context.attachmentDataList, patientName);

    res.status(200).json({ success: true, data: { reply: aiResponse } });
  } catch (error) {
    console.error('Gemini Chat Error:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

