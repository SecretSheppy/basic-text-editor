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
            if (fs.lstatSync(path + '/' + file).isDirectory()) {
                terminal.writeDirectoryLine(file);
            } else {
                terminal.writeLine(file);
            }
        });
    }

    function changeDirectory(newPath) {
        let tempDir = environment.cwd + '/' + newPath;

        try {
            if (fs.lstatSync(tempDir).isDirectory()) {
                environment.cwd = normalizePath(tempDir);
                terminal.setCwd(environment.cwd);
            } else {
                terminal.writeLine(`Not a directory: ${newPath}`);
            }
        } catch (e) {
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

    function saveFile(fileName) {
        let fullPath = environment.cwd + '/' + fileName;

        try {
            fs.writeFileSync(fullPath, editor.getText(), 'utf8');
            environment.cwf = fullPath;
            terminal.writeLine(`File saved: ${environment.cwf}`);
            editor.hideNotSavedIndicator();
        } catch (e) {
            terminal.writeLine(`Error saving file: ${fullPath}`);
        }
    }

    function removeFile(fileName) {
        let fullPath = environment.cwd + '/' + fileName;

        try {
            fs.unlinkSync(fullPath);
            terminal.writeLine(`File removed: ${fullPath}`);
            environment.cwf = '';
        } catch (e) {
            terminal.writeLine(`Error removing file: ${fullPath}`);
        }
    }

    function makeDirectory(dirName) {
        let fullPath = environment.cwd + '/' + dirName;

        try {
            fs.mkdirSync(fullPath);
            terminal.writeLine(`Directory created: ${fullPath}`);
        } catch (e) {
            terminal.writeLine(`Error creating directory: ${fullPath}`);
        }
    }

    function removeDirectory(dirName) {
        let fullPath = environment.cwd + '/' + dirName;

        try {
            fs.rmdirSync(fullPath);
            terminal.writeLine(`Directory removed: ${fullPath}`);
        } catch (e) {
            terminal.writeLine(`Error removing directory: ${fullPath}`);
        }
    }

    module.exports = exports = {
        scanDirectory,
        changeDirectory,
        openFile,
        saveFile,
        removeFile,
        makeDirectory,
        removeDirectory
    }
})();