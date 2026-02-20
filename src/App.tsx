/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { ExamState, Question, AVAILABLE_SUBJECTS } from './types';
import { fetchQuestionsForSubject } from './services/jambService';
import SubjectSelector from './components/SubjectSelector';
import QuestionView from './components/QuestionView';
import NavigationGrid from './components/NavigationGrid';
import Calculator from './components/Calculator';
import ResultView from './components/ResultView';
import { Calculator as CalcIcon, Clock, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EXAM_DURATION = 2 * 60 * 60; // 2 hours in seconds

export default function App() {
  const [state, setState] = useState<ExamState>({
    status: 'idle',
    selectedSubjects: [],
    questions: {},
    answers: {},
    submittedAnswers: {},
    currentSubject: '',
    currentQuestionIndex: 0,
    timeRemaining: EXAM_DURATION,
    loadingProgress: '',
  });

  const [showCalculator, setShowCalculator] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.status === 'active' && state.timeRemaining > 0) {
      interval = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            clearInterval(interval);
            return { ...prev, status: 'finished', timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.status, state.timeRemaining]);

  const handleStartExam = async (selectedSubjects: string[]) => {
    setState(prev => ({ ...prev, status: 'loading', selectedSubjects, loadingProgress: 'Initializing...' }));

    try {
      // 1. Prioritize English (Mandatory) - Fetch only first 5 questions for instant start
      const englishConfig = AVAILABLE_SUBJECTS.find(s => s.id === 'english');
      if (!englishConfig) throw new Error("English subject not found");

      setState(prev => ({ ...prev, loadingProgress: `Starting ${englishConfig.name}...` }));
      
      // Fetch just 5 questions to start immediately
      const initialEnglishQuestions = await fetchQuestionsForSubject('english', 5);
      
      const initialQuestionsMap: Record<string, Question[]> = {
        'english': initialEnglishQuestions
      };
      
      const initialAnswersMap: Record<string, Record<number, string>> = {
        'english': {}
      };

      const initialSubmittedMap: Record<string, Set<number>> = {
        'english': new Set()
      };

      // 2. Start the exam immediately
      setState(prev => ({
        ...prev,
        status: 'active',
        selectedSubjects,
        questions: initialQuestionsMap,
        answers: initialAnswersMap,
        submittedAnswers: initialSubmittedMap,
        currentSubject: 'english',
        currentQuestionIndex: 0,
        timeRemaining: EXAM_DURATION,
        loadingProgress: '',
      }));

      // 3. Background Loading Strategy
      // A. Load remaining English questions
      loadMoreQuestions('english', englishConfig.questionCount - 5);

      // B. Load other subjects
      const otherSubjects = selectedSubjects.filter(s => s !== 'english');
      loadBackgroundSubjects(otherSubjects);

    } catch (error) {
      console.error("Failed to start exam:", error);
      setState(prev => ({ ...prev, status: 'idle', loadingProgress: 'Error loading questions. Please try again.' }));
    }
  };

  const loadMoreQuestions = async (subjectId: string, count: number) => {
    try {
      const newQuestions = await fetchQuestionsForSubject(subjectId, count);
      
      setState(prev => {
        const existingQuestions = prev.questions[subjectId] || [];
        const existingIds = new Set(existingQuestions.map(q => q.id));
        
        // Filter duplicates
        const uniqueNewQuestions = newQuestions.filter(q => !existingIds.has(q.id));
        
        return {
          ...prev,
          questions: {
            ...prev.questions,
            [subjectId]: [...existingQuestions, ...uniqueNewQuestions]
          }
        };
      });
    } catch (error) {
      console.error(`Failed to load more questions for ${subjectId}`, error);
    }
  };

  const loadBackgroundSubjects = async (subjects: string[]) => {
    for (const subjectId of subjects) {
      const subjectConfig = AVAILABLE_SUBJECTS.find(s => s.id === subjectId);
      if (!subjectConfig) continue;

      try {
        // Load first batch (5) for quick access if user switches
        const firstBatch = await fetchQuestionsForSubject(subjectId, 5);
        
        setState(prev => ({
          ...prev,
          questions: {
            ...prev.questions,
            [subjectId]: firstBatch // Initialize with first batch
          },
          answers: {
            ...prev.answers,
            [subjectId]: {}
          },
          submittedAnswers: {
            ...prev.submittedAnswers,
            [subjectId]: new Set()
          }
        }));

        // Load the rest
        loadMoreQuestions(subjectId, subjectConfig.questionCount - 5);

      } catch (error) {
        console.error(`Failed to load background subject ${subjectId}`, error);
      }
    }
  };

  const handleSelectAnswer = (option: string) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentSubject]: {
          ...prev.answers[prev.currentSubject],
          [prev.currentQuestionIndex]: option
        }
      }
    }));
  };

  const handleNavigate = (index: number) => {
    setState(prev => ({ ...prev, currentQuestionIndex: index }));
    setShowSidebar(false); // Close sidebar on mobile after selection
  };

  const handleNext = () => {
    const { currentSubject, currentQuestionIndex, answers, questions, submittedAnswers } = state;
    const currentQuestions = questions[currentSubject] || [];
    const hasAnswer = !!answers[currentSubject]?.[currentQuestionIndex];
    const isSubmitted = submittedAnswers[currentSubject]?.has(currentQuestionIndex);

    // If answer selected but not submitted, submit it first
    if (hasAnswer && !isSubmitted) {
      setState(prev => {
        const subjectSubmitted = new Set(prev.submittedAnswers[currentSubject] || []);
        subjectSubmitted.add(currentQuestionIndex);
        return {
          ...prev,
          submittedAnswers: {
            ...prev.submittedAnswers,
            [currentSubject]: subjectSubmitted
          }
        };
      });
      return;
    }

    // Otherwise move to next question
    handleNavigate(Math.min(currentQuestions.length - 1, currentQuestionIndex + 1));
  };

  const changeSubject = (subjectId: string) => {
    setState(prev => ({
      ...prev,
      currentSubject: subjectId,
      currentQuestionIndex: 0 // Reset to first question of new subject
    }));
  };

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit your exam?')) {
      setState(prev => ({ ...prev, status: 'finished' }));
    }
  };

  const handleRestart = () => {
    setState({
      status: 'idle',
      selectedSubjects: [],
      questions: {},
      answers: {},
      currentSubject: '',
      currentQuestionIndex: 0,
      timeRemaining: EXAM_DURATION,
      loadingProgress: '',
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate scores
  const calculateScores = () => {
    const scores: Record<string, number> = {};
    const totalQuestions: Record<string, number> = {};

    state.selectedSubjects.forEach(subjectId => {
      let subjectScore = 0;
      const subjectQuestions = state.questions[subjectId] || [];
      const subjectAnswers = state.answers[subjectId] || {};

      subjectQuestions.forEach((q, idx) => {
        // API answer is usually a single letter 'a', 'b', 'c', 'd'
        // Sometimes it might be case sensitive, let's normalize
        if (subjectAnswers[idx] && subjectAnswers[idx].toLowerCase() === q.answer.toLowerCase()) {
          subjectScore++;
        }
      });

      scores[subjectId] = subjectScore;
      totalQuestions[subjectId] = subjectQuestions.length;
    });

    return { scores, totalQuestions };
  };

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <div className="relative">
        <SubjectSelector onStart={handleStartExam} isLoading={state.status === 'loading'} />
        {state.status === 'loading' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
              <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-slate-800">{state.loadingProgress}</p>
              <p className="text-sm text-slate-500 mt-2">Please wait while we fetch your questions...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (state.status === 'finished') {
    const { scores, totalQuestions } = calculateScores();
    return <ResultView scores={scores} totalQuestions={totalQuestions} onRestart={handleRestart} />;
  }

  const currentQuestions = state.questions[state.currentSubject] || [];
  const currentQuestion = currentQuestions[state.currentQuestionIndex];
  const currentSubjectName = AVAILABLE_SUBJECTS.find(s => s.id === state.currentSubject)?.name;
  const answeredIndices = Object.keys(state.answers[state.currentSubject] || {}).map(Number);
  const isSubmitted = state.submittedAnswers[state.currentSubject]?.has(state.currentQuestionIndex);
  const hasAnswer = !!state.answers[state.currentSubject]?.[state.currentQuestionIndex];

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Coat_of_arms_of_Nigeria.svg/1200px-Coat_of_arms_of_Nigeria.svg.png" alt="Logo" className="h-8 w-auto" />
            <div className="hidden md:block">
              <h1 className="font-bold text-slate-900 leading-tight">JAMB CBT</h1>
              <p className="text-xs text-slate-500">Joint Admissions and Matriculation Board</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 px-4 py-2 rounded-lg flex items-center gap-2 font-mono font-bold text-slate-700">
            <Clock size={18} className="text-slate-500" />
            {formatTime(state.timeRemaining)}
          </div>
          
          <button 
            onClick={() => setShowCalculator(!showCalculator)}
            className={`p-2 rounded-lg transition-colors ${showCalculator ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
            title="Calculator"
          >
            <CalcIcon size={20} />
          </button>

          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            {showSidebar ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button 
            onClick={handleSubmit}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Subject Tabs & Question Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Subject Tabs */}
          <div className="bg-white border-b border-slate-200 px-4 flex overflow-x-auto no-scrollbar">
            {state.selectedSubjects.map(subjectId => {
              const subject = AVAILABLE_SUBJECTS.find(s => s.id === subjectId);
              const isActive = state.currentSubject === subjectId;
              return (
                <button
                  key={subjectId}
                  onClick={() => changeSubject(subjectId)}
                  className={`
                    px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                    ${isActive 
                      ? 'border-green-600 text-green-700 bg-green-50/50' 
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                  `}
                >
                  {subject?.name}
                </button>
              );
            })}
          </div>

          {/* Question Display */}
          <div className="flex-1 overflow-hidden relative bg-white m-4 rounded-xl shadow-sm border border-slate-200">
            {!currentQuestions || currentQuestions.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-500">
                 <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mb-4"></div>
                 <p>Loading {currentSubjectName} questions...</p>
                 <p className="text-xs text-slate-400 mt-2">You can continue answering other subjects while this loads.</p>
               </div>
            ) : currentQuestion ? (
              <QuestionView 
                question={currentQuestion}
                selectedOption={state.answers[state.currentSubject]?.[state.currentQuestionIndex]}
                isSubmitted={isSubmitted}
                onSelectOption={handleSelectAnswer}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                No questions available for this subject.
              </div>
            )}

            {/* Bottom Navigation Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-between items-center">
              <button
                onClick={() => handleNavigate(Math.max(0, state.currentQuestionIndex - 1))}
                disabled={state.currentQuestionIndex === 0}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              
              <span className="text-sm font-medium text-slate-500">
                Question {state.currentQuestionIndex + 1} of {currentQuestions.length}
              </span>

              <button
                onClick={handleNext}
                disabled={state.currentQuestionIndex === currentQuestions.length - 1 && isSubmitted}
                className={`
                  px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all
                  ${hasAnswer && !isSubmitted 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'}
                `}
              >
                {hasAnswer && !isSubmitted ? 'Submit Answer' : 'Next Question'}
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar (Navigation Grid) */}
        <aside className={`
          fixed inset-y-0 right-0 w-72 bg-white border-l border-slate-200 transform transition-transform duration-300 z-30
          md:relative md:translate-x-0
          ${showSidebar ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Question Navigator</h3>
              <p className="text-xs text-slate-500 mt-1">{currentSubjectName}</p>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <NavigationGrid 
                totalQuestions={currentQuestions.length}
                currentIndex={state.currentQuestionIndex}
                answeredIndices={answeredIndices}
                onNavigate={handleNavigate}
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 md:hidden">
              <button 
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <LogOut size={16} />
                Submit Exam
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/20 z-20 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>

      {/* Calculator */}
      <AnimatePresence>
        {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
      </AnimatePresence>
    </div>
  );
}

