# Slot Machine Game 🎰

A modern slot machine game built with React (frontend) and Go (backend), featuring animations and sound effects.

## 🌟 Features

- Interactive slot machine with animated spins
- Real-time balance tracking
- Multiple winning combinations:
  - Horizontal lines
  - Vertical lines
  - Diagonal lines
- Sound effects and animations
- Mute/Unmute functionality
- Responsive design

## 🛠️ Technology Stack

### Frontend
- React 18.2.0
- CSS3 with custom animations
- Modern JavaScript (ES6+)

### Backend
- Go 1.21
- Gorilla Mux for routing
- CORS support

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Go (v1.21 or higher)
- Git

  
### Installation

1. Clone the repository:bash
git clone https://github.com/yourusername/golden-vegas-slots.git
cd golden-vegas-slots


2. Setup Frontend:
bash
cd frontend
npm install


3. Setup Sound Files:
bash
cd scripts
node downloadSounds.js


4. Start Frontend Development Server:
bash
cd frontend
npm start


5. Start Backend Server:
bash
cd SlotMachine
go run main.go



The frontend will run on `http://localhost:3000`
The backend API will run on `http://localhost:8080`

## 🎮 Game Rules

### Starting Balance
- Players begin with $1000 initial balance

### Symbols and Payouts
- 7️⃣ Lucky Seven (10x multiplier)
- ⭐ Star (5x multiplier)
- 💎 Diamond (3x multiplier)
- 👑 Crown (2x multiplier)

### Winning Combinations
- Three matching symbols in:
  - Horizontal rows
  - Vertical columns
  - Diagonal lines

## 📁 Project Structure

### Frontend
frontend/
├── public/
│ ├── index.html
│ ├── manifest.json
│ └── sounds/
│ ├── spin.mp3
│ ├── win.mp3
│ └── click.mp3
├── src/
│ ├── App.jsx
│ ├── App.css
│ └── index.js
└── package.json

### Backend
SlotMachine/
├── main.go
├── game/
│ └── game.go
├── go.mod
└── go.sum


## 🔧 API Endpoints

- `POST /api/spin` - Place a bet and spin the slots
- `GET /api/balance` - Get current balance

## 🎵 Sound Effects

The game includes the following sound effects:
- Spin sound
- Win sound
- Click sound

Sound effects can be toggled using the sound button (🔊/🔇) in the game interface.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is free to use. 

## 🔍 Notes
- The backend server must be running for the game to function properly
- Ensure all sound files are properly placed in the `/public/sounds` directory
- The game requires JavaScript to be enabled in the browser
