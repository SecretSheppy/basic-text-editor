(function () {
    'use strict';

    const fs = require('fs');
    const terminal = require('./terminal.js');

    function scanDirectory(path) {
        fs.readdirSync(path).forEach(function (file) {
            terminal.writeLine(file);
        });
    }

    module.exports = exports = {
        scanDirectory
    }
})();