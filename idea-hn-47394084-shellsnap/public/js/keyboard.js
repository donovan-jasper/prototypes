let virtualKeyboardVisible = true;
let terminalInstance = null;

/**
 * Initializes the virtual keyboard and binds it to the terminal instance.
 * @param {Terminal} term The xterm.js terminal instance to bind to.
 */
function initKeyboard(term) {
    terminalInstance = term;
    createKeyboardHTML();
    setupKeyboardEventListeners();
    updateKeyboardVisibility();
}

/**
 * Creates the HTML structure for the virtual keyboard.
 */
function createKeyboardHTML() {
    const keyboardContainer = document.getElementById('virtual-keyboard');
    if (!keyboardContainer) {
        console.error('Virtual keyboard container #virtual-keyboard not found!');
        return;
    }

    // Clear any existing content
    keyboardContainer.innerHTML = '';

    // Define the keyboard layout
    const keyboardLayout = [
        [ // Row 1
            { label: 'ESC', code: '\x1b', type: 'special' },
            { label: 'TAB', code: '\t', type: 'special' },
            { label: 'CTRL', code: 'MOD_CTRL', type: 'modifier' },
            { label: 'ALT', code: 'MOD_ALT', type: 'modifier' },
            { label: '←', code: '\x1b[D', type: 'arrow' },
            { label: '↑', code: '\x1b[A', type: 'arrow' },
            { label: '↓', code: '\x1b[B', type: 'arrow' },
            { label: '→', code: '\x1b[C', type: 'arrow' }
        ],
        [ // Row 2
            { label: 'Ctrl+C', code: '\x03', type: 'shortcut' },
            { label: 'Ctrl+D', code: '\x04', type: 'shortcut' },
            { label: 'Ctrl+Z', code: '\x1a', type: 'shortcut' },
            { label: 'Ctrl+L', code: '\x0c', type: 'shortcut' }
        ],
        [ // Row 3
            { label: '|', code: '|', type: 'char' },
            { label: '&', code: '&', type: 'char' },
            { label: '>', code: '>', type: 'char' },
            { label: '<', code: '<', type: 'char' },
            { label: '~', code: '~', type: 'char' },
            { label: '`', code: '`', type: 'char' },
            { label: '$', code: '$', type: 'char' }
        ]
    ];

    // Create keyboard rows
    keyboardLayout.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(key => {
            const keyButton = document.createElement('button');
            keyButton.className = `key-btn key-${key.type}`;
            keyButton.textContent = key.label;
            keyButton.dataset.code = key.code;
            keyButton.dataset.type = key.type;
            
            // Add touch feedback
            keyButton.addEventListener('touchstart', () => {
                keyButton.classList.add('pressed');
            });
            
            keyButton.addEventListener('touchend', () => {
                setTimeout(() => {
                    keyButton.classList.remove('pressed');
                }, 100);
            });
            
            keyButton.addEventListener('mousedown', () => {
                keyButton.classList.add('pressed');
            });
            
            keyButton.addEventListener('mouseup', () => {
                setTimeout(() => {
                    keyButton.classList.remove('pressed');
                }, 100);
            });
            
            keyButton.addEventListener('mouseleave', () => {
                keyButton.classList.remove('pressed');
            });
            
            rowDiv.appendChild(keyButton);
        });
        
        keyboardContainer.appendChild(rowDiv);
    });

    // Add toggle button for native keyboard
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'key-btn key-toggle';
    toggleBtn.textContent = virtualKeyboardVisible ? 'Hide KB' : 'Show KB';
    toggleBtn.id = 'toggle-native-kb';
    
    toggleBtn.addEventListener('click', toggleNativeKeyboard);
    toggleBtn.addEventListener('touchstart', () => {
        toggleBtn.classList.add('pressed');
    });
    toggleBtn.addEventListener('touchend', () => {
        setTimeout(() => {
            toggleBtn.classList.remove('pressed');
        }, 100);
    });
    toggleBtn.addEventListener('mousedown', () => {
        toggleBtn.classList.add('pressed');
    });
    toggleBtn.addEventListener('mouseup', () => {
        setTimeout(() => {
            toggleBtn.classList.remove('pressed');
        }, 100);
    });
    
    const toggleRow = document.createElement('div');
    toggleRow.className = 'keyboard-row';
    toggleRow.appendChild(toggleBtn);
    keyboardContainer.appendChild(toggleRow);
}

/**
 * Sets up event listeners for the keyboard buttons.
 */
function setupKeyboardEventListeners() {
    const keyboardContainer = document.getElementById('virtual-keyboard');
    
    // Use event delegation for key presses
    keyboardContainer.addEventListener('click', handleKeyPress);
}

/**
 * Handles key press events from the virtual keyboard.
 * @param {Event} e The click event.
 */
function handleKeyPress(e) {
    if (!e.target.classList.contains('key-btn')) return;
    
    const keyCode = e.target.dataset.code;
    const keyType = e.target.dataset.type;
    
    // Handle modifier keys specially
    if (keyType === 'modifier') {
        // For now, just send the character representation
        // In a more advanced implementation, we'd track modifier states
        if (keyCode === 'MOD_CTRL') {
            // Visual feedback only for modifier keys
            return;
        }
        if (keyCode === 'MOD_ALT') {
            // Visual feedback only for modifier keys
            return;
        }
    }
    
    // Send the key code to the terminal
    if (terminalInstance && keyCode) {
        terminalInstance.write(keyCode);
    }
}

/**
 * Toggles the visibility of the native keyboard by focusing/unfocusing a hidden input.
 */
function toggleNativeKeyboard() {
    const hiddenInput = document.getElementById('hidden-input');
    if (!hiddenInput) {
        // Create a hidden input if it doesn't exist
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'hidden-input';
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.height = '0';
        input.style.width = '0';
        input.style.pointerEvents = 'none';
        document.body.appendChild(input);
        toggleNativeKeyboard(); // Recursive call to focus the newly created input
        return;
    }
    
    if (document.activeElement === hiddenInput) {
        hiddenInput.blur();
        virtualKeyboardVisible = true;
    } else {
        hiddenInput.focus();
        virtualKeyboardVisible = false;
    }
    
    updateKeyboardVisibility();
}

/**
 * Updates the toggle button text based on keyboard visibility state.
 */
function updateKeyboardVisibility() {
    const toggleBtn = document.getElementById('toggle-native-kb');
    if (toggleBtn) {
        toggleBtn.textContent = virtualKeyboardVisible ? 'Hide KB' : 'Show KB';
    }
}

// Export the init function for use in other modules
window.initKeyboard = initKeyboard;
