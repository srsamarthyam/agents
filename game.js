// Tic-Tac-Toe Game Logic with AI Agents

class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.humanPlayer = 'X';
        this.aiPlayer = 'O';
        this.aiLevel = 'beginner';
        this.moveHistory = [];
        
        // Winning combinations
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        
        // Initialize UI
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-btn');
        this.aiLevelSelect = document.getElementById('ai-level');
        this.playerSideSelect = document.getElementById('player-side');
        this.gameLog = document.getElementById('game-log');
        
        // Analyzer and Strategy agents
        this.analyzerEnabled = false;
        this.strategyEnabled = false;
        this.llmUrl = 'http://localhost:11434';
        this.llmModel = 'llama2';
        
        this.init();
    }
    
    init() {
        this.cells.forEach(cell => cell.addEventListener('click', (e) => this.handleCellClick(e)));
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.aiLevelSelect.addEventListener('change', (e) => this.aiLevel = e.target.value);
        this.playerSideSelect.addEventListener('change', (e) => this.setPlayerSide(e.target.value));
        
        // LLM Settings
        document.getElementById('test-llm').addEventListener('click', () => this.testLLMConnection());
        document.getElementById('enable-analyzer').addEventListener('change', (e) => {
            this.analyzerEnabled = e.target.checked;
            document.getElementById('analysis-panel').classList.toggle('hidden', !this.analyzerEnabled);
        });
        document.getElementById('enable-strategy').addEventListener('change', (e) => {
            this.strategyEnabled = e.target.checked;
            document.getElementById('strategy-panel').classList.toggle('hidden', !this.strategyEnabled);
        });
        
        this.logMessage('System', 'Game initialized. Select an opponent and start playing!');
    }
    
    setPlayerSide(side) {
        this.humanPlayer = side;
        this.aiPlayer = side === 'X' ? 'O' : 'X';
        this.resetGame();
    }
    
    handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        if (!this.gameActive || this.board[index] !== null) {
            return;
        }
        
        // Human move
        this.makeMove(index, this.humanPlayer);
        
        if (this.gameActive) {
            // AI move with delay
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.moveHistory.push({ player, index });
        
        // Update UI
        const cell = this.cells[index];
        cell.textContent = player;
        cell.classList.add('taken', player.toLowerCase());
        
        // Log move
        const moveName = player === this.humanPlayer ? 'You' : `AI (${this.aiLevel})`;
        this.logMessage(moveName, `Played at position ${index + 1}`, player === this.humanPlayer ? 'player' : 'ai');
        
        // Check game state
        if (this.checkWin(player)) {
            this.endGame(false, player);
        } else if (this.checkDraw()) {
            this.endGame(true);
        } else {
            this.currentPlayer = player === 'X' ? 'O' : 'X';
            this.statusDisplay.textContent = `${this.currentPlayer}'s turn`;
            
            // Update analysis if enabled
            if (this.analyzerEnabled || this.strategyEnabled) {
                this.updateAgents();
            }
        }
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        
        switch (this.aiLevel) {
            case 'beginner':
                move = this.getBeginnerMove();
                break;
            case 'easy':
                move = this.getEasyMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
            case 'expert':
                move = this.getExpertMove();
                break;
            case 'unbeatable':
                move = this.getUnbeatableMove();
                break;
            default:
                move = this.getBeginnerMove();
        }
        
        if (move !== null && move !== undefined) {
            this.makeMove(move, this.aiPlayer);
        }
    }
    
    // AI Agent: Beginner - Random moves
    getBeginnerMove() {
        const availableMoves = this.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (availableMoves.length === 0) return null;
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    // AI Agent: Easy - Basic strategy (win if possible, otherwise random)
    getEasyMove() {
        // Check if can win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.aiPlayer;
                if (this.checkWin(this.aiPlayer)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        return this.getBeginnerMove();
    }
    
    // AI Agent: Medium - Win, block, or random
    getMediumMove() {
        // Check if can win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.aiPlayer;
                if (this.checkWin(this.aiPlayer)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // Block opponent win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.humanPlayer;
                if (this.checkWin(this.humanPlayer)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        return this.getBeginnerMove();
    }
    
    // AI Agent: Hard - Win, block, take center, or random
    getHardMove() {
        // Check if can win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.aiPlayer;
                if (this.checkWin(this.aiPlayer)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // Block opponent win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.humanPlayer;
                if (this.checkWin(this.humanPlayer)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // Take center if available
        if (this.board[4] === null) {
            return 4;
        }
        
        // Take corners
        const corners = [0, 2, 6, 8].filter(i => this.board[i] === null);
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        return this.getBeginnerMove();
    }
    
    // AI Agent: Expert - Advanced strategy with fork prevention
    getExpertMove() {
        // Check if can win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.aiPlayer;
                if (this.checkWin(this.aiPlayer)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // Block opponent win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.humanPlayer;
                if (this.checkWin(this.humanPlayer)) {
                    this.board[i] = null;
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // Take center
        if (this.board[4] === null) {
            return 4;
        }
        
        // Block fork - check all moves that would create a fork for opponent
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.humanPlayer;
                if (this.countWinningMoves(this.humanPlayer) > 1) {
                    this.board[i] = null;
                    // Must block this position
                    return i;
                }
                this.board[i] = null;
            }
        }
        
        // Take corners
        const corners = [0, 2, 6, 8].filter(i => this.board[i] === null);
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        return this.getBeginnerMove();
    }
    
    countWinningMoves(player) {
        let count = 0;
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = player;
                if (this.checkWin(player)) {
                    count++;
                }
                this.board[i] = null;
            }
        }
        return count;
    }
    
    // AI Agent: Unbeatable - Minimax algorithm
    getUnbeatableMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.aiPlayer;
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    minimax(board, depth, isMaximizing) {
        // Check terminal states
        if (this.checkWinWithBoard(board, this.aiPlayer)) return 10 - depth;
        if (this.checkWinWithBoard(board, this.humanPlayer)) return depth - 10;
        if (this.checkDrawWithBoard(board)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = this.aiPlayer;
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = this.humanPlayer;
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    checkWinWithBoard(board, player) {
        return this.winningCombinations.some(combination => {
            return combination.every(index => board[index] === player);
        });
    }
    
    checkDrawWithBoard(board) {
        return board.every(cell => cell !== null);
    }
    
    checkWin(player) {
        return this.winningCombinations.some(combination => {
            return combination.every(index => this.board[index] === player);
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== null);
    }
    
    endGame(isDraw, winner = null) {
        this.gameActive = false;
        
        if (isDraw) {
            this.statusDisplay.textContent = "It's a Draw! 🤝";
            this.logMessage('System', 'Game ended in a draw!', 'system');
        } else {
            this.statusDisplay.textContent = `${winner} Wins! 🎉`;
            this.logMessage('System', `${winner} wins the game!`, 'system');
            
            // Highlight winning cells
            this.winningCombinations.forEach(combination => {
                if (combination.every(index => this.board[index] === winner)) {
                    combination.forEach(index => {
                        this.cells[index].classList.add('winning');
                    });
                }
            });
        }
    }
    
    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveHistory = [];
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'x', 'o', 'winning');
        });
        
        this.statusDisplay.textContent = `${this.currentPlayer}'s turn`;
        this.logMessage('System', 'New game started!', 'system');
        
        // Clear analysis panels
        if (this.analyzerEnabled) {
            document.getElementById('analyzer-output').textContent = '';
        }
        if (this.strategyEnabled) {
            document.getElementById('strategy-output').textContent = '';
        }
        
        // If AI goes first
        if (this.humanPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    // Analyzer Agent - Analyzes current game state
    async analyzeGameState() {
        const analysis = {
            currentPlayer: this.currentPlayer,
            totalMoves: this.moveHistory.length,
            aiLevel: this.aiLevel,
            boardState: this.board.map((val, i) => val ? `${val}@${i}` : null).filter(v => v).join(', ') || 'Empty',
            threats: [],
            opportunities: []
        };
        
        // Find immediate threats (opponent can win next move)
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.humanPlayer;
                if (this.checkWin(this.humanPlayer)) {
                    analysis.threats.push(`Position ${i + 1} is a threat!`);
                }
                this.board[i] = null;
            }
        }
        
        // Find opportunities (AI can win next move)
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = this.aiPlayer;
                if (this.checkWin(this.aiPlayer)) {
                    analysis.opportunities.push(`Position ${i + 1} is a winning move!`);
                }
                this.board[i] = null;
            }
        }
        
        // Generate natural language analysis
        let analysisText = `📊 **Game State Analysis**\n\n`;
        analysisText += `• Moves played: ${this.moveHistory.length}\n`;
        analysisText += `• Current turn: ${this.currentPlayer}\n`;
        analysisText += `• AI Level: ${this.aiLevel}\n\n`;
        
        if (analysis.threats.length > 0) {
            analysisText += `⚠️ **Threats Detected:**\n${analysis.threats.join('\n')}\n\n`;
        }
        
        if (analysis.opportunities.length > 0) {
            analysisText += `✅ **Winning Opportunities:**\n${analysis.opportunities.join('\n')}\n\n`;
        }
        
        // Try to enhance with LLM if available
        if (this.isLLMAvailable()) {
            try {
                const llmAnalysis = await this.queryLLM(
                    `Analyze this tic-tac-toe game state. Board: [${this.board.map((v, i) => v || i).join(', ')}]. ` +
                    `Current player: ${this.currentPlayer}. AI level: ${this.aiLevel}. ` +
                    `Provide a brief strategic analysis in 2-3 sentences.`
                );
                if (llmAnalysis) {
                    analysisText += `\n🤖 **AI Insight:**\n${llmAnalysis}`;
                }
            } catch (error) {
                console.log('LLM analysis failed, using basic analysis');
            }
        }
        
        document.getElementById('analyzer-output').innerHTML = analysisText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    
    // Strategy Agent - Suggests next moves
    async suggestStrategy() {
        const suggestions = [];
        const bestMoves = [];
        
        // Calculate best moves based on current AI level logic
        if (this.currentPlayer === this.aiPlayer) {
            let move;
            switch (this.aiLevel) {
                case 'beginner':
                    move = this.getBeginnerMove();
                    suggestions.push('Playing randomly - any available move is fine.');
                    break;
                case 'easy':
                    move = this.getEasyMove();
                    suggestions.push('Looking for immediate winning moves.');
                    break;
                case 'medium':
                    move = this.getMediumMove();
                    suggestions.push('Trying to win or block opponent threats.');
                    break;
                case 'hard':
                    move = this.getHardMove();
                    suggestions.push('Controlling center and corners strategically.');
                    break;
                case 'expert':
                    move = this.getExpertMove();
                    suggestions.push('Advanced play - preventing forks and creating opportunities.');
                    break;
                case 'unbeatable':
                    move = this.getUnbeatableMove();
                    suggestions.push('Perfect play using minimax algorithm.');
                    break;
            }
            if (move !== null && move !== undefined) {
                bestMoves.push(`Best move: Position ${move + 1}`);
            }
        } else {
            // Human's turn - suggest defensive/offensive moves
            // Check for winning moves
            for (let i = 0; i < 9; i++) {
                if (this.board[i] === null) {
                    this.board[i] = this.humanPlayer;
                    if (this.checkWin(this.humanPlayer)) {
                        suggestions.push(`🎯 WIN NOW! Play at position ${i + 1}`);
                        bestMoves.push(i);
                    }
                    this.board[i] = null;
                }
            }
            
            // Check for blocking moves
            for (let i = 0; i < 9; i++) {
                if (this.board[i] === null) {
                    this.board[i] = this.aiPlayer;
                    if (this.checkWin(this.aiPlayer)) {
                        suggestions.push(`🛡️ BLOCK! Opponent threatens position ${i + 1}`);
                        if (bestMoves.length === 0) bestMoves.push(i);
                    }
                    this.board[i] = null;
                }
            }
            
            if (suggestions.length === 0) {
                // Strategic suggestions
                if (this.board[4] === null) {
                    suggestions.push('💡 Center (position 5) is the most valuable square.');
                }
                const availableCorners = [0, 2, 6, 8].filter(i => this.board[i] === null);
                if (availableCorners.length > 0) {
                    suggestions.push(`💡 Consider taking a corner: positions ${availableCorners.map(i => i + 1).join(', ')}`);
                }
            }
        }
        
        let strategyText = `💡 **Strategy Suggestions**\n\n`;
        if (suggestions.length > 0) {
            strategyText += suggestions.join('\n') + '\n\n';
        }
        if (bestMoves.length > 0) {
            strategyText += `🎯 **Recommended:** Position ${bestMoves[0] + 1}\n\n`;
        }
        
        // Add curriculum-based tips
        strategyText += `📚 **Learning Tip:**\n`;
        strategyText += this.getCurriculumTip();
        
        // Try to enhance with LLM if available
        if (this.isLLMAvailable()) {
            try {
                const llmStrategy = await this.queryLLM(
                    `Suggest a strategy for this tic-tac-toe position. Board: [${this.board.map((v, i) => v || i).join(', ')}]. ` +
                    `Player to move: ${this.currentPlayer}. Skill level: ${this.aiLevel}. ` +
                    `Provide one specific strategic recommendation.`
                );
                if (llmStrategy) {
                    strategyText += `\n\n🤖 **AI Coach:**\n${llmStrategy}`;
                }
            } catch (error) {
                console.log('LLM strategy failed, using basic suggestions');
            }
        }
        
        document.getElementById('strategy-output').innerHTML = strategyText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    
    getCurriculumTip() {
        const tips = {
            beginner: 'Focus on completing rows, columns, or diagonals. Don\'t forget to block your opponent!',
            easy: 'Always check if you can win before making other moves. Then check if you need to block.',
            medium: 'Control the center when possible. Corners are more valuable than edges.',
            hard: 'Watch out for "forks" - positions where your opponent can win in two ways.',
            expert: 'Think ahead: consider what happens after your opponent responds to your move.',
            unbeatable: 'The perfect strategy combines offense, defense, and positional advantage.'
        };
        return tips[this.aiLevel] || tips.beginner;
    }
    
    updateAgents() {
        if (this.analyzerEnabled) {
            this.analyzeGameState();
        }
        if (this.strategyEnabled) {
            this.suggestStrategy();
        }
    }
    
    // LLM Integration
    isLLMAvailable() {
        const status = document.getElementById('llm-status');
        return status && status.classList.contains('connected');
    }
    
    async testLLMConnection() {
        const url = document.getElementById('llm-url').value;
        const model = document.getElementById('llm-model').value;
        const statusDiv = document.getElementById('llm-status');
        
        statusDiv.textContent = 'Testing...';
        statusDiv.className = 'llm-status';
        
        try {
            const response = await fetch(`${url}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: 'Say "hello"',
                    stream: false
                }),
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            
            if (response.ok) {
                statusDiv.textContent = '✓ Connected to LLM';
                statusDiv.classList.add('connected');
                statusDiv.classList.remove('disconnected');
                this.llmUrl = url;
                this.llmModel = model;
                this.logMessage('System', 'LLM connection established!', 'system');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            statusDiv.textContent = '✗ Connection failed';
            statusDiv.classList.add('disconnected');
            statusDiv.classList.remove('connected');
            console.warn('LLM connection failed:', error.message);
            this.logMessage('System', `LLM unavailable: ${error.message}. Game will work with built-in agents only.`, 'system');
        }
    }
    
    async queryLLM(prompt) {
        if (!this.isLLMAvailable()) {
            return null;
        }
        
        try {
            const response = await fetch(`${this.llmUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.llmModel,
                    prompt: prompt,
                    stream: false,
                    max_tokens: 300
                }),
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.response || data.text || '';
            } else {
                console.warn('LLM query failed with status:', response.status);
                this.handleLLMError();
            }
        } catch (error) {
            console.warn('LLM query error:', error.message);
            this.handleLLMError();
        }
        return null;
    }
    
    handleLLMError() {
        const statusDiv = document.getElementById('llm-status');
        if (statusDiv) {
            statusDiv.textContent = '✗ Connection lost';
            statusDiv.classList.add('disconnected');
            statusDiv.classList.remove('connected');
        }
        this.logMessage('System', 'LLM connection lost. Using built-in analysis.', 'system');
    }
    
    logMessage(sender, message, type = 'system') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${timestamp}] ${sender}: ${message}`;
        this.gameLog.insertBefore(entry, this.gameLog.firstChild);
        
        // Keep only last 50 entries
        while (this.gameLog.children.length > 50) {
            this.gameLog.removeChild(this.gameLog.lastChild);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TicTacToe();
});
