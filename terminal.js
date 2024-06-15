(function () {
    'use strict';

    const keyBindings = require('./key-bindings.js');
    const editor = require('./editor.js');

    let terminal = document.getElementById('command-prompt');
    let terminalHistory = document.getElementById('terminal-history');
    let terminalContent = document.getElementById('terminal-content');
    let terminalInput = document.getElementById('command-input');
    let terminalPath = document.getElementById('command-path');

    /**
     * Shows the terminal and focuses the input field.
     */
    function showAndFocus() {
        terminal.style.display = 'block';
        terminalInput.focus();
    }

    /**
     * Hides the terminal and focuses the editor.
     */
    function hide() {
        terminal.style.display = 'none';
        editor.focus();
    }

    /**
     * Sets the terminal prompt path to the given path.
     *
     * @param {string} newCwd the new path to display in the terminal prompt.
     */
    function setCwd(newCwd) {
        terminalPath.textContent = newCwd;
    }

    /**
     * Writes a line to the terminal.
     *
     * @param {string} line the line to write to the terminal.
     */
    function writeLine(line) {
        let lineElement = document.createElement('p');
        lineElement.classList.add('terminal-text');
        lineElement.textContent = line;

        if (line === '') {
            lineElement = document.createElement('br');
        }

        terminalHistory.appendChild(lineElement);
    }

    /**
     * Scrolls the terminal to the bottom.
     */
    function scrollToBottom() {
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    /**
     * Clears the terminal history section of the terminal.
     */
    function clear() {
        terminalHistory.innerHTML = '';
    }

    /**
     * Toggles visibility of the terminal.
     */
    function toggle () {
        if (terminal.style.display === 'none') {
            showAndFocus();
        } else {
            hide();
        }
    }

    /**
     * Adds the terminal listeners to the main application.
     */
    function addListeners() {

        terminalInput.addEventListener('keydown', function (event) {
            if (keyBindings.submitCommand(event)) {
                event.preventDefault();
                handleCommand(terminalInput.value);
                terminalInput.value = '';
                scrollToBottom();
                commandHistory.index = 0;
            }

            if (keyBindings.upCommandHistory(event) && commandHistory.index < commandHistory.data.length) {
                event.preventDefault();
                terminalInput.value = commandHistory.data[(commandHistory.index++)];
            }

            if (keyBindings.downCommandHistory(event) && commandHistory.index >= 0 && commandHistory.data.length > 0) {
                event.preventDefault();
                terminalInput.value = commandHistory.data[(commandHistory.index--)];
            }
        });

        terminal.addEventListener('click', function () {
            terminalInput.focus();
        });

    }

    module.exports = exports = {
        showAndFocus,
        hide,
        setCwd,
        writeLine,
        scrollToBottom,
        clear,
        toggle,
        addListeners
    }
})();