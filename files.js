(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const environment = require('./environment.js')
    const terminal = require('./terminal.js');
    const editor = require('./editor.js');

    function normalizePath(fullPath) {
        return path.resolve(fullPath).replaceAll('\\', '/');
    }

    function scanDirectory(path) {
        fs.readdirSync(path).forEach(function (file) {
            terminal.writeLine(file);
        });
    }

    function changeDirectory(newPath) {
        let tempDir = environment.cwd + '/' + newPath;

        if (fs.existsSync(tempDir)) {
            environment.cwd = normalizePath(tempDir);
            terminal.setCwd(environment.cwd);
        } else {
            terminal.writeLine(`Directory not found: ${newPath}`);
        }
    }

    function openFile(file) {
        try {
            editor.setText(fs.readFileSync(environment.cwd + '/' + file, 'utf8'));
            environment.cwf = environment.cwd + '/' + file;
            editor.hideNotSavedIndicator();
        } catch (e) {
            terminal.writeLine(`File not found: ${environment.cwd}/${file}`);
        }
    }

    module.exports = exports = {
        scanDirectory,
        changeDirectory,
        openFile
    }
})();