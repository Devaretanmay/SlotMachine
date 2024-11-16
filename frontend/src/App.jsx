import React, { useState, useEffect } from 'react';
import './App.css';

const SYMBOLS = {
  'A': { emoji: '7️⃣', name: 'Lucky Seven', color: '#4CAF50', multiplier: 10 },
  'B': { emoji: '⭐', name: 'Star', color: '#FFC107', multiplier: 5 },
  'C': { emoji: '💎', name: 'Diamond', color: '#2196F3', multiplier: 3 },
  'D': { emoji: '👑', name: 'Crown', color: '#9C27B0', multiplier: 2 }
};

const PAYLINES = [
  { id: 1, name: 'Top Row' },
  { id: 2, name: 'Middle Row' },
  { id: 3, name: 'Bottom Row' },
  { id: 4, name: 'Diagonal ↘' },
  { id: 5, name: 'Diagonal ↗' }
];

const MULTIPLIERS = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 5, label: '5x' },
  { value: 10, label: '10x' }
];

// Add sound constants
const SOUNDS = {
  spin: new Audio('/sounds/spin.mp3'),
  win: new Audio('/sounds/win.mp3'),
  click: new Audio('/sounds/click.mp3')
};

// Preload sounds
Object.values(SOUNDS).forEach(sound => {
  sound.load();
  sound.volume = 0.5; // Set default volume
});

const playSound = (soundName) => {
  try {
    const sound = SOUNDS[soundName];
    if (sound) {
      sound.currentTime = 0; // Reset sound to start
      sound.play().catch(err => console.log('Sound play prevented:', err));
    }
  } catch (error) {
    console.log('Sound error:', error);
  }
};

