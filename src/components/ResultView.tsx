import { AVAILABLE_SUBJECTS } from '../types';
import { motion } from 'motion/react';
import { Trophy, Clock, BarChart2, RefreshCw } from 'lucide-react';

interface ResultViewProps {
  scores: Record<string, number>;
  totalQuestions: Record<string, number>;
  onRestart: () => void;
}

export default function ResultView({ scores, totalQuestions, onRestart }: ResultViewProps) {
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossibleScore = Object.values(totalQuestions).reduce((a, b) => a + b, 0);
  const percentage = Math.round((totalScore / maxPossibleScore) * 100);

  // Determine grade color
  const gradeColor = percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className="bg-slate-900 p-8 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
            <Trophy className="text-yellow-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Examination Completed</h1>
          <p className="text-slate-400">Here is your performance breakdown</p>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="text-center">
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Total Score</div>
              <div className={`text-5xl font-bold ${gradeColor}`}>{totalScore} <span className="text-2xl text-slate-400">/ {maxPossibleScore}</span></div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {Object.entries(scores).map(([subjectId, score]) => {
              const subjectName = AVAILABLE_SUBJECTS.find(s => s.id === subjectId)?.name || subjectId;
              const max = totalQuestions[subjectId] || 0;
              const percent = Math.round((score / max) * 100);
              
              return (
                <div key={subjectId} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-700">{subjectName}</span>
                    <span className="font-bold text-slate-900">{score} / {max}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              <RefreshCw size={18} />
              Take Another Test
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
