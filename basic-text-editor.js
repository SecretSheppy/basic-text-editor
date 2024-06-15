'use strict';

const fs = require('fs');
const path = require('path');
const keyBindings = require('./key-bindings.js');
const environment = require('./environment.js');
const contextmenu = require('./contextmenu.js');
const terminal = require('./terminal.js');
const editor = require('./editor.js');
const files = require('./files.js');

environment.cwd = process.cwd().replaceAll('\\', '/');

let commandHistory = {
    data: [],
    index: 0,
};

const commandHandlers = {
    exit: terminal.hide,
    quit: () => nw.App.quit(),
    help: showHelp,
    cls: terminal.clear,
    clear: terminal.clear,
    ls: () => files.scanDirectory(environment.cwd),
    cd: (args) => files.changeDirectory(args[0]),
    open: (args) => files.openFile(args[0]),
    save: (args) => files.saveFile(args[0]),
    rm: (args) => removeFile(args[0]),
    mkdir: (args) => makeDirectory(args[0]),
    rmdir: (args) => removeDirectory(args[0]),
    explorer: () => nw.Shell.openExternal(environment.cwd),
    themes: listThemes,
    theme: (args) => changeTheme(args),
    new: createNewDocument
};

function handleCommand(command) {
    terminal.writeLine(`${environment.cwd} $ ${command}`);

    let commandChain = command.trim().split(' ');
    let commandName = commandChain[0];

    if (commandName in commandHandlers) {
        commandHandlers[commandName](commandChain.slice(1));
    } else {
        terminal.writeLine(`Command not found: ${commandName}`);
    }

    commandHistory.data.unshift(command);
}

function config() {
    let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    changeTheme([config.theme]);
}

function removeFile(fileName) {
    try {
        fs.unlinkSync(environment.cwd + '/' + fileName);
        terminal.writeLine(`File removed: ${environment.cwd}/${fileName}`);
        environment.cwf = '';
    } catch (e) {
        terminal.writeLine(`Error removing file: ${environment.cwd}/${fileName}`);
    }
}

function makeDirectory(dirName) {
    try {
        fs.mkdirSync(environment.cwd + '/' + dirName);
        terminal.writeLine(`Directory created: ${environment.cwd}/${dirName}`);
    } catch (e) {
        terminal.writeLine(`Error creating directory: ${environment.cwd}/${dirName}`);
    }
}

function removeDirectory(dirName) {
    try {
        fs.rmdirSync(environment.cwd + '/' + dirName);
        terminal.writeLine(`Directory removed: ${environment.cwd}/${dirName}`);
    } catch (e) {
        terminal.writeLine(`Error removing directory: ${environment.cwd}/${dirName}`);
    }
}

function listThemes() {
    let themes = fs.readdirSync('./themes');
    themes.forEach(function (theme) {
        terminal.writeLine(theme.replaceAll('.css', ''));
    });
}

function changeTheme(args) {
    let themePath = `./themes/${args[0]}.css`;

    if (fs.existsSync(themePath)) {
        let linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = themePath;
        document.head.appendChild(linkElement);

        if (args[1] === '--save') {
            let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
            config.theme = args[0];
            fs.writeFileSync('./config.json', JSON.stringify(config,
                null, 4), 'utf8');
        }

        return;
    }

    terminal.writeLine(`Theme not found: ${args[0]}`);
}

function showHelp() {
    let data = fs.readFileSync('./help.txt', 'utf8');
    data.split('\r\n').forEach(function (line) {
        terminal.writeLine(line);
    });
}

function newDocument() {
    document.getElementById('command-input').value = 'new';
    terminal.showAndFocus();
}

function createNewDocument() {
    document.getElementById('editor-text').value = '';
    environment.cwf = '';
    editor.hideNotSavedIndicator();
}

function saveCwf() {
    fs.writeFileSync(environment.cwf, document.getElementById('editor-text').value, 'utf8');
    terminal.writeLine(`File saved: ${environment.cwf}`);
    editor.hideNotSavedIndicator();
    terminal.showAndFocus();
}

// Main window events listeners
document.addEventListener('keydown', function (event) {
    if (keyBindings.quit(event)) {
        event.preventDefault();
        nw.App.quit();
    }

    if (keyBindings.toggleTerminal(event)) {
        event.preventDefault();
        terminal.toggle();
    }

    if (keyBindings.maximize(event)) {
        nw.Window.get().maximize();
    }

    if (keyBindings.restoreAndMinimize(event)) {
        if (environment.windowState === 'maximized') {
            nw.Window.get().restore();
        } else {
            nw.Window.get().minimize();
        }
    }
});

nw.Window.get().on('focus', function () {
    editor.focus();
});

nw.Window.get().on('maximize', function () {
    environment.windowState = 'maximized';
});

nw.Window.get().on('restore', function () {
    environment.windowState = 'normal';
});

document.addEventListener('DOMContentLoaded', function () {
    terminal.setCwd(environment.cwd);
    terminal.hide();
    config();
});

editor.addListeners();
terminal.addListeners();
contextmenu.addListeners();