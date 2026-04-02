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
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-native-keyboard';
    toggleButton.className = 'key-btn key-toggle';
    toggleButton.textContent = virtualKeyboardVisible ? 'Hide KB' : 'Show KB';
    
    toggleButton.addEventListener('touchstart', () => {
        toggleButton.classList.add('pressed');
    });
    
    toggleButton.addEventListener('touchend', () => {
        setTimeout(() => {
            toggleButton.classList.remove('pressed');
        }, 100);
    });
    
    toggleButton.addEventListener('mousedown', () => {
        toggleButton.classList.add('pressed');
    });
    
    toggleButton.addEventListener('mouseup', () => {
        setTimeout(() => {
            toggleButton.classList.remove('pressed');
        }, 100);
    });
    
    toggleButton.addEventListener('click', toggleNativeKeyboard);
    
    keyboardContainer.appendChild(toggleButton);
}

/**
 * Sets up event listeners for all keyboard buttons.
 */
function setupKeyboardEventListeners() {
    const keyboardContainer = document.getElementById('virtual-keyboard');
    const buttons = keyboardContainer.querySelectorAll('.key-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', handleKeyPress);
    });
}

/**
 * Handles key press events and sends appropriate data to the terminal.
 * @param {Event} event The click event from the key button.
 */
function handleKeyPress(event) {
    const button = event.target;
    const code = button.dataset.code;
    const type = button.dataset.type;
    
    // Handle modifier keys
    if (type === 'modifier') {
        toggleModifier(code);
        updateModifierVisuals();
        return;
    }
    
    // Handle regular keys with modifiers
    let outputCode = code;
    
    // Apply modifiers based on current state
    if (modifierStates.ctrl && !isModifierCode(code)) {
        // For letter keys, apply Ctrl mapping
        if (code.length === 1 && code >= 'a' && code <= 'z') {
            // Ctrl + letter mapping
            const charCode = code.charCodeAt(0);
            if (charCode >= 97 && charCode <= 122) { // a-z
                outputCode = String.fromCharCode(charCode - 96); // Ctrl codes
            }
        } else if (code === 'MOD_CTRL') {
            outputCode = '';
        }
    }
    
    // Special handling for some keys with modifiers
    if (modifierStates.ctrl) {
        switch (code) {
            case 'c':
            case 'C':
                outputCode = '\x03'; // Ctrl+C
                break;
            case 'd':
            case 'D':
                outputCode = '\x04'; // Ctrl+D
                break;
            case 'z':
            case 'Z':
                outputCode = '\x1a'; // Ctrl+Z
                break;
            case 'l':
            case 'L':
                outputCode = '\x0c'; // Ctrl+L
                break;
            case 'a':
            case 'A':
                outputCode = '\x01'; // Ctrl+A
                break;
            case 'e':
            case 'E':
                outputCode = '\x05'; // Ctrl+E
                break;
            case 'u':
            case 'U':
                outputCode = '\x15'; // Ctrl+U
                break;
            case 'k':
            case 'K':
                outputCode = '\x0b'; // Ctrl+K
                break;
            case 'w':
            case 'W':
                outputCode = '\x17'; // Ctrl+W
                break;
            case 'r':
            case 'R':
                outputCode = '\x12'; // Ctrl+R
                break;
        }
    }
    
    // Send the output to the terminal
    if (terminalInstance && outputCode) {
        terminalInstance.write(outputCode);
    }
    
    // Reset modifiers after sending (for single-use modifiers like Ctrl+C)
    if (modifierStates.ctrl && type !== 'modifier') {
        resetModifiers();
        updateModifierVisuals();
    }
}

/**
 * Toggles the state of a modifier key.
 * @param {string} code The modifier code to toggle.
 */
function toggleModifier(code) {
    switch (code) {
        case 'MOD_CTRL':
            modifierStates.ctrl = !modifierStates.ctrl;
            break;
        case 'MOD_ALT':
            modifierStates.alt = !modifierStates.alt;
            break;
        case 'MOD_SHIFT':
            modifierStates.shift = !modifierStates.shift;
            break;
    }
}

/**
 * Checks if the given code represents a modifier.
 * @param {string} code The code to check.
 * @returns {boolean} True if the code is a modifier, false otherwise.
 */
function isModifierCode(code) {
    return code === 'MOD_CTRL' || code === 'MOD_ALT' || code === 'MOD_SHIFT';
}

/**
 * Resets all modifier states.
 */
function resetModifiers() {
    modifierStates.ctrl = false;
    modifierStates.alt = false;
    modifierStates.shift = false;
}

/**
 * Updates the visual appearance of modifier keys based on their state.
 */
function updateModifierVisuals() {
    const buttons = document.querySelectorAll('.key-btn');
    buttons.forEach(button => {
        const code = button.dataset.code;
        if (code === 'MOD_CTRL') {
            button.classList.toggle('active', modifierStates.ctrl);
        } else if (code === 'MOD_ALT') {
            button.classList.toggle('active', modifierStates.alt);
        } else if (code === 'MOD_SHIFT') {
            button.classList.toggle('active', modifierStates.shift);
        }
    });
}

/**
 * Toggles visibility of the native keyboard.
 */
function toggleNativeKeyboard() {
    virtualKeyboardVisible = !virtualKeyboardVisible;
    updateKeyboardVisibility();
    
    // Update toggle button text
    const toggleButton = document.getElementById('toggle-native-keyboard');
    if (toggleButton) {
        toggleButton.textContent = virtualKeyboardVisible ? 'Hide KB' : 'Show KB';
    }
}

/**
 * Updates the visibility of the virtual keyboard.
 */
function updateKeyboardVisibility() {
    const keyboardContainer = document.getElementById('virtual-keyboard');
    if (keyboardContainer) {
        keyboardContainer.style.display = virtualKeyboardVisible ? 'flex' : 'none';
    }
}

// Export functions for external use
window.initKeyboard = initKeyboard;