function App() {
  const [balance, setBalance] = useState(1000.00);
  const [betPerLine, setBetPerLine] = useState(1.00);
  const [activeLines, setActiveLines] = useState(3);
  const [lastWin, setLastWin] = useState(0);
  const [totalBet, setTotalBet] = useState(betPerLine * activeLines);
  const [grid, setGrid] = useState(Array(3).fill(Array(3).fill('D')));
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningLines, setWinningLines] = useState([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [spinHistory, setSpinHistory] = useState([]);
  const [showPaytable, setShowPaytable] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoPlayCount, setAutoPlayCount] = useState(0);
  const [maxAutoPlays] = useState(50); // Maximum auto-plays allowed
  const [multiplier, setMultiplier] = useState(1);

  useEffect(() => {
    const newTotalBet = Number((betPerLine * activeLines * multiplier).toFixed(2));
    setTotalBet(newTotalBet);
  }, [betPerLine, activeLines, multiplier]);

  const handleBetChange = (amount) => {
    const newBet = Math.max(0.20, Math.min(100, betPerLine + amount));
    setBetPerLine(Number(newBet.toFixed(2)));
  };

  const handleAutoPlayToggle = () => {
    if (autoPlay) {
      // Stop autoplay
      setAutoPlay(false);
      setAutoPlayCount(0);
    } else {
      // Start autoplay
      setAutoPlay(true);
      setAutoPlayCount(0);
      handleSpin();
    }
  };

  const handleSpin = async () => {
    if (isSpinning || totalBet > balance) {
      setAutoPlay(false);
      setAutoPlayCount(0);
      return;
    }
    
    setIsSpinning(true);
    setWinningLines([]);
    setLastWin(0);

    if (!isMuted) {
      playSound('spin');
    }

    // Deduct bet
    setBalance(prev => Number((prev - totalBet).toFixed(2)));

    // Spinning animation
    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      setGrid(prevGrid => 
        prevGrid.map(row => 
          row.map(() => {
            const symbols = Object.keys(SYMBOLS);
            return symbols[Math.floor(Math.random() * symbols.length)];
          })
        )
      );
    }, 100);

    try {
      const response = await fetch('http://localhost:8080/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalBet })
      });

      const data = await response.json();

      // Stop animation and update state
      setTimeout(() => {
        clearInterval(spinInterval);
        setGrid(data.grid);
        setBalance(data.balance);
        
        if (data.winnings > 0) {
          setLastWin(data.winnings);
          // Highlight winning lines animation
          highlightWinningLines(data.grid);
          if (data.winnings > 0 && !isMuted) {
            playSound('win');
          }
        }
        
        // Add to history
        setSpinHistory(prev => [{
          grid: data.grid,
          win: data.winnings,
          bet: totalBet,
          timestamp: new Date()
        }, ...prev].slice(0, 10));

        setIsSpinning(false);

        if (autoPlay && balance >= totalBet) {
          if (autoPlayCount >= maxAutoPlays) {
            setAutoPlay(false);
            setAutoPlayCount(0);
          } else {
            setAutoPlayCount(prev => prev + 1);
            setTimeout(handleSpin, 1000);
          }
        }
      }, spinDuration);

    } catch (error) {
      setAutoPlay(false);
      setAutoPlayCount(0);
      clearInterval(spinInterval);
      setIsSpinning(false);
      console.error('Spin failed:', error);
    }
  };

  const highlightWinningLines = (grid) => {
    const winLines = [];
    
    // Check rows
    grid.forEach((row, i) => {
      if (row.every(symbol => symbol === row[0])) {
        winLines.push(i + 1);
      }
    });

    // Check diagonals
    if (grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
      winLines.push(4);
    }
    if (grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
      winLines.push(5);
    }

    setWinningLines(winLines);
  };

  return (
    <div className="App">
      <div className="slot-machine">
        <div className="machine-header">
          <h1>GOLDEN VEGAS SLOTS</h1>
          <div className="controls-top">
            <button 
              className={`sound-button ${isMuted ? 'muted' : ''}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <div className="balance-display">
              <span>BALANCE</span>
              <h2>${balance.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        <div className="game-container">
          <div className="paylines left">
            {PAYLINES.slice(0, 3).map(line => (
              <div 
                key={line.id}
                className={`payline ${activeLines >= line.id ? 'active' : ''} 
                           ${winningLines.includes(line.id) ? 'winning' : ''}`}
              >
                {line.id}
              </div>
            ))}
          </div>

          <div className="slot-grid">
            {grid.map((row, i) => (
              <div key={i} className="row">
                {row.map((symbol, j) => (
                  <div 
                    key={`${i}-${j}`}
                    className={`symbol ${isSpinning ? 'spinning' : ''} 
                              ${winningLines.includes(i + 1) ? 'winning' : ''}`}
                    style={{ '--symbol-color': SYMBOLS[symbol].color }}
                  >
                    {SYMBOLS[symbol].emoji}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="paylines right">
            {PAYLINES.slice(3).map(line => (
              <div 
                key={line.id}
                className={`payline ${activeLines >= line.id ? 'active' : ''}
                           ${winningLines.includes(line.id) ? 'winning' : ''}`}
              >
                {line.id}
              </div>
            ))}
          </div>
        </div>

        <div className="controls-panel">
          <div className="bet-controls">
            <div className="lines-selector">
              <label>LINES</label>
              <div className="lines-buttons">
                {[1, 3, 5].map(num => (
                  <button 
                    key={num}
                    className={activeLines === num ? 'active' : ''}
                    onClick={() => setActiveLines(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="bet-amount">
              <label>BET PER LINE</label>
              <div className="bet-adjuster">
                <button onClick={() => handleBetChange(-0.20)}>-</button>
                <span>${betPerLine.toFixed(2)}</span>
                <button onClick={() => handleBetChange(0.20)}>+</button>
              </div>
            </div>

            <div className="multiplier-selector">
              <label>MULTIPLIER</label>
              <div className="multiplier-buttons">
                {MULTIPLIERS.map(({ value, label }) => (
                  <button 
                    key={value}
                    className={`multiplier-button ${multiplier === value ? 'active' : ''}`}
                    onClick={() => setMultiplier(value)}
                    disabled={isSpinning}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="action-controls">
            <button 
              className="spin-button"
              onClick={handleSpin}
              disabled={isSpinning || totalBet > balance}
            >
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </button>
            
            <button 
              className={`autoplay-button ${autoPlay ? 'active' : ''}`}
              onClick={handleAutoPlayToggle}
              disabled={totalBet > balance}
            >
              {autoPlay ? (
                <>
                  STOP AUTO
                  <div className="autoplay-counter">{autoPlayCount}</div>
                </>
              ) : 'AUTO PLAY'}
            </button>
          </div>

          <div className="game-stats">
            <div className="total-bet">
              <label>TOTAL BET</label>
              <span>${totalBet.toFixed(2)}</span>
            </div>
            <div className="last-win">
              <label>LAST WIN</label>
              <span className={lastWin > 0 ? 'winning' : ''}>
                ${lastWin.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button 
        className="paytable-button"
        onClick={() => setShowPaytable(!showPaytable)}
      >
        PAYTABLE
      </button>

      {showPaytable && (
        <div className="paytable-modal">
          <h2>PAYTABLE</h2>
          {Object.entries(SYMBOLS).map(([key, value]) => (
            <div key={key} className="paytable-row">
              <div className="symbol-preview" style={{ '--symbol-color': value.color }}>
                {value.emoji}
              </div>
              <div className="symbol-info">
                <h3>{value.name}</h3>
                <p>{value.multiplier}x Multiplier</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="spin-history">
        {spinHistory.map((spin, index) => (
          <div key={index} className="history-item">
            <span>Bet: ${spin.bet}</span>
            <span className={spin.win > 0 ? 'winning' : ''}>
              Win: ${spin.win}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 