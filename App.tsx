import React, { useState, useEffect, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { 
  Play, BookOpen, RotateCcw, ChevronLeft, ChevronRight, 
  Lightbulb, Activity, Menu as MenuIcon, XCircle, PlayCircle 
} from 'lucide-react';

import { getBestMove, analyzeMoveQuality, generateExplanation } from './engine';
import { GameMode, HistoryStep, AnalysisResult } from './types';
import { LEARNING_MODULES } from './constants';

const App: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [mode, setMode] = useState<GameMode>('menu');
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [difficulty, setDifficulty] = useState(2); // Depth
  const chessboardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(400);

  // Responsive board
  useEffect(() => {
    const handleResize = () => {
      if (chessboardRef.current) {
        const w = chessboardRef.current.offsetWidth;
        setBoardWidth(w);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [mode]);

  // Initial setup
  useEffect(() => {
    const initialStep: HistoryStep = {
      fen: new Chess().fen(),
      move: null,
      analysis: { score: 0, bestMove: '', explanation: 'بازی جدید آغاز شد.', quality: 'Book' },
      turn: 'w'
    };
    setHistory([initialStep]);
    setCurrentStepIndex(0);
  }, []);

  // --- Core Game Logic ---

  const makeMove = (move: string | { from: string; to: string; promotion?: string }) => {
    const gameCopy = new Chess(game.fen());
    let result: Move | null = null;

    try {
      result = gameCopy.move(move);
    } catch (e) { return null; }

    if (result) {
      setGame(gameCopy);
      
      // Analysis (Async to not block UI rendering)
      setTimeout(() => {
        const fenBefore = history[history.length - 1].fen;
        // Best move for the position BEFORE the move was made
        const engineRes = getBestMove(new Chess(fenBefore), difficulty);
        const qualityRes = analyzeMoveQuality(fenBefore, result!.san, engineRes.bestMove || '');
        
        const explanation = generateExplanation(gameCopy, result, qualityRes.quality);
        
        const step: HistoryStep = {
          fen: gameCopy.fen(),
          move: result,
          analysis: {
            score: engineRes.evaluation,
            bestMove: engineRes.bestMove || '',
            explanation: explanation,
            quality: qualityRes.quality
          },
          turn: gameCopy.turn()
        };
        
        const newHist = [...history, step];
        setHistory(newHist);
        setCurrentStepIndex(newHist.length - 1);
      }, 0);

      return result;
    }
    return null;
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (mode === 'review') return false;
    if (game.turn() !== orientation[0] && mode === 'play') return false;
    if (isAiThinking) return false;

    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move === null) return false;
    
    // AI Turn trigger
    if (!new Chess(game.fen()).isGameOver()) {
       setTimeout(makeAiMove, 500);
    }
    return true;
  };

  const makeAiMove = () => {
    if (mode !== 'play') return;
    setIsAiThinking(true);
    
    // Yield to UI
    setTimeout(() => {
        const engineRes = getBestMove(game, difficulty);
        if (engineRes.bestMove) {
            makeMove(engineRes.bestMove);
        }
        setIsAiThinking(false);
    }, 100);
  };

  const requestHint = () => {
    if (isAiThinking || mode === 'review') return;
    setIsAiThinking(true);
    setTimeout(() => {
        const res = getBestMove(game, 4); // Deeper search for hint
        if (res.bestMove) {
            alert(`💡 پیشنهاد هوش مصنوعی: ${res.bestMove}\n\nاین حرکت وضعیت شما را بهبود می‌بخشد.`);
        }
        setIsAiThinking(false);
    }, 100);
  };

  // --- Navigation & State ---

  const startNewGame = (color: 'white' | 'black') => {
    const newGame = new Chess();
    setGame(newGame);
    setOrientation(color);
    setHistory([{
        fen: newGame.fen(),
        move: null,
        analysis: { score: 0, bestMove: '', explanation: 'بازی جدید.', quality: 'Book' },
        turn: 'w'
    }]);
    setCurrentStepIndex(0);
    setMode('play');
    if (color === 'black') {
        setTimeout(makeAiMove, 500);
    }
  };

  const goToReview = () => {
    setMode('review');
  };

  const resumeFromHere = () => {
    // Slice history to current point
    const step = history[currentStepIndex];
    const newGame = new Chess(step.fen);
    setGame(newGame);
    setHistory(history.slice(0, currentStepIndex + 1));
    setMode('play');
    
    // If it's AI's turn, trigger it
    if (newGame.turn() !== orientation[0]) {
        setTimeout(makeAiMove, 500);
    }
  };

  const navigateHistory = (direction: 'prev' | 'next' | 'start' | 'end') => {
    let newIndex = currentStepIndex;
    if (direction === 'prev') newIndex = Math.max(0, currentStepIndex - 1);
    if (direction === 'next') newIndex = Math.min(history.length - 1, currentStepIndex + 1);
    if (direction === 'start') newIndex = 0;
    if (direction === 'end') newIndex = history.length - 1;

    setCurrentStepIndex(newIndex);
    setGame(new Chess(history[newIndex].fen));
  };

  // --- Render Helpers ---

  const getQualityColor = (q?: string) => {
      switch(q) {
          case 'Best': return 'text-green-400';
          case 'Good': return 'text-blue-400';
          case 'Inaccuracy': return 'text-yellow-400';
          case 'Blunder': return 'text-red-500';
          default: return 'text-gray-400';
      }
  };

  const getScorePercentage = (step: HistoryStep) => {
      if (!step.analysis) return null;
      if (step.analysis.quality === 'Best') return '100%';
      if (step.analysis.quality === 'Good') return '85%';
      if (step.analysis.quality === 'Inaccuracy') return '60%';
      if (step.analysis.quality === 'Blunder') return '20%';
      return 'N/A';
  }

  // --- Views ---

  if (mode === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black z-0"></div>
        
        <div className="z-10 text-center space-y-8 max-w-md w-full animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-lg">
            شطرنج مستر
          </h1>
          <p className="text-slate-400 text-lg">هوش مصنوعی پیشرفته • آموزش • تحلیل</p>
          
          <div className="space-y-4">
            <button onClick={() => startNewGame('white')} className="w-full group relative px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all shadow-lg flex items-center justify-between">
              <span className="text-xl font-bold text-white group-hover:text-blue-300">بازی با سفید</span>
              <Play className="w-6 h-6 text-blue-400" />
            </button>
            <button onClick={() => startNewGame('black')} className="w-full group relative px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all shadow-lg flex items-center justify-between">
              <span className="text-xl font-bold text-white group-hover:text-red-300">بازی با سیاه</span>
              <Play className="w-6 h-6 text-red-400" />
            </button>
            <button onClick={() => setMode('learn')} className="w-full group relative px-8 py-4 bg-gradient-to-r from-emerald-900 to-slate-800 border border-emerald-700 rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-between">
              <span className="text-xl font-bold text-emerald-100">آموزش شطرنج</span>
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </button>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <label className="block text-sm text-slate-400 mb-2">سطح دشواری هوش مصنوعی</label>
            <div className="flex justify-between gap-2">
                {[1, 2, 3, 4].map(l => (
                    <button 
                        key={l}
                        onClick={() => setDifficulty(l)}
                        className={`flex-1 py-2 rounded ${difficulty === l ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                    >
                        {l === 1 ? 'ساده' : l === 2 ? 'متوسط' : l === 3 ? 'سخت' : 'استاد'}
                    </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'learn') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
             <button onClick={() => setMode('menu')} className="flex items-center text-slate-400 hover:text-white">
                <MenuIcon className="ml-2"/> بازگشت به منو
             </button>
             <h2 className="text-3xl font-bold text-emerald-400">آکادمی شطرنج</h2>
          </div>
          
          <div className="grid gap-6">
            {LEARNING_MODULES.map(mod => (
                <div key={mod.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">{mod.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                            mod.level === 'Beginner' ? 'bg-green-900 text-green-300' :
                            mod.level === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                        }`}>{mod.level === 'Beginner' ? 'مبتدی' : mod.level === 'Intermediate' ? 'متوسط' : 'پیشرفته'}</span>
                    </div>
                    <p className="text-slate-300 leading-8 text-justify">{mod.content}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Common UI for Play and Review
  const currentStep = history[currentStepIndex];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-white overflow-hidden">
      
      {/* Sidebar / Topbar (Mobile) */}
      <div className="lg:w-1/4 p-4 bg-slate-900 border-b lg:border-b-0 lg:border-l border-slate-800 flex flex-col gap-4 z-20 shadow-xl">
         <div className="flex justify-between items-center">
            <button onClick={() => setMode('menu')} className="p-2 hover:bg-slate-800 rounded text-slate-400">
                <MenuIcon />
            </button>
            <div className="text-center">
                <h2 className="font-bold text-lg">{mode === 'play' ? 'در حال بازی' : 'حالت بازبینی'}</h2>
                <p className="text-xs text-slate-500">{mode === 'play' && isAiThinking ? 'AI در حال فکر کردن...' : (game.turn() === 'w' ? 'نوبت سفید' : 'نوبت سیاه')}</p>
            </div>
            <div className="w-8"></div> {/* Spacer */}
         </div>

         {/* Stats Panel */}
         <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex-1 overflow-y-auto min-h-[150px]">
            <h3 className="text-sm text-slate-400 mb-3 flex items-center gap-2">
                <Activity size={16}/> تحلیل هوشمند
            </h3>
            
            {currentStep.move ? (
                <div className="space-y-3 animate-slide-in">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{currentStep.turn === 'w' ? 'سیاه' : 'سفید'} بازی کرد</span>
                        <span className={`text-xl font-mono font-bold ${getQualityColor(currentStep.analysis?.quality)}`}>
                            {currentStep.analysis?.quality === 'Best' ? '★ عالی' : 
                             currentStep.analysis?.quality === 'Good' ? '✓ خوب' : 
                             currentStep.analysis?.quality === 'Blunder' ? '⚠ اشتباه' : 'معمولی'}
                        </span>
                    </div>
                    
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${
                                currentStep.analysis?.quality === 'Best' ? 'bg-green-500' : 
                                currentStep.analysis?.quality === 'Blunder' ? 'bg-red-500' : 'bg-blue-500'
                            }`} 
                            style={{width: getScorePercentage(currentStep) || '50%'}}
                        ></div>
                    </div>

                    <p className="text-slate-300 text-sm leading-6 border-r-2 border-slate-600 pr-3 mt-2">
                        {currentStep.analysis?.explanation}
                    </p>
                    
                    {currentStep.analysis?.quality !== 'Best' && currentStep.analysis?.quality !== 'Book' && (
                         <div className="mt-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                            بهترین حرکت: <span className="text-green-400 font-mono">{currentStep.analysis?.bestMove}</span>
                         </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-slate-500 mt-10">بازی را شروع کنید...</p>
            )}
         </div>

         {/* Action Buttons */}
         <div className="grid grid-cols-2 gap-2">
            {mode === 'play' ? (
                <>
                    <button onClick={requestHint} disabled={isAiThinking} className="flex items-center justify-center gap-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 py-3 rounded-lg hover:bg-yellow-600/30 transition-colors">
                        <Lightbulb size={18} /> راهنمایی
                    </button>
                    <button onClick={goToReview} className="flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 py-3 rounded-lg hover:bg-blue-600/30 transition-colors">
                        <RotateCcw size={18} /> بازبینی
                    </button>
                    <button onClick={() => startNewGame(orientation)} className="col-span-2 bg-slate-700 py-2 rounded text-sm hover:bg-slate-600">بازی جدید</button>
                </>
            ) : (
                <>
                    <button onClick={resumeFromHere} className="col-span-2 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 shadow-lg shadow-green-900/20 transition-all">
                        <PlayCircle size={20} /> ادامه بازی از اینجا
                    </button>
                    <button onClick={() => setMode('play')} className="col-span-2 bg-slate-700 py-2 rounded text-sm hover:bg-slate-600 mt-2">بازگشت به بازی فعلی</button>
                </>
            )}
         </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-2 relative">
         <div ref={chessboardRef} className="w-full max-w-[85vh] aspect-square shadow-2xl rounded-lg overflow-hidden border-4 border-slate-800 relative">
            <Chessboard 
                position={game.fen()} 
                onPieceDrop={onDrop}
                boardOrientation={orientation}
                customDarkSquareStyle={{ backgroundColor: '#334155' }}
                customLightSquareStyle={{ backgroundColor: '#94a3b8' }}
                animationDuration={200}
                arePiecesDraggable={mode === 'play'}
            />
            {game.isGameOver() && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-slate-800 p-8 rounded-2xl text-center border border-slate-600 shadow-2xl">
                        <h2 className="text-3xl font-bold mb-2 text-white">بازی تمام شد</h2>
                        <p className="text-slate-300 mb-6">
                            {game.isCheckmate() ? 'کیش و مات!' : 'تساوی / پات'}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={goToReview} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">تحلیل کامل</button>
                            <button onClick={() => startNewGame(orientation)} className="px-6 py-2 bg-slate-600 rounded-lg hover:bg-slate-500">بازی مجدد</button>
                        </div>
                    </div>
                </div>
            )}
         </div>

         {/* Navigation Controls (Always visible but active mainly in Review) */}
         <div className="w-full max-w-[85vh] mt-4 bg-slate-900 rounded-full p-2 flex items-center justify-between border border-slate-800">
            <button onClick={() => navigateHistory('start')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 disabled:opacity-30" disabled={currentStepIndex === 0}>
                <ChevronRight className="rotate-180" /> <span className="sr-only">Start</span>
            </button>
            <button onClick={() => navigateHistory('prev')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 disabled:opacity-30" disabled={currentStepIndex === 0}>
                <ChevronLeft className="rotate-180" />
            </button>
            
            <div className="font-mono text-slate-500 text-sm">
                حرکت {Math.ceil(currentStepIndex / 2)}
            </div>

            <button onClick={() => navigateHistory('next')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 disabled:opacity-30" disabled={currentStepIndex === history.length - 1}>
                <ChevronRight />
            </button>
            <button onClick={() => navigateHistory('end')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 disabled:opacity-30" disabled={currentStepIndex === history.length - 1}>
                <ChevronLeft /> <span className="sr-only">End</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default App;
