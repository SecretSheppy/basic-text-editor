(function () {
    'use strict';

    let terminalHistory = document.getElementById('terminal-history');

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

    module.exports = exports = {
        writeLine,
        writeDirectoryLine,
        writeError
    }
})();