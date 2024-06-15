(function () {
    'use strict';

    let editor = document.getElementById('editor-text');

    function focusEditor() {
        editor.focus();
        editor.setSelectionRange(0, 0);
        editor.scrollTop = 0;
    }

    module.exports = exports = {
        focusEditor
    }
})();