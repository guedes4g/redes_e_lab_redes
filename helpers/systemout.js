const cyan = '\x1b[34m';
const reset = '\x1b[0m'
exports.default = (message, data) =>{
    if(data)
        console.log(`${cyan}${message}\n  🡆${reset} `,data);
    else
        console.log(`${cyan}${message}\n  🡆${reset} `); 
}

exports.format = (message, data) =>{
    if(data)
        return(`${cyan}${message}\n  🡆${reset} `,data);
    else
        return(`${cyan}${message}\n  🡆${reset} `); 
}