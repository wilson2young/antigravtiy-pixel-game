import { useState, useEffect } from 'react';
import './index.css';
import { useTranslation } from './i18n';
import LanguageSelector from './components/LanguageSelector';

const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || 'mock';
const THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '3', 10);
const QUESTION_COUNT = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5', 10);

export default function App() {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [gameState, setGameState] = useState('HOME'); // HOME, LOADING, PLAYING, SUBMITTING, RESULT
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [resultData, setResultData] = useState(null);
  const [gatekeepers, setGatekeepers] = useState([]);

  useEffect(() => {
    // 💡 预先生成 100 张关主图片的 URL 加入内存
    const images = Array.from({ length: 100 }).map((_, i) => 
      `https://api.dicebear.com/7.x/pixel-art/svg?seed=Boss${i}`
    );
    // 乱序以达成每次游戏关主都随机且不同
    const shuffledImages = images.sort(() => 0.5 - Math.random());
    setGatekeepers(shuffledImages);

    // 隐式在后台拉取图片资源进浏览器缓存
    shuffledImages.slice(0, QUESTION_COUNT).forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  const startGame = async () => {
    if (!userId.trim()) return alert('INSERT COIN (ID)');
    setGameState('LOADING');
    try {
      let data;
      if (API_URL === 'mock') {
        data = Array.from({length: QUESTION_COUNT}).map((_, i) => ({
          id: `q${i+1}`,
          text: `Sample Pixel Question ${i+1}: What is 1+1?`,
          options: { A: '1', B: '2', C: '3', D: '4' }
        }));
        await new Promise(r => setTimeout(r, 800));
      } else {
        const res = await fetch(`${API_URL}?count=${QUESTION_COUNT}`);
        data = await res.json();
      }
      setQuestions(data);
      setGameState('PLAYING');
      setCurrentQIndex(0);
      setAnswers({});
    } catch (err) {
      alert('Network Error.');
      setGameState('HOME');
    }
  };

  const handleAnswer = (optionKey) => {
    const currentQ = questions[currentQIndex];
    const newAnswers = { ...answers, [currentQ.id]: optionKey };
    setAnswers(newAnswers);

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    setGameState('SUBMITTING');
    try {
      let data;
      if (API_URL === 'mock') {
        data = { success: true, score: QUESTION_COUNT, passed: true };
        await new Promise(r => setTimeout(r, 800));
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({
            id: userId,
            answers: finalAnswers,
            threshold: THRESHOLD
          }),
        });
        data = await res.json();
      }
      setResultData(data);
      setGameState('RESULT');
    } catch (err) {
      alert('Score calculation failed.');
      setGameState('PLAYING'); // 给玩家重试的机会
    }
  };

  return (
    <div className="pixel-box">
      {gameState === 'HOME' && (
        <>
          <LanguageSelector />
          <h1 style={{ color: 'var(--accent)', margin: '10px 0', fontSize: '24px' }}>{t('home.title')}</h1>
          <p style={{ fontSize: '10px', margin: '10px 0 30px 0' }}>{t('home.subtitle')}</p>
          <input
            className="pixel-input"
            placeholder={t('home.inputPlaceholder')}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button className="pixel-btn" onClick={startGame}>{t('common.start')}</button>
        </>
      )}

      {gameState === 'LOADING' && <p>{t('game.loading')}</p>}
      {gameState === 'SUBMITTING' && <p>{t('game.submitting')}</p>}

      {gameState === 'PLAYING' && questions.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '10px' }}>
            <span>{t('game.player')}: {userId.toUpperCase()}</span>
            <span>{t('game.stage')} {currentQIndex + 1}/{QUESTION_COUNT}</span>
          </div>
          
          <img 
            src={gatekeepers[currentQIndex]} 
            alt="Gatekeeper" 
            style={{ width: '120px', height: '120px', background: '#e0e0e0', border: '2px solid black', marginBottom: '20px' }}
          />

          <p style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
            {questions[currentQIndex].text}
          </p>

          <div className="options-grid">
            {['A', 'B', 'C', 'D'].map(opt => (
              <button 
                key={opt} 
                className="pixel-btn" 
                style={{ background: '#2196F3' }}
                onClick={() => handleAnswer(opt)}
              >
                {opt}: {questions[currentQIndex].options[opt]}
              </button>
            ))}
          </div>
        </>
      )}

      {gameState === 'RESULT' && resultData && (
        <>
          <h2 style={{ color: resultData.passed ? '#00ff00' : '#ff0000', margin: '10px 0' }}>
            {resultData.passed ? t('result.cleared') : t('result.gameOver')}
          </h2>
          <p className="result-text" style={{ margin: '15px 0', fontSize: '14px' }}>{t('result.score')}: {resultData.score} / {QUESTION_COUNT}</p>
          <p className="result-text" style={{ margin: '15px 0', fontSize: '10px' }}>{t('result.threshold')}: {THRESHOLD}</p>
          <button className="pixel-btn" onClick={() => { setGameState('HOME'); setUserId(''); }}>{t('common.playAgain')}</button>
        </>
      )}
    </div>
  );
}
