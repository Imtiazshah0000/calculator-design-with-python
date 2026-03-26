let currentInput = '0';
let historyInput = '';
let isNewCalculation = false;

const resultDisplay = document.getElementById('result-display');
const historyDisplay = document.getElementById('history-display');
const clickSound = document.getElementById('click-sound');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');

function playSound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log("Sound play failed", e));
}

function updateDisplay() {
    resultDisplay.innerText = currentInput;
    historyDisplay.innerText = historyInput;
    
    // Animate display change
    resultDisplay.style.transform = 'scale(1.05)';
    setTimeout(() => {
        resultDisplay.style.transform = 'scale(1)';
    }, 100);
}

function appendNumber(number) {
    playSound();
    if (isNewCalculation) {
        currentInput = number === '.' ? '0.' : number;
        isNewCalculation = false;
    } else {
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            if (number === '.' && currentInput.includes('.')) return;
            currentInput += number;
        }
    }
    updateDisplay();
}

function appendOperator(operator) {
    playSound();
    if (isNewCalculation) isNewCalculation = false;
    
    // Replace last operator if present
    const lastChar = currentInput.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
        currentInput = currentInput.slice(0, -1) + operator;
    } else {
        currentInput += operator;
    }
    updateDisplay();
}

function clearDisplay() {
    playSound();
    currentInput = '0';
    historyInput = '';
    isNewCalculation = false;
    updateDisplay();
}

function deleteDigit() {
    playSound();
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

async function calculateResult() {
    playSound();
    if (currentInput === '0' && historyInput === '') return;

    resultDisplay.classList.add('loading');
    
    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression: currentInput })
        });

        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
        } else {
            const result = data.result;
            addToHistory(`${currentInput} = ${result}`);
            historyInput = currentInput + ' =';
            currentInput = result.toString();
            isNewCalculation = true;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while calculating.');
    } finally {
        resultDisplay.classList.remove('loading');
        updateDisplay();
    }
}

async function applyAdvanced(operation) {
    playSound();
    resultDisplay.classList.add('loading');
    
    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                expression: currentInput,
                operation: operation 
            })
        });

        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
        } else {
            const result = data.result;
            let opSymbol = '';
            if (operation === 'sqrt') opSymbol = `√(${currentInput})`;
            if (operation === 'square') opSymbol = `(${currentInput})²`;
            if (operation === 'percent') opSymbol = `${currentInput}%`;
            
            addToHistory(`${opSymbol} = ${result}`);
            historyInput = opSymbol + ' =';
            currentInput = result.toString();
            isNewCalculation = true;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    } finally {
        resultDisplay.classList.remove('loading');
        updateDisplay();
    }
}

function toggleHistory() {
    playSound();
    historyPanel.classList.toggle('active');
}

function addToHistory(item) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerText = item;
    
    const emptyMsg = historyList.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();
    
    historyList.prepend(historyItem);
    
    // Save to local storage
    const savedHistory = JSON.parse(localStorage.getItem('calc_history') || '[]');
    savedHistory.unshift(item);
    localStorage.setItem('calc_history', JSON.stringify(savedHistory.slice(0, 50)));
}

function clearHistory() {
    playSound();
    historyList.innerHTML = '<p class="empty-msg">No history yet.</p>';
    localStorage.removeItem('calc_history');
}

// Load history on start
window.onload = () => {
    const savedHistory = JSON.parse(localStorage.getItem('calc_history') || '[]');
    if (savedHistory.length > 0) {
        historyList.innerHTML = '';
        savedHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerText = item;
            historyList.appendChild(historyItem);
        });
    }
};

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (['+', '-', '*', '/'].includes(e.key)) appendOperator(e.key);
    if (e.key === 'Enter') calculateResult();
    if (e.key === 'Backspace') deleteDigit();
    if (e.key === 'Escape') clearDisplay();
});
