let virtualKeyboardVisible = true;
let terminalInstance = null;
let modifierStates = {
    ctrl: false,
    alt: false,
    shift: false
};

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
            { label: 'SHIFT', code: 'MOD_SHIFT', type: 'modifier' },
            { label: '←', code: '\x1b[D', type: 'arrow' },
            { label: '↑', code: '\x1b[A', type: 'arrow' },
            { label: '↓', code: '\x1b[B', type: 'arrow' },
            { label: '→', code: '\x1b[C', type: 'arrow' }
        ],
        [ // Row 2
            { label: 'F1', code: '\x1bOP', type: 'function' },
            { label: 'F2', code: '\x1bOQ', type: 'function' },
            { label: 'F3', code: '\x1bOR', type: 'function' },
            { label: 'F4', code: '\x1bOS', type: 'function' },
            { label: 'F5', code: '\x1b[15~', type: 'function' },
            { label: 'F6', code: '\x1b[17~', type: 'function' },
            { label: 'F7', code: '\x1b[18~', type: 'function' },
            { label: 'F8', code: '\x1b[19~', type: 'function' },
            { label: 'F9', code: '\x1b[20~', type: 'function' },
            { label: 'F10', code: '\x1b[21~', type: 'function' },
            { label: 'F11', code: '\x1b[23~', type: 'function' },
            { label: 'F12', code: '\x1b[24~', type: 'function' }
        ],
        [ // Row 3
            { label: 'Ctrl+C', code: '\x03', type: 'shortcut' },
            { label: 'Ctrl+D', code: '\x04', type: 'shortcut' },
            { label: 'Ctrl+Z', code: '\x1a', type: 'shortcut' },
            { label: 'Ctrl+L', code: '\x0c', type: 'shortcut' },
            { label: 'Ctrl+A', code: '\x01', type: 'shortcut' },
            { label: 'Ctrl+E', code: '\x05', type: 'shortcut' },
            { label: 'Ctrl+U', code: '\x15', type: 'shortcut' },
            { label: 'Ctrl+K', code: '\x0b', type: 'shortcut' },
            { label: 'Ctrl+W', code: '\x17', type: 'shortcut' },
            { label: 'Ctrl+R', code: '\x12', type: 'shortcut' }
        ],
        [ // Row 4
            { label: '|', code: '|', type: 'char' },
            { label: '&', code: '&', type: 'char' },
            { label: '>', code: '>', type: 'char' },
            { label: '<', code: '<', type: 'char' },
            { label: '~', code: '~', type: 'char' },
            { label: '`', code: '`', type: 'char' },
            { label: '$', code: '$', type: 'char' },
            { label: '#', code: '#', type: 'char' },
            { label: '%', code: '%', type: 'char' },
            { label: '*', code: '*', type: 'char' },
            { label: '@', code: '@', type: 'char' }
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
    if (!e.target.classList.contains('key-btn')) {
        return;
    }

    const keyType = e.target.dataset.type;
    let keyCode = e.target.dataset.code;

    // Handle modifier keys
    if (keyType === 'modifier') {
        if (keyCode === 'MOD_CTRL') {
            modifierStates.ctrl = !modifierStates.ctrl;
            e.target.classList.toggle('active', modifierStates.ctrl);
        } else if (keyCode === 'MOD_ALT') {
            modifierStates.alt = !modifierStates.alt;
            e.target.classList.toggle('active', modifierStates.alt);
        } else if (keyCode === 'MOD_SHIFT') {
            modifierStates.shift = !modifierStates.shift;
            e.target.classList.toggle('active', modifierStates.shift);
        }
        return;
    }

    // Handle special keys
    if (keyType === 'special') {
        terminalInstance.write(keyCode);
        return;
    }

    // Handle arrow keys
    if (keyType === 'arrow') {
        terminalInstance.write(keyCode);
        return;
    }

    // Handle function keys
    if (keyType === 'function') {
        terminalInstance.write(keyCode);
        return;
    }

    // Handle shortcuts
    if (keyType === 'shortcut') {
        terminalInstance.write(keyCode);
        return;
    }

    // Handle character keys
    if (keyType === 'char') {
        let charToSend = keyCode;
        
        // Apply modifiers to character if needed
        if (modifierStates.ctrl) {
            // Convert character to control code
            if (charToSend >= 'a' && charToSend <= 'z') {
                charToSend = String.fromCharCode(charToSend.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
            } else if (charToSend >= 'A' && charToSend <= 'Z') {
                charToSend = String.fromCharCode(charToSend.charCodeAt(0) - 'A'.charCodeAt(0) + 1);
            }
        } else if (modifierStates.shift) {
            // Apply shift transformation if needed
            charToSend = charToSend.toUpperCase();
        }
        
        terminalInstance.write(charToSend);
        return;
    }

    // If we have a modifier pressed, apply it to the key
    if (modifierStates.ctrl) {
        // For regular characters, convert to control code
        if (keyCode.length === 1 && keyCode >= 'a' && keyCode <= 'z') {
            keyCode = String.fromCharCode(keyCode.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
        } else if (keyCode.length === 1 && keyCode >= 'A' && keyCode <= 'Z') {
            keyCode = String.fromCharCode(keyCode.charCodeAt(0) - 'A'.charCodeAt(0) + 1);
        }
    }

    // Write the final character to the terminal
    terminalInstance.write(keyCode);

    // Reset modifiers after sending the character
    if (modifierStates.ctrl || modifierStates.alt || modifierStates.shift) {
        resetModifiers();
    }
}

/**
 * Resets all modifier keys to their unpressed state.
 */
function resetModifiers() {
    modifierStates.ctrl = false;
    modifierStates.alt = false;
    modifierStates.shift = false;
    
    // Update UI to reflect reset state
    const ctrlKey = document.querySelector('[data-code="MOD_CTRL"]');
    const altKey = document.querySelector('[data-code="MOD_ALT"]');
    const shiftKey = document.querySelector('[data-code="MOD_SHIFT"]');
    
    if (ctrlKey) ctrlKey.classList.remove('active');
    if (altKey) altKey.classList.remove('active');
    if (shiftKey) shiftKey.classList.remove('active');
}

/**
 * Toggles visibility of the native keyboard.
 */
function toggleNativeKeyboard() {
    virtualKeyboardVisible = !virtualKeyboardVisible;
    updateKeyboardVisibility();
}

/**
 * Updates the visibility of the virtual keyboard.
 */
function updateKeyboardVisibility() {
    const keyboardContainer = document.getElementById('virtual-keyboard');
    if (virtualKeyboardVisible) {
        keyboardContainer.style.display = 'block';
        document.getElementById('toggle-native-kb').textContent = 'Hide KB';
    } else {
        keyboardContainer.style.display = 'none';
        document.getElementById('toggle-native-kb').textContent = 'Show KB';
    }
}

// Export functions for external use
window.initKeyboard = initKeyboard;
window.handleKeyPress = handleKeyPress;
window.toggleNativeKeyboard = toggleNativeKeyboard;
