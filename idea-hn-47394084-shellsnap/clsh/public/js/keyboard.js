let isCtrlPressed = false;
let isAltPressed = false;
let isNativeKeyboardVisible = false;

function initKeyboard() {
    const keys = document.querySelectorAll('.key');
    const toggleBtn = document.getElementById('toggle-native-keyboard');
    
    keys.forEach(key => {
        key.addEventListener('click', handleKeyPress);
    });
    
    toggleBtn.addEventListener('click', toggleNativeKeyboard);
}

function handleKeyPress(e) {
    const keyElement = e.target;
    const key = keyElement.getAttribute('data-key');
    const shortcut = keyElement.getAttribute('data-shortcut');
    
    if (shortcut) {
        handleShortcut(shortcut);
        return;
    }
    
    if (key) {
        handleKey(key);
    }
    
    // Visual feedback
    keyElement.classList.add('pressed');
    setTimeout(() => {
        keyElement.classList.remove('pressed');
    }, 150);
}

function handleKey(key) {
    let data = '';
    
    if (isCtrlPressed && key.length === 1 && key.match(/[a-z]/i)) {
        // Convert character to ASCII control character
        const charCode = key.charCodeAt(0);
        if (charCode >= 97 && charCode <= 122) { // a-z
            data = String.fromCharCode(charCode - 96); // a -> \x01, b -> \x02, etc.
        } else if (charCode >= 65 && charCode <= 90) { // A-Z
            data = String.fromCharCode(charCode - 64); // A -> \x01, B -> \x02, etc.
        }
        isCtrlPressed = false; // Release Ctrl modifier
        updateModifierDisplay();
    } else if (isAltPressed) {
        // Prepend ESC character
        data = '\x1b' + key;
        isAltPressed = false; // Release Alt modifier
        updateModifierDisplay();
    } else {
        switch(key) {
            case 'Escape':
                data = '\x1b'; // ESC character
                break;
            case 'Tab':
                data = '\t';
                break;
            case 'Control':
                isCtrlPressed = !isCtrlPressed;
                updateModifierDisplay();
                return;
            case 'Alt':
                isAltPressed = !isAltPressed;
                updateModifierDisplay();
                return;
            case 'ArrowLeft':
                data = '\x1b[D';
                break;
            case 'ArrowUp':
                data = '\x1b[A';
                break;
            case 'ArrowDown':
                data = '\x1b[B';
                break;
            case 'ArrowRight':
                data = '\x1b[C';
                break;
            default:
                data = key;
        }
    }
    
    if (currentSessionId && terminals[currentSessionId]) {
        terminals[currentSessionId].write(data);
    }
}

function handleShortcut(shortcut) {
    let data = '';
    
    switch(shortcut.toLowerCase()) {
        case 'ctrl+c':
            data = '\x03'; // SIGINT
            break;
        case 'ctrl+d':
            data = '\x04'; // EOF
            break;
        case 'ctrl+z':
            data = '\x1a'; // SIGTSTP
            break;
        case 'ctrl+l':
            data = '\x0c'; // Form feed / clear screen
            break;
    }
    
    if (currentSessionId && terminals[currentSessionId]) {
        terminals[currentSessionId].write(data);
    }
}

function updateModifierDisplay() {
    // Update UI to show which modifiers are active
    const ctrlKey = document.querySelector('[data-key="Control"]');
    const altKey = document.querySelector('[data-key="Alt"]');
    
    if (ctrlKey) {
        ctrlKey.style.backgroundColor = isCtrlPressed ? '#ffcc00' : '';
    }
    
    if (altKey) {
        altKey.style.backgroundColor = isAltPressed ? '#ffcc00' : '';
    }
}

function toggleNativeKeyboard() {
    isNativeKeyboardVisible = !isNativeKeyboardVisible;
    
    if (isNativeKeyboardVisible) {
        // Focus on a temporary input to show native keyboard
        const tempInput = document.createElement('input');
        tempInput.type = 'text';
        tempInput.style.position = 'fixed';
        tempInput.style.bottom = '0';
        tempInput.style.left = '0';
        tempInput.style.opacity = '0';
        tempInput.style.pointerEvents = 'none';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.scrollIntoView();
        
        // Remove after focusing
        setTimeout(() => {
            document.body.removeChild(tempInput);
        }, 1000);
    }
}

// Initialize keyboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initKeyboard);
