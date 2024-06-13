(function () {
    'use strict';

    const environment = require('./environment.js');
    const terminal = require('./terminal.js');

    const CONTEXT_MENU_X_OFFSET = 150;
    const CONTEXT_MENU_Y_OFFSET = 100;
    const KEYBINDINGS_MENU_OFFSET = 200;

    let contextMenu = document.getElementById('context-menu');
    let toggleTerminalButton = document.getElementById('cm-toggle-terminal');
    let saveButton = document.getElementById('cm-save');
    let newButton = document.getElementById('cm-new');
    let keyBindingsButton = document.getElementById('cm-key-bindings');
    let quitButton = document.getElementById('cm-quit');
    let keyBindingsMenu = document.getElementById('key-bindings');

    /**
     * Shows the context menu at the correct position. Most of the time this
     * will be at the specified x and y coordinates, but if the context menu
     * would be off-screen, its position be adjusted using the
     * {@link CONTEXT_MENU_X_OFFSET} and {@link CONTEXT_MENU_Y_OFFSET}
     * constants.
     *
     * @param {number} x The x coordinate of the mouse event.
     * @param {number} y The y coordinate of the mouse event.
     */
    function showContextMenu(x, y) {
        contextMenu.style.display = 'flex';

        if (y > window.innerHeight - CONTEXT_MENU_Y_OFFSET) {
            y -= CONTEXT_MENU_Y_OFFSET;
        }
        contextMenu.style.top = `${y}px`;

        if (x > window.innerWidth - CONTEXT_MENU_X_OFFSET) {
            x -= CONTEXT_MENU_X_OFFSET;
        }
        contextMenu.style.left = `${x}px`;
    }

    /**
     * Hides the context menu.
     */
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    /**
     * Shows the key-bindings menu.
     */
    function showKeyBindings() {
        keyBindingsMenu.style.display = 'flex';
    }

    /**
     * Hides the key-bindings menu.
     */
    function hideKeyBindings() {
        keyBindingsMenu.style.display = 'none';
    }

    /**
     * Adds event listeners to the document and the context menu buttons.
     */
    function addListeners () {

        document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            showContextMenu(event.clientX, event.clientY);
        });

        document.addEventListener('click', function () {
            hideContextMenu();
        });

        keyBindingsButton.addEventListener('mouseover', function (event) {
            if (event.clientX < window.innerWidth - KEYBINDINGS_MENU_OFFSET) {
                showKeyBindings();
            }
        });

        keyBindingsButton.addEventListener('mouseout', function () {
            hideKeyBindings();
        });

        toggleTerminalButton.addEventListener('click', function () {
            terminal.toggle();
        });

        saveButton.addEventListener('click', function () {
            if (environment.cwf !== '') {
                saveCwf();
            }
        });

        newButton.addEventListener('click', function () {
            newDocument();
        });

        quitButton.addEventListener('click', function () {
            nw.App.quit();
        });

    }

    module.exports = exports = { addListeners };
})();