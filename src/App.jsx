import React, { useState, useEffect, useRef } from 'react';
import Chessground from 'react-chessground';
import { Chess } from 'chess.js';
import { initStrudel } from '@strudel/web';
import { generateStrudelCode } from './engine/strudelMapper';
import { CITIES } from './constants/cities';
import 'react-chessground/dist/assets/chessground.base.css';
import 'react-chessground/dist/assets/chessground.brown.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [currentCity, setCurrentCity] = useState(CITIES.detroit);
  const [strudel, setStrudel] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const stockfish = useRef(null);

  // Inicializar Strudel e Stockfish
  const startEngine = async () => {
    const s = await initStrudel();
    setStrudel(s);
    
    // IA - Usando worker via CDN para evitar problemas de path
    stockfish.current = new Worker('https://cdn.jsdelivr.net/npm/stockfish.js@0.2.0/stockfish.js');
    stockfish.current.onmessage = (e) => {
      if (e.data.includes('bestmove')) {
        const move = e.data.split(' ')[1];
        makeMove(move.substring(0, 2), move.substring(2, 4));
      }
    };
    stockfish.current.postMessage('uci');
    
    setIsStarted(true);
  };

  const makeMove = (from, to) => {
    const newGame = new Chess(game.fen());
    const move = newGame.move({ from, to, promotion: 'q' });
    if (move) {
      setGame(newGame);
      if (newGame.turn() === 'b') {
        stockfish.current.postMessage(`position fen ${newGame.fen()}`);
        stockfish.current.postMessage('go depth 10');
      }
    }
  };

  useEffect(() => {
    if (isStarted && strudel) {
      const code = generateStrudelCode(game, currentCity);
      strudel.evaluate(code);
    }
  }, [game, isStarted, currentCity]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 tracking-widest" style={{color: currentCity.colors.primary}}>
        CHIKEN CHESS: {currentCity.name.toUpperCase()}
      </h1>

      {!isStarted ? (
        <button 
          onClick={startEngine}
          className="px-12 py-6 border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition-all text-2xl font-bold"
        >
          INICIAR PERFORMANCE
        </button>
      ) : (
        <div className="flex gap-8 items-start">
          <div className="border-8 border-gray-900 shadow-2xl">
            <Chessground
              width={540}
              height={540}
              fen={game.fen()}
              onMove={makeMove}
              orientation={game.turn() === 'w' ? 'white' : 'black'}
            />
          </div>
          
          <div className="w-80 bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl mb-4 text-cyan-400">LIVE CODING</h2>
            <pre className="text-xs font-mono text-green-500 bg-black p-4 rounded h-96 overflow-auto">
              {generateStrudelCode(game, currentCity)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-gray-500 font-mono">
        STATUS: {game.inCheck() ? "!!! CHECK !!!" : "SYSTEM STABLE"}
      </div>
    </div>
  );
}

export default App;