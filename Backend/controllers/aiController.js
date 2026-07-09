import AIAnalysisLog from '../model/AIAnalysisLog.js';

// @desc    Analyze symptoms using AI rule-engine and log the analysis
// @route   POST /api/ai/analyze
// @access  Private
export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;
    const patientId = req.user.id;

    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms description is required' });
    }

    const lowerSymptoms = symptoms.toLowerCase();
    let aiResponse = '';
    let predictedConditions = [];
    let recommendedSpecialist = 'General Practitioner';

    // Simple rule-based medical parsing engine
    if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('temperature') || lowerSymptoms.includes('flu')) {
      aiResponse = "A fever can indicate an infection. Stay hydrated, rest, and monitor your temperature. If the fever exceeds 103°F / 39.4°C or lasts more than 3 days, please consult a doctor.";
      predictedConditions = ['Viral Fever', 'Influenza', 'Systemic Infection'];
      recommendedSpecialist = 'General Practitioner';
    } else if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('heart') || lowerSymptoms.includes('breathing')) {
      aiResponse = "Chest pain or breathing difficulty should never be ignored. It could range from muscle strain to a serious cardiovascular issue. If severe, accompanied by shortness of breath or radiating pain, seek emergency services immediately.";
      predictedConditions = ['Angina', 'Cardiovascular Strain', 'Asthma/Bronchitis'];
      recommendedSpecialist = 'Cardiologist';
    } else if (lowerSymptoms.includes('head') || lowerSymptoms.includes('migraine') || lowerSymptoms.includes('dizzy')) {
      aiResponse = "Headaches lasting more than a couple of days or accompanied by dizziness may be tension headaches or migraines. Ensure you are well-hydrated, rested, and reduce screen time.";
      predictedConditions = ['Migraine', 'Tension Headache', 'Dehydration-induced Headache'];
      recommendedSpecialist = 'Neurologist';
    } else if (lowerSymptoms.includes('stomach') || lowerSymptoms.includes('nausea') || lowerSymptoms.includes('vomit') || lowerSymptoms.includes('belly')) {
      aiResponse = "Stomach pain or nausea can stem from dietary issues, gastritis, or infections. Stay hydrated and eat bland foods. If pain is severe or localized to the lower right abdomen, consult a doctor promptly.";
      predictedConditions = ['Gastritis', 'Gastroenteritis', 'Acid Reflux'];
      recommendedSpecialist = 'Gastroenterologist';
    } else {
      aiResponse = "Thank you for sharing your symptoms. Based on your description, I recommend monitoring your symptoms closely and taking ample rest. If symptoms persist or worsen, please schedule a consultation.";
      predictedConditions = ['Undetermined Symptomatic Presentation'];
      recommendedSpecialist = 'General Practitioner';
    }

    // Save log to DB
    const log = await AIAnalysisLog.create({
      patient: patientId,
      symptomsProvided: symptoms,
      aiResponse,
      predictedConditions,
      recommendedSpecialist,
    });

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
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
