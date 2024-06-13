(function () {
    'use strict';

    let terminal = document.getElementById('command-prompt');
    let terminalHistory = document.getElementById('terminal-history');
    let terminalContent = document.getElementById('terminal-content');
    let terminalInput = document.getElementById('command-input');
    let terminalPath = document.getElementById('command-path');

    function showAndFocus() {
        terminal.style.display = 'block';
        terminalInput.focus();
    }

    function hide() {
        terminal.style.display = 'none';
        focusEditor();
    }

    function setCwd(newCwd) {
        terminalPath.textContent = newCwd;
    }

    function writeLine(line) {
        let lineElement = document.createElement('p');
        lineElement.classList.add('terminal-text');
        lineElement.textContent = line;

        if (line === '') {
            lineElement = document.createElement('br');
        }

        terminalHistory.appendChild(lineElement);
    }

    function scrollToBottom() {
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    function clear() {
        terminalHistory.innerHTML = '';
    }

    function toggle () {
        if (terminal.style.display === 'none') {
            showAndFocus();
        } else {
            hide();
        }
    }

    module.exports = exports = {
        showAndFocus,
        hide,
        setCwd,
        writeLine,
        scrollToBottom,
        clear,
        toggle
    }
})();