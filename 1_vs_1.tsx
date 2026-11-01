import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Settings, Play, RotateCcw, Volume2, VolumeX, 
  User, Shield, Flame, Clock, CheckCircle2, XCircle, BookOpen
} from 'lucide-react';

// Default video URLs provided by user
const DEFAULT_VIDEOS = {
  idle: "https://embed-media-mosaic.lovable.app/embed/03e6e74f-9fe7-4f5e-9317-2cb13236df7c",
  p1Attack: "https://embed-media-mosaic.lovable.app/embed/1822ef8c-0086-435a-b7ce-1dcbe4c920c8",
  p2Attack: "https://embed-media-mosaic.lovable.app/embed/bade3192-987e-4da5-9145-3f8e0989474b",
  p1Win: "https://embed-media-mosaic.lovable.app/embed/42a4da3b-5149-4823-b36f-2ef8c4471cde",
  p2Win: "https://embed-media-mosaic.lovable.app/embed/aa508b6e-47f6-4f18-95c1-baac6e083c9e"
};

// Default Geography 7th Grade "Atmosphere" Questions (10 questions: 5 for P1, 5 for P2)
const DEFAULT_QUESTIONS_P1 = [
  {
    id: 1,
    question: "Атмосфераның ең төменгі, негізгі қабаты қалай аталады?",
    options: ["А) Стратосфера", "Б) Тропосфера", "В) Мезосфера", "Г) Термосфера"],
    correct: 1
  },
  {
    id: 2,
    question: "Атмосфералық қысымды өлшейтін құрал:",
    options: ["А) Термометр", "Б) Барометр", "В) Гигрометр", "Г) Анемометр"],
    correct: 1
  },
  {
    id: 3,
    question: "Ауа құрамындағы ең көп тараған газ (%):",
    options: ["А) Оттегі", "Б) Көмірқышқыл газы", "В) Азот", "Г) Аргон"],
    correct: 2
  },
  {
    id: 4,
    question: "Биіктік көтерілген сайын температура қалай өзгереді?",
    options: ["А) Төмендейді", "Б) Жоғарылайды", "В) Өзгермейді", "Г) Алдымен артады"],
    correct: 0
  },
  {
    id: 5,
    question: "Жер бетіндегі ауаның көлденең бағытта қозғалуы:",
    options: ["А) Циклон", "Б) Жел", "В) Бриз", "Г) Муссон"],
    correct: 1
  }
];

const DEFAULT_QUESTIONS_P2 = [
  {
    id: 1,
    question: "Озон қабаты атмосфераның қай қабатында орналасқан?",
    options: ["А) Тропосфера", "Б) Стратосфера", "В) Экзосфера", "Г) Мезосфера"],
    correct: 1
  },
  {
    id: 2,
    question: "Ауаның ылғалдылығын өлшейтін құрал:",
    options: ["А) Гигрометр", "Б) Барометр", "В) Флюгер", "Г) Осадкомер"],
    correct: 0
  },
  {
    id: 3,
    question: "Жер бетін күн сәулесінен қорғайтын маңызды қабат:",
    options: ["А) Озон қабаты", "Б) Көміртек қабаты", "В) Бу қабаты", "Г) Тұман"],
    correct: 0
  },
  {
    id: 4,
    question: "Желдің бағытын анықтайтын құрал:",
    options: ["А) Компас", "Б) Флюгер", "В) Барометр", "Г) Сегмент"],
    correct: 1
  },
  {
    id: 5,
    question: "Ауа температурасы тәулік бойы ең төмен болатын уақыт:",
    options: ["А) Күн батар алдында", "Б) Таңертең күн шықпай тұрып", "В) Түн ортасында", "Г) Түстен кейін"],
    correct: 1
  }
];

