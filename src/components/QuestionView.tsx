import { Question } from '../types';
import { motion } from 'motion/react';

interface QuestionViewProps {
  question: Question;
  selectedOption?: string;
  isSubmitted?: boolean;
  onSelectOption: (option: string) => void;
}

export default function QuestionView({ question, selectedOption, isSubmitted, onSelectOption }: QuestionViewProps) {
  // Parse options from the API response which might be inconsistent
  // The API returns options as an object { a: "...", b: "...", ... }
  const options = [
    { key: 'a', text: question.option.a },
    { key: 'b', text: question.option.b },
    { key: 'c', text: question.option.c },
    { key: 'd', text: question.option.d },
  ].filter(opt => opt.text); // Filter out empty options if any

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-900 leading-relaxed">
            {question.question}
          </h3>
          {question.image && (
            <div className="mt-4">
              <img 
                src={question.image} 
                alt="Question Diagram" 
                className="max-h-64 rounded-lg border border-slate-200"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isCorrect = question.answer.toLowerCase() === opt.key.toLowerCase();
            
            let borderClass = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';
            let bgClass = 'bg-slate-200 text-slate-600 group-hover:bg-slate-300';
            let textClass = 'text-slate-700';

            if (isSubmitted) {
              if (isCorrect) {
                borderClass = 'border-green-500 bg-green-50';
                bgClass = 'bg-green-500 text-white';
                textClass = 'text-green-900 font-medium';
              } else if (isSelected && !isCorrect) {
                borderClass = 'border-red-500 bg-red-50';
                bgClass = 'bg-red-500 text-white';
                textClass = 'text-red-900 font-medium';
              } else {
                borderClass = 'border-slate-200 opacity-50';
              }
            } else if (isSelected) {
              borderClass = 'border-green-600 bg-green-50';
              bgClass = 'bg-green-600 text-white';
              textClass = 'text-green-900 font-medium';
            }

            return (
              <button
                key={opt.key}
                onClick={() => !isSubmitted && onSelectOption(opt.key)}
                disabled={isSubmitted}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-3 group
                  ${borderClass}
                  ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                  ${bgClass}
                `}>
                  {opt.key.toUpperCase()}
                </span>
                <span className={`text-base ${textClass}`}>
                  {opt.text}
                </span>
                {isSubmitted && isCorrect && (
                  <span className="ml-auto text-green-600 text-sm font-bold">Correct Answer</span>
                )}
                {isSubmitted && isSelected && !isCorrect && (
                  <span className="ml-auto text-red-600 text-sm font-bold">Your Answer</span>
                )}
              </button>
            );
          })}
        </div>
        
        {isSubmitted && (
          <div className={`mt-6 p-4 rounded-lg border ${
            question.answer.toLowerCase() === (selectedOption || '').toLowerCase() 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="font-bold mb-1">
              {question.answer.toLowerCase() === (selectedOption || '').toLowerCase() 
                ? 'Correct!' 
                : 'Incorrect'}
            </p>
            <p className="text-sm">
              The correct answer is <strong>{question.answer.toUpperCase()}</strong>.
              {question.solution && (
                <span className="block mt-2 pt-2 border-t border-current/20">
                  <strong>Explanation:</strong> {question.solution}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
