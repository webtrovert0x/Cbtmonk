import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Delete, GripHorizontal } from 'lucide-react';

interface CalculatorProps {
  onClose: () => void;
}

export default function Calculator({ onClose }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleDelete = () => {
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-20 right-20 z-50 bg-slate-800 text-white rounded-xl shadow-2xl w-72 overflow-hidden border border-slate-600"
    >
      {/* Header */}
      <div className="bg-slate-900 p-2 flex justify-between items-center cursor-move handle">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <GripHorizontal size={14} />
          <span>CASIO-FX</span>
        </div>
        <button onClick={onClose} className="hover:bg-red-500/20 p-1 rounded transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Display */}
      <div className="bg-slate-200 p-4 text-right text-slate-900 font-mono">
        <div className="text-xs text-slate-500 h-4">{equation}</div>
        <div className="text-3xl font-bold truncate">{display}</div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-slate-800">
        <button onClick={handleClear} className="col-span-2 bg-red-500 hover:bg-red-600 p-3 rounded text-sm font-bold">AC</button>
        <button onClick={handleDelete} className="bg-slate-600 hover:bg-slate-500 p-3 rounded text-sm"><Delete size={16} className="mx-auto" /></button>
        <button onClick={() => handleOperator('/')} className="bg-orange-500 hover:bg-orange-600 p-3 rounded text-lg font-bold">÷</button>

        {[7, 8, 9].map(num => (
          <button key={num} onClick={() => handleNumber(String(num))} className="bg-slate-700 hover:bg-slate-600 p-3 rounded text-lg font-bold">{num}</button>
        ))}
        <button onClick={() => handleOperator('*')} className="bg-orange-500 hover:bg-orange-600 p-3 rounded text-lg font-bold">×</button>

        {[4, 5, 6].map(num => (
          <button key={num} onClick={() => handleNumber(String(num))} className="bg-slate-700 hover:bg-slate-600 p-3 rounded text-lg font-bold">{num}</button>
        ))}
        <button onClick={() => handleOperator('-')} className="bg-orange-500 hover:bg-orange-600 p-3 rounded text-lg font-bold">-</button>

        {[1, 2, 3].map(num => (
          <button key={num} onClick={() => handleNumber(String(num))} className="bg-slate-700 hover:bg-slate-600 p-3 rounded text-lg font-bold">{num}</button>
        ))}
        <button onClick={() => handleOperator('+')} className="bg-orange-500 hover:bg-orange-600 p-3 rounded text-lg font-bold">+</button>

        <button onClick={() => handleNumber('0')} className="col-span-2 bg-slate-700 hover:bg-slate-600 p-3 rounded text-lg font-bold">0</button>
        <button onClick={() => handleNumber('.')} className="bg-slate-700 hover:bg-slate-600 p-3 rounded text-lg font-bold">.</button>
        <button onClick={handleEqual} className="bg-green-600 hover:bg-green-500 p-3 rounded text-lg font-bold">=</button>
      </div>
    </motion.div>
  );
}
