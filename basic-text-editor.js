'use strict';

const fs = require('fs');
const keyBindings = require('./key-bindings.js');
const environment = require('./environment.js');
const contextmenu = require('./contextmenu.js');
const terminal = require('./terminal.js');
const tControls = require('./terminal-controls.js');
const terminalOut = require('./terminal-out.js');
const editor = require('./editor.js');

environment.cwd = process.cwd().replaceAll('\\', '/');

let commandHistory = {
    data: [],
    index: 0,
};

function config() {
    let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    changeTheme([config.theme]);
}

function listThemes() {
    let themes = fs.readdirSync('./themes');
    themes.forEach(function (theme) {
        terminalOut.writeLine(theme.replaceAll('.css', ''));
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

    terminalOut.writeLine(`Theme not found: ${args[0]}`);
}

function showHelp() {
    let data = fs.readFileSync('./help.txt', 'utf8');
    data.split('\r\n').forEach(function (line) {
        terminalOut.writeLine(line);
    });
}

function newDocument() {
    document.getElementById('command-input').value = 'new';
    tControls.showAndFocus();
}

function createNewDocument() {
    document.getElementById('editor-text').value = '';
    environment.cwf = '';
    editor.hideNotSavedIndicator();
}

function saveCwf() {
    fs.writeFileSync(environment.cwf, document.getElementById('editor-text').value, 'utf8');
    terminalOut.writeLine(`File saved: ${environment.cwf}`);
    editor.hideNotSavedIndicator();
    tControls.showAndFocus();
}

// Main window events listeners
document.addEventListener('keydown', function (event) {
    if (keyBindings.quit(event)) {
        event.preventDefault();
        nw.App.quit();
    }

    if (keyBindings.toggleTerminal(event)) {
        event.preventDefault();
        tControls.toggle();
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
    terminalOut.setCwd(environment.cwd);
    tControls.hide();
    config();
});

editor.addListeners();
terminal.addListeners();
contextmenu.addListeners();