export default function App() {
  // Settings & Config state
  const [subject, setSubject] = useState("География");
  const [grade, setGrade] = useState("7 сынып");
  const [topic, setTopic] = useState("Атмосфера");
  const [p1Name, setP1Name] = useState("Алишер");
  const [p2Name, setP2Name] = useState("Дильназ");
  const [timeLimit, setTimeLimit] = useState(30);
  const [maxRounds, setMaxRounds] = useState(5);
  const [damageAmount, setDamageAmount] = useState(20);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Video URLs
  const [videos] = useState(DEFAULT_VIDEOS);

  // Questions state
  const [p1Questions] = useState(DEFAULT_QUESTIONS_P1);
  const [p2Questions] = useState(DEFAULT_QUESTIONS_P2);

  // Game flow state: 'setup' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState('setup');
  const [currentRound, setCurrentRound] = useState(1);
  
  // Health points
  const [p1Hp, setP1Hp] = useState(100);
  const [p2Hp, setP2Hp] = useState(100);

  // Questions index
  const [p1QIndex, setP1QIndex] = useState(0);
  const [p2QIndex, setP2QIndex] = useState(0);

  // Player answer state
  const [p1SelectedAnswer, setP1SelectedAnswer] = useState(null);
  const [p2SelectedAnswer, setP2SelectedAnswer] = useState(null);
  const [p1Answered, setP1Answered] = useState(false);
  const [p2Answered, setP2Answered] = useState(false);

  // Timers
  const [p1TimeLeft, setP1TimeLeft] = useState(30);
  const [p2TimeLeft, setP2TimeLeft] = useState(30);

  // Current active video animation key: 'idle' | 'p1Attack' | 'p2Attack' | 'p1Win' | 'p2Win'
  const [activeAnim, setActiveAnim] = useState('idle');

  // Floating damage indicators
  const [floatingDamage, setFloatingDamage] = useState(null); // { target: 'p1'|'p2', text: '-20 HP' }

  // Sound Synth via Web Audio API
  const audioCtxRef = useRef(null);

  // Latest values for delayed callbacks, which would otherwise read stale state
  const hpRef = useRef({ p1: 100, p2: 100 });
  const answersRef = useRef({ 1: null, 2: null });
  const timeoutsRef = useRef([]);

  const schedule = (fn, ms) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  };

  const clearScheduled = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setFloatingDamage(null);
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.setValueAtTime(120, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.25, now + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          o.start(now + idx * 0.1);
          o.stop(now + 1.2);
        });
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const startGame = () => {
    clearScheduled();
    hpRef.current = { p1: 100, p2: 100 };
    setGameState('playing');
    setCurrentRound(1);
    setP1Hp(100);
    setP2Hp(100);
    setP1QIndex(0);
    setP2QIndex(0);
    resetRoundState();
  };

  const openSetup = () => {
    clearScheduled();
    setGameState('setup');
  };

  const resetRoundState = () => {
    answersRef.current = { 1: null, 2: null };
    setP1SelectedAnswer(null);
    setP2SelectedAnswer(null);
    setP1Answered(false);
    setP2Answered(false);
    setP1TimeLeft(timeLimit);
    setP2TimeLeft(timeLimit);
    setActiveAnim('idle');
  };

  // Timers countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      if (!p1Answered && p1TimeLeft > 0) {
        setP1TimeLeft(p1TimeLeft - 1);
        if (p1TimeLeft <= 1) handlePlayerAnswer(1, -1);
      }

      if (!p2Answered && p2TimeLeft > 0) {
        setP2TimeLeft(p2TimeLeft - 1);
        if (p2TimeLeft <= 1) handlePlayerAnswer(2, -1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, p1Answered, p2Answered, p1TimeLeft, p2TimeLeft]);

  // Player click answer
  const handlePlayerAnswer = (playerNum, optionIndex) => {
    if (answersRef.current[playerNum] !== null) return;
    answersRef.current[playerNum] = optionIndex;

    const q = playerNum === 1 ? p1Questions[p1QIndex] : p2Questions[p2QIndex];
    const isCorrect = optionIndex === q.correct;

    if (playerNum === 1) {
      setP1SelectedAnswer(optionIndex);
      setP1Answered(true);
    } else {
      setP2SelectedAnswer(optionIndex);
      setP2Answered(true);
    }

    if (isCorrect) playSound('correct');
    else playSound('wrong');

    const { 1: p1Answer, 2: p2Answer } = answersRef.current;

    if (p1Answer !== null && p2Answer !== null) {
      evaluateRoundResults(
        p1Answer === p1Questions[p1QIndex].correct,
        p2Answer === p2Questions[p2QIndex].correct
      );
    }
  };

  const evaluateRoundResults = (p1Correct, p2Correct) => {
    let sequence = [];
    if (p1Correct) sequence.push('p1Attack');
    if (p2Correct) sequence.push('p2Attack');

    if (sequence.length === 0) {
      schedule(advanceRound, 1500);
    } else {
      runAnimationSequence(sequence, 0);
    }
  };

  const runAnimationSequence = (seq, index) => {
    if (index >= seq.length) {
      advanceRound();
      return;
    }

    const currentAnimType = seq[index];
    setActiveAnim(currentAnimType);
    playSound('hit');

    if (currentAnimType === 'p1Attack') {
      hpRef.current.p2 = Math.max(0, hpRef.current.p2 - damageAmount);
      setP2Hp(hpRef.current.p2);
      setFloatingDamage({ target: 'p2', text: `-${damageAmount} HP` });
    } else if (currentAnimType === 'p2Attack') {
      hpRef.current.p1 = Math.max(0, hpRef.current.p1 - damageAmount);
      setP1Hp(hpRef.current.p1);
      setFloatingDamage({ target: 'p1', text: `-${damageAmount} HP` });
    }

    // Play full attack animation duration without interruptions
    schedule(() => {
      setFloatingDamage(null);
      setActiveAnim('idle');
      schedule(() => {
        runAnimationSequence(seq, index + 1);
      }, 300);
    }, 3800);
  };

  const advanceRound = () => {
    const { p1, p2 } = hpRef.current;
    if (currentRound >= maxRounds || p1 <= 0 || p2 <= 0) {
      endGame(p1, p2);
      return;
    }

    setCurrentRound((prev) => prev + 1);
    setP1QIndex((prev) => (prev + 1) % p1Questions.length);
    setP2QIndex((prev) => (prev + 1) % p2Questions.length);
    resetRoundState();
  };

  const endGame = (finalP1Hp, finalP2Hp) => {
    playSound('win');
    if (finalP1Hp > finalP2Hp) {
      setActiveAnim('p1Win');
    } else if (finalP2Hp > finalP1Hp) {
      setActiveAnim('p2Win');
    } else {
      setActiveAnim('idle');
    }
    setGameState('gameover');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col select-none overflow-x-hidden">
      {/* NAVBAR */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-30 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-red-600 to-amber-500 p-2 rounded-xl shadow-lg flex items-center justify-center">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              БІЛІМ ШАЙҚАСЫ — 1 VS 1
            </h1>
            <p className="text-xs text-slate-400">
              {subject} • {grade} • «{topic}»
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-slate-700 text-slate-300"
            title="Дыбысты қосу/өшіру"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>

          {gameState === 'setup' ? (
            <button
              onClick={startGame}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>ШАЙҚАСТЫ БАСТАУ</span>
            </button>
          ) : (
            <button
              onClick={openSetup}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl font-bold border border-slate-700 transition"
            >
              <Settings className="w-4 h-4" />
              <span>Мұғалім панелі</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <main className="flex-1 flex flex-col relative w-full max-w-7xl mx-auto p-4 lg:p-6 gap-4">
        
        {/* SETUP SCREEN */}
        {gameState === 'setup' && (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-4xl bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                  Битва Знаний: Настройка Арены
                </h2>
                <p className="text-slate-400">Ойын параметрлері мен қатысушыларды реттеңіз</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Сабақ мәліметтері
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Пән</label>
                    <input 
                      type="text" 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Сынып</label>
                    <input 
                      type="text" 
                      value={grade} 
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Тақырып</label>
                    <input 
                      type="text" 
                      value={topic} 
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" 
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Оқушылар мен Баптаулар
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">1-ші Оқушы (Сол жақ)</label>
                      <input 
                        type="text" 
                        value={p1Name} 
                        onChange={(e) => setP1Name(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">2-ші Оқушы (Оң жақ)</label>
                      <input 
                        type="text" 
                        value={p2Name} 
                        onChange={(e) => setP2Name(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Раунд саны</label>
                      <input 
                        type="number" 
                        value={maxRounds} 
                        min={1}
                        onChange={(e) => setMaxRounds(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Уақыт (сек)</label>
                      <input 
                        type="number" 
                        value={timeLimit} 
                        min={1}
                        onChange={(e) => setTimeLimit(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-orange-900/40 text-lg flex items-center space-x-3 transition transform active:scale-95"
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>ШАЙҚАСТЫ БАСТАУ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PLAYING / GAMEOVER SCREEN */}
        {gameState !== 'setup' && (
          <div className="flex flex-col gap-4 flex-1">
            
            {/* TOP HUD: HEALTH BARS & VS */}
            <div className="grid grid-cols-12 gap-4 items-center bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
              
              {/* Player 1 HUD */}
              <div className="col-span-5 flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-red-400 flex items-center gap-1.5 text-lg">
                    <User className="w-5 h-5" /> {p1Name}
                  </span>
                  <span className="text-sm font-bold text-slate-300">{p1Hp} / 100 HP</span>
                </div>
                <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500 relative"
                    style={{ width: `${Math.max(0, p1Hp)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* VS Center Badge */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <div className="text-2xl font-black italic tracking-widest bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 bg-clip-text text-transparent animate-bounce">
                  VS
                </div>
                <div className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                  Раунд {currentRound} / {maxRounds}
                </div>
              </div>

              {/* Player 2 HUD */}
              <div className="col-span-5 flex flex-col space-y-1">
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="font-extrabold text-blue-400 flex items-center gap-1.5 text-lg">
                    {p2Name} <User className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-bold text-slate-300">{p2Hp} / 100 HP</span>
                </div>
                <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden p-0.5 border border-slate-700 flex justify-end">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500 relative"
                    style={{ width: `${Math.max(0, p2Hp)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

            </div>

            {/* BATTLE ARENA FRAME (16:9) WITH SEAMLESS PRELOADED IFRAMES */}
            <div className="relative w-full aspect-video max-h-[500px] bg-black rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl flex items-center justify-center">
              
              {/* Floating Damage Numbers */}
              {floatingDamage && (
                <div className={`absolute z-30 font-black text-5xl text-red-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)] animate-bounce ${
                  floatingDamage.target === 'p1' ? 'left-1/4 top-1/3' : 'right-1/4 top-1/3'
                }`}>
                  {floatingDamage.text}
                </div>
              )}

              {/* Stacked Videos for Zero Black Screen / Instant Seamless Switching */}
              <div className="absolute inset-0 w-full h-full">
                {Object.keys(videos).map((key) => {
                  const isVisible = activeAnim === key;

                  return (
                    <iframe
                      // The player loops from load, so remount to start a clip from its first frame
                      key={key === 'idle' ? key : `${key}-${isVisible}`}
                      src={videos[key]}
                      className={`absolute inset-0 w-full h-full border-0 pointer-events-none transition-opacity duration-300 ${
                        isVisible ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                      title={`Video-${key}`}
                      allow="autoplay"
                    />
                  );
                })}
              </div>

              {/* VICTORY RESULT PANEL AT BOTTOM (No Video Overlay, Fully Clear Screen) */}
              {gameState === 'gameover' && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-900/90 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/50">
                      <Trophy className="w-7 h-7 animate-bounce" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        {p1Hp === p2Hp ? "ОЙЫН ТЕҢ АЯҚТАЛДЫ!" : "ЖЕҢІМПАЗ АНЫҚТАЛДЫ!"}
                      </h3>
                      <p className="text-base font-extrabold text-white">
                        {p1Hp === p2Hp ? "Тең есеп!" : `👑 ${p1Hp > p2Hp ? p1Name : p2Name} 👑`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={startGame}
                      className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Қайта ойнау</span>
                    </button>
                    <button
                      onClick={openSetup}
                      className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Баптаулар</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM: SIMULTANEOUS Q&A PANELS */}
            {gameState === 'playing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* PLAYER 1 QUESTION PANEL */}
                <div className="bg-slate-900/90 border-2 border-red-900/40 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-3 py-1 rounded-lg border border-red-800/50">
                        {p1Name} (Сол жақ)
                      </span>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-red-400" />
                        <span className="font-bold text-white">{p1TimeLeft}с</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-4 min-h-[3rem] flex items-center">
                      {p1Questions[p1QIndex].question}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {p1Questions[p1QIndex].options.map((opt, idx) => {
                      const isSelected = p1SelectedAnswer === idx;
                      const isCorrectAnswer = idx === p1Questions[p1QIndex].correct;
                      
                      let btnStyle = "bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200";
                      if (p1Answered) {
                        if (isCorrectAnswer) btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-300";
                        else if (isSelected) btnStyle = "bg-red-600/30 border-red-500 text-red-300";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={p1Answered}
                          onClick={() => handlePlayerAnswer(1, idx)}
                          className={`p-3 rounded-xl border text-sm font-semibold transition text-left flex items-center justify-between ${btnStyle}`}
                        >
                          <span className="min-w-0 break-words">{opt}</span>
                          {p1Answered && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-1" />}
                          {p1Answered && isSelected && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PLAYER 2 QUESTION PANEL */}
                <div className="bg-slate-900/90 border-2 border-blue-900/40 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-800/50">
                        {p2Name} (Оң жақ)
                      </span>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-white">{p2TimeLeft}с</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-4 min-h-[3rem] flex items-center">
                      {p2Questions[p2QIndex].question}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {p2Questions[p2QIndex].options.map((opt, idx) => {
                      const isSelected = p2SelectedAnswer === idx;
                      const isCorrectAnswer = idx === p2Questions[p2QIndex].correct;
                      
                      let btnStyle = "bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200";
                      if (p2Answered) {
                        if (isCorrectAnswer) btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-300";
                        else if (isSelected) btnStyle = "bg-red-600/30 border-red-500 text-red-300";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={p2Answered}
                          onClick={() => handlePlayerAnswer(2, idx)}
                          className={`p-3 rounded-xl border text-sm font-semibold transition text-left flex items-center justify-between ${btnStyle}`}
                        >
                          <span className="min-w-0 break-words">{opt}</span>
                          {p2Answered && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-1" />}
                          {p2Answered && isSelected && !isCorrectAnswer && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}