'use strict';

const fs = require('fs');
const path = require('path');
const keyBindings = require('./key-bindings.js');
const environment = require('./environment.js');
const contextmenu = require('./contextmenu.js');
const terminal = require('./terminal.js');

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
    ls: () => scanDirectory(environment.cwd),
    cd: (args) => currentDirectory(args[0]),
    open: (args) => openFile(args[0]),
    save: (args) => saveFile(args[0]),
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

function scanDirectory(path) {
    fs.readdirSync(path).forEach(function (file) {
        terminal.writeLine(file);
    });
}

function currentDirectory(newPath) {
    let tempDir = environment.cwd + '/' + newPath;

    if (fs.existsSync(tempDir)) {
        environment.cwd = path.resolve(tempDir).replaceAll('\\', '/');
        terminal.setCwd(environment.cwd);
    } else {
        terminal.writeLine(`Directory not found: ${newPath}`);
    }
}

function openFile(file) {
    try {
        document.getElementById('editor-text').value =
            fs.readFileSync(environment.cwd + '/' + file, 'utf8');
        environment.cwf = environment.cwd + '/' + file;
        hideNotSavedIndicator();
    } catch (e) {
        terminal.writeLine(`File not found: ${environment.cwd}/${file}`);
    }
}

function saveFile(fileName) {
    try {
        fs.writeFileSync(environment.cwd + '/' + fileName,
            document.getElementById('editor-text').value, 'utf8');
        environment.cwf = environment.cwd + '/' + fileName;
        terminal.writeLine(`File saved: ${environment.cwf}`);
        hideNotSavedIndicator();
    } catch (e) {
        terminal.writeLine(`Error saving file: ${environment.cwd}/${fileName}`);
    }
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

function focusEditor() {
    document.getElementById('editor-text').focus();
    document.getElementById('editor-text').setSelectionRange(0, 0);
    document.getElementById('editor-text').scrollTop = 0;
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
    hideNotSavedIndicator();
}

function showNotSavedIndicator() {
    document.title = `Text Editor - *${environment.cwf}`;
    document.getElementById('not-saved-indicator').style.display = 'block';
}

function hideNotSavedIndicator() {
    document.title = `Text Editor - ${environment.cwf}`;
    document.getElementById('not-saved-indicator').style.display = 'none';
}

function saveCwf() {
    fs.writeFileSync(environment.cwf, document.getElementById('editor-text').value, 'utf8');
    terminal.writeLine(`File saved: ${environment.cwf}`);
    hideNotSavedIndicator();
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

// Editor event listeners
document.getElementById('editor-text').addEventListener('keydown', function (event) {
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

nw.Window.get().on('focus', function () {
    focusEditor();
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

terminal.addListeners();
contextmenu.addListeners();