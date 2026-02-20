interface NavigationGridProps {
  totalQuestions: number;
  currentIndex: number;
  answeredIndices: number[];
  onNavigate: (index: number) => void;
}

export default function NavigationGrid({ 
  totalQuestions, 
  currentIndex, 
  answeredIndices, 
  onNavigate 
}: NavigationGridProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2 p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {Array.from({ length: totalQuestions }).map((_, idx) => {
        const isAnswered = answeredIndices.includes(idx);
        const isCurrent = currentIndex === idx;
        
        return (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`
              aspect-square rounded flex items-center justify-center text-sm font-medium transition-all
              ${isCurrent 
                ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1' 
                : isAnswered 
                  ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}
            `}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
