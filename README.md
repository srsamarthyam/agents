# Tic-Tac-Toe AI Arena

A web-based tic-tac-toe game with multiple AI agent skill levels, analyzer and strategy agents, and optional LLM integration.

## Features

### 🎮 Game Environment
- Interactive 3x3 tic-tac-toe board
- Real-time game status updates
- Move history logging
- Visual feedback for winning combinations

### 🤖 AI Player Agents (6 Skill Levels)
1. **Beginner** - Makes random moves
2. **Easy** - Takes winning moves when available
3. **Medium** - Wins or blocks opponent threats
4. **Hard** - Strategic play with center/corner control
5. **Expert** - Advanced fork prevention
6. **Unbeatable** - Perfect minimax algorithm

### 🧠 Support Agents
- **Analyzer Agent**: Analyzes current game state, identifies threats and opportunities
- **Strategy Agent**: Provides move suggestions and curriculum-based learning tips

### 🌐 LLM Integration
- Connect to local LLM servers (Ollama, etc.)
- Enhanced analysis and strategy suggestions from LLM
- Configurable API endpoint and model name

## Usage

### Quick Start
1. Open `index.html` in a web browser
2. Select an AI difficulty level
3. Choose your side (X goes first)
4. Optionally enable Analyzer and/or Strategy agents
5. Start playing!

### LLM Setup (Optional)
1. Install and run a local LLM server (e.g., Ollama):
   ```bash
   # Example with Ollama
   ollama serve
   ollama run llama2
   ```
2. In the game UI:
   - Set LLM URL (default: `http://localhost:11434`)
   - Set model name (default: `llama2`)
   - Click "Test Connection"
3. Enable Analyzer/Strategy agents to see LLM-enhanced insights

### Curriculum-Based Learning
Each AI level includes specific learning tips:
- **Beginner**: Learn basic win/block patterns
- **Easy**: Prioritize immediate opportunities
- **Medium**: Understand defensive play
- **Hard**: Master positional strategy
- **Expert**: Learn advanced concepts like forks
- **Unbeatable**: Study perfect play patterns

## Files Structure
```
/workspace
├── index.html      # Main HTML page
├── styles.css      # Styling and animations
├── game.js         # Game logic and AI agents
└── README.md       # This file
```

## Technical Details

### AI Implementation
- All AI agents run client-side in JavaScript
- No server required for basic gameplay
- Minimax algorithm for unbeatable mode with depth scoring

### LLM Integration
- Uses standard REST API format
- Compatible with Ollama and similar local LLM servers
- Graceful fallback when LLM is unavailable

## Browser Compatibility
Works in all modern browsers (Chrome, Firefox, Safari, Edge).
