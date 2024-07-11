(function () {
    'use strict';

    const environment = require('./environment.js');
    const tControls = require('./terminal-controls.js');
    const files = require('./files.js');
    const terminalOut = require('./terminal-out.js');

    const commandHandlers = {
        exit: tControls.hide,
        quit: () => nw.App.quit(),
        help: showHelp,
        cls: terminalOut.clear,
        clear: terminalOut.clear,
        ls: () => files.scanDirectory(environment.cwd),
        cd: (args) => files.changeDirectory(args[0]),
        open: (args) => files.openFile(args[0]),
        save: (args) => files.saveFile(args[0]),
        rm: (args) => files.removeFile(args[0]),
        mkdir: (args) => files.makeDirectory(args[0]),
        rmdir: (args) => files.removeDirectory(args[0]),
        explorer: () => nw.Shell.openExternal(environment.cwd),
        themes: listThemes,
        theme: (args) => changeTheme(args),
        new: createNewDocument
    };

    function handle(command) {
        terminalOut.writeLine(`${environment.cwd} $ ${command}`);

        let commandChain = command.trim().split(' ');
        let commandName = commandChain[0];

        if (commandName in commandHandlers) {
            commandHandlers[commandName](commandChain.slice(1));
        } else {
            terminalOut.writeLine(`Command not found: ${commandName}`);
        }

        commandHistory.data.unshift(command);
    }

    module.exports = exports = {
        handle
    }
})();