(function () {
    'use strict';

    const keyBindings = require('./key-bindings.js');
    const handler = require('./command-handler.js');
    const terminalOut = require('./terminal-out.js')

    let terminal = document.getElementById('command-prompt');
    let terminalInput = document.getElementById('command-input');

    /**
     * Adds the terminal listeners to the main application.
     */
    function addListeners() {

        terminalInput.addEventListener('keydown', function (event) {
            if (keyBindings.submitCommand(event)) {
                event.preventDefault();
                handler.handle(terminalInput.value);
                terminalInput.value = '';
                terminalOut.scrollToBottom();
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
        addListeners
    }
})();