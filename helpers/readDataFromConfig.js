const fs = require('fs');
const path = require('path');

module.exports = (callback) => {
    const rawData = fs.readFileSync(path.join(__dirname,'..','config','network.txt'),{encoding: "UTF8"});
    const rawDataParts = rawData.split('\n');

    const dest = rawDataParts[0].split(":")

    callback({
        dest: {
            ip: dest[0],
            port: dest[1]
        },
        apelido: rawDataParts[1],
        timeout: Number.parseInt(rawDataParts[2]),
        token: (rawDataParts[3] === "true")
    })
}