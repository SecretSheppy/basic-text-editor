(function () {
    'use strict';

    const environment = require('./environment.js');

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

    module.exports = exports = {
        focus,
        showNotSavedIndicator,
        hideNotSavedIndicator
    }
})();