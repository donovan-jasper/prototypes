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
}

/**
 * Sets up event listeners for the virtual keyboard.
 */
function setupKeyboardEventListeners() {
    const keyboardContainer = document.getElementById('virtual-keyboard');
    
    // Add click/touch event listener to the entire keyboard container
    keyboardContainer.addEventListener('click', handleKeyPress);
    
    // Add keyboard visibility toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'keyboard-toggle';
    toggleBtn.textContent = virtualKeyboardVisible ? 'Hide Keyboard' : 'Show Keyboard';
    toggleBtn.className = 'keyboard-toggle-btn';
    toggleBtn.addEventListener('click', toggleKeyboardVisibility);
    
    // Insert after the keyboard container
    keyboardContainer.parentNode.insertBefore(toggleBtn, keyboardContainer.nextSibling);
}

/**
 * Handles key press events from the virtual keyboard.
 * @param {Event} event The click/touch event
 */
function handleKeyPress(event) {
    if (!terminalInstance || !event.target.classList.contains('key-btn')) {
        return;
    }
    
    const keyType = event.target.dataset.type;
    const keyCode = event.target.dataset.code;
    
    // Toggle modifier keys
    if (keyType === 'modifier') {
        toggleModifier(keyCode);
        updateModifierVisuals();
        return;
    }
    
    // Send the appropriate character sequence based on current modifier state
    let output = keyCode;
    
    // Handle special cases where we need to modify the output based on modifiers
    if (keyType === 'char' || keyType === 'arrow' || keyType === 'special') {
        output = getModifiedOutput(keyCode, keyType);
    }
    
    // Send the output to the terminal
    if (terminalInstance && output) {
        terminalInstance.write(output);
    }
    
    // Reset modifiers after sending the character (except for persistent ones like Ctrl)
    if (keyType !== 'modifier') {
        resetNonPersistentModifiers();
    }
}

/**
 * Toggles the state of a modifier key.
 * @param {string} modifierCode The code of the modifier to toggle
 */
function toggleModifier(modifierCode) {
    switch (modifierCode) {
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
 * Updates the visual appearance of modifier keys based on their state.
 */
function updateModifierVisuals() {
    const keys = document.querySelectorAll('.key-modifier');
    
    keys.forEach(key => {
        const code = key.dataset.code;
        let isActive = false;
        
        switch (code) {
            case 'MOD_CTRL':
                isActive = modifierStates.ctrl;
                break;
            case 'MOD_ALT':
                isActive = modifierStates.alt;
                break;
            case 'MOD_SHIFT':
                isActive = modifierStates.shift;
                break;
        }
        
        if (isActive) {
            key.classList.add('active');
        } else {
            key.classList.remove('active');
        }
    });
}

/**
 * Gets the modified output based on current modifier states.
 * @param {string} keyCode The base key code
 * @param {string} keyType The type of key
 * @returns {string} The modified output string
 */
function getModifiedOutput(keyCode, keyType) {
    // If no modifiers are active, return the original code
    if (!modifierStates.ctrl && !modifierStates.alt && !modifierStates.shift) {
        return keyCode;
    }
    
    // Handle special cases for modifier combinations
    if (modifierStates.ctrl) {
        // Handle Ctrl combinations
        if (keyType === 'char') {
            const char = keyCode.toLowerCase();
            // Convert to control character (A=1, B=2, ..., Z=26)
            if (char >= 'a' && char <= 'z') {
                return String.fromCharCode(char.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
            }
            // Special cases for other characters
            switch (char) {
                case '@': return '\x00'; // Ctrl+Space
                case '[': return '\x1b'; // Ctrl+[
                case '\\': return '\x1c'; // Ctrl+\
                case ']': return '\x1d'; // Ctrl+]
                case '^': return '\x1e'; // Ctrl+^
                case '_': return '\x1f'; // Ctrl+_
            }
        }
        
        // For arrow keys with Ctrl, send extended escape sequences
        if (keyType === 'arrow') {
            // Add modifier number to arrow key sequence (5 for Ctrl)
            return keyCode.replace(/\[(\w)/, '[1;5$1');
        }
    }
    
    if (modifierStates.alt) {
        // Alt sends ESC followed by the character
        if (keyType === 'char') {
            return '\x1b' + keyCode;
        }
        
        // For arrow keys with Alt, send extended escape sequences
        if (keyType === 'arrow') {
            // Add modifier number to arrow key sequence (3 for Alt)
            return keyCode.replace(/\[(\w)/, '[1;3$1');
        }
    }
    
    if (modifierStates.shift) {
        // Shift might modify some keys differently
        if (keyType === 'arrow') {
            // Add modifier number to arrow key sequence (2 for Shift)
            return keyCode.replace(/\[(\w)/, '[1;2$1');
        }
    }
    
    // For complex modifier combinations, return the original
    return keyCode;
}

/**
 * Resets non-persistent modifiers after a key press.
 */
function resetNonPersistentModifiers() {
    // In this implementation, modifiers are toggled rather than momentary,
    // so we don't reset them automatically. They stay active until toggled off.
}

/**
 * Toggles the visibility of the virtual keyboard.
 */
function toggleKeyboardVisibility() {
    virtualKeyboardVisible = !virtualKeyboardVisible;
    updateKeyboardVisibility();
    
    // Update toggle button text
    const toggleBtn = document.getElementById('keyboard-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = virtualKeyboardVisible ? 'Hide Keyboard' : 'Show Keyboard';
    }
}

/**
 * Updates the visibility of the virtual keyboard based on the current state.
 */
function updateKeyboardVisibility() {
    const keyboardContainer = document.getElementById('virtual-keyboard');
    if (keyboardContainer) {
        keyboardContainer.style.display = virtualKeyboardVisible ? 'block' : 'none';
    }
}

// Export functions for use in other modules
window.initKeyboard = initKeyboard;
window.toggleKeyboardVisibility = toggleKeyboardVisibility;
