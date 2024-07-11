(function () {
    'use strict';

    const editor = require('./editor.js');

    let terminal = document.getElementById('command-prompt');
    let terminalInput = document.getElementById('command-input');

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
     * Toggles visibility of the terminal.
     */
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
        toggle
    }
})();