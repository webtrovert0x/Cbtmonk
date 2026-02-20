import { useState } from 'react';
import { AVAILABLE_SUBJECTS, Subject } from '../types';
import { Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SubjectSelectorProps {
  onStart: (selectedSubjects: string[]) => void;
  isLoading: boolean;
}

export default function SubjectSelector({ onStart, isLoading }: SubjectSelectorProps) {
  const [selected, setSelected] = useState<string[]>(['english']); // English is mandatory

  const toggleSubject = (id: string) => {
    if (id === 'english') return; // Cannot unselect English

    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      if (selected.length < 4) {
        setSelected([...selected, id]);
      }
    }
  };

  const isValid = selected.length === 4;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-4xl w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className="bg-green-700 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Coat_of_arms_of_Nigeria.svg/1200px-Coat_of_arms_of_Nigeria.svg.png" alt="Logo" className="h-8 w-auto" />
            JAMB CBT Practice
          </h1>
          <p className="text-green-100 mt-2">Select your 4 subjects to begin the examination.</p>
        </div>

        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Available Subjects</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isValid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {selected.length}/4 Selected
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {AVAILABLE_SUBJECTS.map((subject) => {
              const isSelected = selected.includes(subject.id);
              const isMandatory = subject.id === 'english';
              
              return (
                <button
                  key={subject.id}
                  onClick={() => toggleSubject(subject.id)}
                  disabled={isMandatory || (selected.length >= 4 && !isSelected)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all
                    ${isSelected 
                      ? 'border-green-600 bg-green-50 text-green-900' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'}
                    ${(selected.length >= 4 && !isSelected) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="font-medium">{subject.name}</div>
                  <div className="text-xs mt-1 opacity-70">{subject.questionCount} Questions</div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-green-600">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  )}
                  {isMandatory && (
                    <div className="absolute bottom-2 right-2 text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded">
                      REQ
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertCircle size={16} />
              <span>English Language is compulsory for all candidates.</span>
            </div>
            
            <button
              onClick={() => onStart(selected)}
              disabled={!isValid || isLoading}
              className={`
                px-8 py-3 rounded-lg font-semibold text-white transition-all
                ${isValid && !isLoading
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/30' 
                  : 'bg-slate-300 cursor-not-allowed'}
              `}
            >
              {isLoading ? 'Loading Questions...' : 'Start Examination'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
