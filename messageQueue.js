const parseData = require('./helpers/parse')

module.exports = class Messenger{
    constructor({ socket, config }){
        this.config = config
        this.socket = socket
        this.messages = new Array(10);
        // garante que terá tamanho fixo de 10
        Object.seal(this.messages);
    }

    timeout(ms){
        return new Promise((resolve)=>{
            setTimeout(function(){ resolve() }, ms);
        })
    }

    async push(msg){
        let formatedData = parseData(msg);
        try{
            this.messages.push(formatedData);    
        } catch(e){
            console.log('Erro: fila cheia')
        }
        console.log('here')
        this.timeout(this.config.tempo);
        console.log('here2')

    }


}