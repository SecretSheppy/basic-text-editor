'use strict';

const fs = require('fs');
const path = require('path');
const keyBindings = require('./key-bindings.js');
const contextmenu = require('./contextmenu.js');
const terminal = require('./terminal.js');

let cwd = process.cwd().replaceAll('\\', '/');
let cwf = '';
let commandHistory = {
    data: [],
    index: 0,
};
let state = 'normal';

const commandHandlers = {
    exit: terminal.hide,
    quit: () => nw.App.quit(),
    help: showHelp,
    cls: terminal.clear,
    clear: terminal.clear,
    ls: () => scanDirectory(cwd),
    cd: (args) => currentDirectory(args[0]),
    open: (args) => openFile(args[0]),
    save: (args) => saveFile(args[0]),
    rm: (args) => removeFile(args[0]),
    mkdir: (args) => makeDirectory(args[0]),
    rmdir: (args) => removeDirectory(args[0]),
    explorer: () => nw.Shell.openExternal(cwd),
    themes: listThemes,
    theme: (args) => changeTheme(args),
    new: createNewDocument
};

function handleCommand(command) {
    terminal.writeLine(`${cwd} $ ${command}`);

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
    let tempDir = cwd + '/' + newPath;

    if (fs.existsSync(tempDir)) {
        cwd = path.resolve(tempDir).replaceAll('\\', '/');
        terminal.setCwd(cwd);
    } else {
        terminal.writeLine(`Directory not found: ${newPath}`);
    }
}

function openFile(file) {
    try {
        document.getElementById('editor-text').value =
            fs.readFileSync(cwd + '/' + file, 'utf8');
        cwf = cwd + '/' + file;
        hideNotSavedIndicator();
    } catch (e) {
        terminal.writeLine(`File not found: ${cwd}/${file}`);
    }
}

function saveFile(fileName) {
    try {
        fs.writeFileSync(cwd + '/' + fileName,
            document.getElementById('editor-text').value, 'utf8');
        cwf = cwd + '/' + fileName;
        terminal.writeLine(`File saved: ${cwf}`);
        hideNotSavedIndicator();
    } catch (e) {
        terminal.writeLine(`Error saving file: ${cwd}/${fileName}`);
    }
}

function removeFile(fileName) {
    try {
        fs.unlinkSync(cwd + '/' + fileName);
        terminal.writeLine(`File removed: ${cwd}/${fileName}`);
        cwf = '';
    } catch (e) {
        terminal.writeLine(`Error removing file: ${cwd}/${fileName}`);
    }
}

function makeDirectory(dirName) {
    try {
        fs.mkdirSync(cwd + '/' + dirName);
        terminal.writeLine(`Directory created: ${cwd}/${dirName}`);
    } catch (e) {
        terminal.writeLine(`Error creating directory: ${cwd}/${dirName}`);
    }
}

function removeDirectory(dirName) {
    try {
        fs.rmdirSync(cwd + '/' + dirName);
        terminal.writeLine(`Directory removed: ${cwd}/${dirName}`);
    } catch (e) {
        terminal.writeLine(`Error removing directory: ${cwd}/${dirName}`);
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
    cwf = '';
    hideNotSavedIndicator();
}

function showNotSavedIndicator() {
    document.title = `Text Editor - *${cwf}`;
    document.getElementById('not-saved-indicator').style.display = 'block';
}

function hideNotSavedIndicator() {
    document.title = `Text Editor - ${cwf}`;
    document.getElementById('not-saved-indicator').style.display = 'none';
}

function saveCwf() {
    fs.writeFileSync(cwf, document.getElementById('editor-text').value, 'utf8');
    terminal.writeLine(`File saved: ${cwf}`);
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
        if (state === 'maximized') {
            nw.Window.get().restore();
        } else {
            nw.Window.get().minimize();
        }
    }
});

// Terminal event listeners
document.getElementById('command-input').addEventListener('keydown', function (event) {
    if (keyBindings.submitCommand(event)) {
        event.preventDefault();
        let commandElement = document.getElementById('command-input');
        handleCommand(commandElement.value);
        commandElement.value = '';
        terminal.scrollToBottom();
        commandHistory.index = 0;
    }

    if (keyBindings.upCommandHistory(event) && commandHistory.index < commandHistory.data.length) {
        event.preventDefault();
        let commandElement = document.getElementById('command-input');
        commandElement.value = commandHistory.data[(commandHistory.index++)];
    }

    if (keyBindings.downCommandHistory(event) && commandHistory.index >= 0 && commandHistory.data.length > 0) {
        event.preventDefault();
        let commandElement = document.getElementById('command-input');
        commandElement.value = commandHistory.data[(commandHistory.index--)];
    }
});

document.getElementById('command-prompt').addEventListener('click', function () {
    document.getElementById('command-input').focus();
});

// Editor event listeners
document.getElementById('editor-text').addEventListener('keydown', function (event) {
    if (keyBindings.saveFile(event) && cwf !== '') {
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
    state = 'maximized';
});

nw.Window.get().on('restore', function () {
    state = 'normal';
});

document.addEventListener('DOMContentLoaded', function () {
    terminal.setCwd(cwd);
    terminal.hide();
    config();
});

contextmenu.addListeners();