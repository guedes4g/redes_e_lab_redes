const cyan = '\x1b[34m';
const reset = '\x1b[0m'
module.exports = (message, data) =>{
    console.log(`${cyan}${message}\n  🡆${reset} `,data);
}