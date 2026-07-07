import mongoose from 'mongoose';

const aiAnalysisLogSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptomsProvided: { type: String, required: true },
    aiResponse: { type: String, required: true },
    predictedConditions: [{ type: String }],
    recommendedSpecialist: { type: String },
  },
  { timestamps: true }
);

const AIAnalysisLog = mongoose.model('AIAnalysisLog', aiAnalysisLogSchema);
export default AIAnalysisLog;
