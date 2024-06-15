(function () {
    'use strict';

    const environment = require('./environment.js');
    const keyBindings = require('./key-bindings.js');

    let editor = document.getElementById('editor-text');
    let notSavedIndicator = document.getElementById('not-saved-indicator');

    /**
     * Focuses the text editor textarea
     */
    function focus() {
        editor.focus();
        editor.setSelectionRange(0, 0);
        editor.scrollTop = 0;
    }

    /**
     * Shows the not saved indicator
     */
    function showNotSavedIndicator() {
        document.title = `Text Editor - *${environment.cwf}`;
        notSavedIndicator.style.display = 'block';
    }

    /**
     * Hides the not saved indicator
     */
    function hideNotSavedIndicator() {
        document.title = `Text Editor - ${environment.cwf}`;
        notSavedIndicator.style.display = 'none';
    }

    /**
     * Adds the event listeners to the editor text area
     */
    function addListeners() {

        editor.addEventListener('keydown', function (event) {
            if (keyBindings.saveFile(event) && environment.cwf !== '') {
                event.preventDefault();
                saveCwf();
            } else if (keyBindings.newFile(event)) {
                event.preventDefault();
                newDocument();
            } else {
                showNotSavedIndicator();
            }

        });
    }

    module.exports = exports = {
        focus,
        showNotSavedIndicator,
        hideNotSavedIndicator,
        addListeners
    }
})();