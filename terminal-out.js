(function () {
    'use strict';

    let terminalHistory = document.getElementById('terminal-history');
    let terminalPath = document.getElementById('command-path');
    let terminalContent = document.getElementById('terminal-content');

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

    function writeDirectoryLine(directory) {
        let lineElement = document.createElement('p');
        lineElement.classList.add('terminal-directory');
        lineElement.textContent = directory;
        terminalHistory.appendChild(lineElement);
    }

    function writeError(error) {
        // TODO:
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

    module.exports = exports = {
        writeLine,
        writeDirectoryLine,
        writeError,
        setCwd,
        clear,
        scrollToBottom
    }
})();