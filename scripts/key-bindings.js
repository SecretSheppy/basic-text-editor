(function () {

    /**
     * The key binding for quitting the application.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function quit(event) {
        return event.ctrlKey && event.key === 'q';
    }

    /**
     * The key binding for toggling the terminal.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function toggleTerminal(event) {
        return event.ctrlKey && event.key === ' ';
    }

    /**
     * The key binding for maximizing the editor.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function maximize(event) {
        return event.ctrlKey && event.key === 'ArrowUp';
    }

    /**
     * The key binding for restoring or minimizing the editor.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function restoreAndMinimize(event) {
        return event.ctrlKey && event.key === 'ArrowDown';
    }

    /**
     * The key binding for submitting a command in the terminal.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function submitCommand(event) {
        return event.key === 'Enter';
    }

    /**
     * The key binding for going up the command history.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function upCommandHistory(event) {
        return event.key === 'ArrowUp' && !event.ctrlKey;
    }

    /**
     * The key binding for going down the command history.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function downCommandHistory(event) {
        return event.key === 'ArrowDown' && !event.ctrlKey;
    }

    /**
     * The key binding for saving a file.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function saveFile(event) {
        return event.ctrlKey && event.key === 's';
    }

    /**
     * The key binding for creating a new file.
     *
     * @param {KeyboardEvent} event The event object that contains the key
     * information.
     * @returns {boolean} True if the key binding is pressed, otherwise false.
     */
    function newFile(event) {
        return event.ctrlKey && event.key === 'n';
    }

    module.exports = exports = {
        quit,
        toggleTerminal,
        maximize,
        restoreAndMinimize,
        submitCommand,
        upCommandHistory,
        downCommandHistory,
        saveFile,
        newFile
    };

})();