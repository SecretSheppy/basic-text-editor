(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const terminalOut = require('./terminal-out.js');
    const environment = require('./environment.js');
    const terminal = require('./terminal.js');
    const editor = require('./editor.js');

    /**
     * Takes a path that could be composed of any number of parent directory
     * references including with directories on top of those and then sanitizes
     * it using {@link path.resolve} and then ensuring that the Windows
     * backslash directory system is replaced with forward slashes to resemble
     * the Windows terminal and be uniform with the linux and mac experience.
     *
     * @param {string} fullPath The full string path composed of directories
     * and parent directory references.
     * @returns {string} The sanitized path without parent directory references.
     */
    function normalizePath(fullPath) {
        return path.resolve(fullPath).replaceAll('\\', '/');
    }

    /**
     * Scans the specified directory for all files and folders and then
     * displays them in the terminal. Directories and displayed in bold and
     * a different color that is specified by the selected theme.
     *
     * @param {string} path The full string path.
     */
    function scanDirectory(path) {
        fs.readdirSync(path).forEach(function (file) {
            if (fs.lstatSync(path + '/' + file).isDirectory()) {
                terminalOut.writeDirectoryLine(file);
            } else {
                terminalOut.writeLine(file);
            }
        });
    }

    /**
     * Executed when the cd command is used to change the current directory.
     * Used to determine whether the directory exists. Will set the value of
     * {@link environment.cwd} to the new directory if it exists, if not it
     * will log to the console. There are two cases where an error can occur,
     * if the directory does not exist or if the user is treating a file
     * as a directory.
     *
     * @param {string} directory This single value of directory that should be
     * concatenated with the current value of {@link environment.cwd}
     */
    function changeDirectory(directory) {
        let tempDir = environment.cwd + '/' + directory;

        try {
            if (fs.lstatSync(tempDir).isDirectory()) {
                environment.cwd = normalizePath(tempDir);
                terminalOut.setCwd(environment.cwd);
            } else {
                terminalOut.writeLine(`Not a directory: ${directory}`);
            }
        } catch (e) {
            terminalOut.writeLine(`Directory not found: ${directory}`);
        }
    }

    /**
     * Opens a file into the editor window.
     *
     * @param {string} file The path to the file. Once a file has been opened
     * its path will be stored in {@link environment.cwf} and ctrl + s
     * (unless default binding is changed) can be used to automatically save
     * the file.
     */
    function openFile(file) {
        try {
            editor.setText(fs.readFileSync(environment.cwd + '/' + file, 'utf8'));
            environment.cwf = environment.cwd + '/' + file;
            editor.hideNotSavedIndicator();
        } catch (e) {
            terminalOut.writeLine(`File not found: ${environment.cwd}/${file}`);
        }
    }

    /**
     * Sets {@link environment.cwf} path then saves the current text in the
     * editor to the file in at the {@link environment.cwf} path.
     *
     * @param {string} fileName The name of the file to save.
     */
    function saveFile(fileName) {
        let fullPath = environment.cwd + '/' + fileName;

        try {
            fs.writeFileSync(fullPath, editor.getText(), 'utf8');
            environment.cwf = fullPath;
            terminalOut.writeLine(`File saved: ${environment.cwf}`);
            editor.hideNotSavedIndicator();
        } catch (e) {
            terminalOut.writeLine(`Error saving file: ${fullPath}`);
        }
    }

    /**
     * Deletes the specified file by concatenating the file name with the value
     * of {@link environment.cwf} and then unlinking the path from the file
     * tree. If the file does not exist, an error will be logged to the
     * application terminal.
     *
     * @param {string} fileName The name and extension of the file that should
     * be deleted in the current working directory.
     */
    function removeFile(fileName) {
        let fullPath = environment.cwd + '/' + fileName;

        try {
            fs.unlinkSync(fullPath);
            terminalOut.writeLine(`File removed: ${fullPath}`);
            environment.cwf = '';
        } catch (e) {
            terminalOut.writeLine(`Error removing file: ${fullPath}`);
        }
    }

    /**
     * Creates a directory with the specified name in the current working
     * directory.
     *
     * @param {string} dirName The name of the directory to create.
     */
    function makeDirectory(dirName) {
        let fullPath = environment.cwd + '/' + dirName;

        try {
            fs.mkdirSync(fullPath);
            terminalOut.writeLine(`Directory created: ${fullPath}`);
        } catch (e) {
            terminalOut.writeLine(`Error creating directory: ${fullPath}`);
        }
    }

    /**
     * Removes a directory with the given name from the current working
     * directory. If the directory does not exist an error will be written
     * to the application console.
     *
     * @param {string} dirName the name of the directory to delete.
     */
    function removeDirectory(dirName) {
        let fullPath = environment.cwd + '/' + dirName;

        try {
            fs.rmdirSync(fullPath);
            terminalOut.writeLine(`Directory removed: ${fullPath}`);
        } catch (e) {
            terminalOut.writeLine(`Error removing directory: ${fullPath}`);
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