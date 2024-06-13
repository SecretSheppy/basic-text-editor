'use strict';

const fs = require('fs');
const path = require('path');

let cwd = process.cwd().replaceAll('\\', '/');
let cwf = '';
let commandHistory = {
    data: [],
    index: 0,
};
let state = 'normal';

const commandHandlers = {
    exit: hideTerminal,
    quit: () => nw.App.quit(),
    help: showHelp,
    cls: clearTerminal,
    clear: clearTerminal,
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
    writeTerminalLine(`${cwd} $ ${command}`);

    let commandChain = command.trim().split(' ');
    let commandName = commandChain[0];

    if (commandName in commandHandlers) {
        commandHandlers[commandName](commandChain.slice(1));
    } else {
        writeTerminalLine(`Command not found: ${commandName}`);
    }

    commandHistory.data.unshift(command);
}

function config() {
    let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    changeTheme([config.theme]);
}

function scanDirectory(path) {
    fs.readdirSync(path).forEach(function (file) {
        writeTerminalLine(file);
    });
}

function currentDirectory(newPath) {
    let tempDir = cwd + '/' + newPath;

    if (fs.existsSync(tempDir)) {
        cwd = path.resolve(tempDir).replaceAll('\\', '/');
        setTerminalCwd(cwd);
    } else {
        writeTerminalLine(`Directory not found: ${newPath}`);
    }
}

function openFile(file) {
    try {
        document.getElementById('editor-text').value =
            fs.readFileSync(cwd + '/' + file, 'utf8');
        cwf = cwd + '/' + file;
    } catch (e) {
        writeTerminalLine(`File not found: ${cwd}/${file}`);
    }
}

function saveFile(fileName) {
    try {
        fs.writeFileSync(cwd + '/' + fileName,
            document.getElementById('editor-text').value, 'utf8');
        cwf = cwd + '/' + fileName;
        writeTerminalLine(`File saved: ${cwf}`);
    } catch (e) {
        writeTerminalLine(`Error saving file: ${cwd}/${fileName}`);
    }
}

function removeFile(fileName) {
    try {
        fs.unlinkSync(cwd + '/' + fileName);
        writeTerminalLine(`File removed: ${cwd}/${fileName}`);
        cwf = '';
    } catch (e) {
        writeTerminalLine(`Error removing file: ${cwd}/${fileName}`);
    }
}

function makeDirectory(dirName) {
    try {
        fs.mkdirSync(cwd + '/' + dirName);
        writeTerminalLine(`Directory created: ${cwd}/${dirName}`);
    } catch (e) {
        writeTerminalLine(`Error creating directory: ${cwd}/${dirName}`);
    }
}

function removeDirectory(dirName) {
    try {
        fs.rmdirSync(cwd + '/' + dirName);
        writeTerminalLine(`Directory removed: ${cwd}/${dirName}`);
    } catch (e) {
        writeTerminalLine(`Error removing directory: ${cwd}/${dirName}`);
    }
}

function listThemes() {
    let themes = fs.readdirSync('./themes');
    themes.forEach(function (theme) {
        writeTerminalLine(theme.replaceAll('.css', ''));
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

    writeTerminalLine(`Theme not found: ${args[0]}`);
}

function focusEditor() {
    document.getElementById('editor-text').focus();
}

function showAndFocusTerminal() {
    document.getElementById('command-prompt').style.display = 'block';
    document.getElementById('command-input').focus();
}

function hideTerminal() {
    document.getElementById('command-prompt').style.display = 'none';
    focusEditor();
}

function setTerminalCwd(newCwd) {
    document.getElementById('command-path').textContent = newCwd;
}

function writeTerminalLine(line) {
    let lineElement = document.createElement('p');
    lineElement.classList.add('terminal-text');
    lineElement.textContent = line;

    if (line === '') {
        lineElement = document.createElement('br');
    }

    document.getElementById('terminal-history').appendChild(lineElement);
}

function scrollTerminalToBottom() {
    let terminalContent = document.getElementById('terminal-content');
    terminalContent.scrollTop = terminalContent.scrollHeight;
}

function clearTerminal() {
    document.getElementById('terminal-history').innerHTML = '';
}

function showHelp() {
    let data = fs.readFileSync('./help.txt', 'utf8');
    data.split('\r\n').forEach(function (line) {
        writeTerminalLine(line);
    });
}

function newDocument() {
    document.getElementById('command-input').value = 'new';
    showAndFocusTerminal();
}

function createNewDocument() {
    document.getElementById('editor-text').value = '';
    cwf = '';
}

// Main window events listeners
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key === 'q') {
        event.preventDefault();
        nw.App.quit();
    }

    if (event.ctrlKey && event.key === ' ') {
        event.preventDefault();
        if (document.getElementById('command-prompt').style.display === 'none') {
            showAndFocusTerminal();
        } else {
            hideTerminal();
        }
    }

    if (event.ctrlKey && event.key === 'ArrowUp') {
        nw.Window.get().maximize();
    }

    if (event.ctrlKey && event.key === 'ArrowDown') {
        if (state === 'maximized') {
            nw.Window.get().restore();
        } else {
            nw.Window.get().minimize();
        }
    }
});

// Terminal event listeners
document.getElementById('command-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        let commandElement = document.getElementById('command-input');
        handleCommand(commandElement.value);
        commandElement.value = '';
        scrollTerminalToBottom();
        commandHistory.index = 0;
    }

    if (event.key === 'ArrowUp' && commandHistory.index < commandHistory.data.length) {
        event.preventDefault();
        let commandElement = document.getElementById('command-input');
        commandElement.value = commandHistory.data[(commandHistory.index++)];
    }

    if (event.key === 'ArrowDown' && commandHistory.index >= 0 && commandHistory.data.length > 0) {
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
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        // TODO: Save contents of file
    }

    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        newDocument();
    }
});

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    // TODO: Show context menu
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
    setTerminalCwd(cwd);
    hideTerminal();
    config();
});