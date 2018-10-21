const readline = require('readline');
const systemout = require('./systemout').format
var cl = readline.createInterface( process.stdin, process.stdout );
var question = function(q) {
    return new Promise( (res, rej) => {
        cl.question( systemout(q), (answer) => {
            res(answer);
        })
    });
};

exports.question = question;