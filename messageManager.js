const Semaphore = require('semaphore-async-await').default
const { parseData } = require('./helpers/parse')
const systemout = require('./helpers/systemout')

module.exports = class MessageManager {
    constructor({ socket, config, udp }) {
        this.config     = config
        this.socket     = socket
        this.udp        = udp
        this.messages   = new Array();
        this.lock       = new Semaphore(1);
    }

    timeout(ms) {
        return new Promise((resolve) => {
            setTimeout(function () { resolve() }, ms);
        })
    }

    addToMessageQueue(data) {
        if (this.messages.length >= 10) {
            throw "Queue is Full"
        } else {
            this.messages.push(data)
        }
    }

    async route(msg) {
        let formatedData

        try {
            formatedData = parseData(msg);
        } catch (e) {
            //TODO message with error
            systemout(`Error while trying to parse the message ${msg}`, e)

            return
        }

        //
        if (formatedData.apelidoOrigem === this.config.apelido) {
            //minha mensagem voltou pra mim.
            //Verificar se é OK, ou erro, ou naocopiado
            

            //se for naocopiado, ou erro, devo tentar reenviar se for a 
        }
        else {
            
            switch (formatedData.apelidoDestino) {
                case this.config.apelido:
                    //mensagem era pra mim (unicast way)


                case "TODOS":
                    //mensagem era pra todos (broadcast way)
                
                default:
                    //mensagem não era pra mim, portanto deve rotear
            }
        }
    }

    async sendToken() {
        console.log("Indo enviar token para nodo da direita")
        await this.timeout(this.config.tempo * 1000)
        
        const { dest } = this.config

        let message = '1234';

        this.socket.send(message, 0, message.length, dest.port, dest.ip, function(err, bytes) {
            if (err) systemout('Erro ao enviar token', err);
            else console.log("Token enviado")
            systemout('UDP message sent to ', dest.ip +':'+ dest.port);
        });
    }

    /*async enqueue(msg) {

        let formatedData
        try {
            formatedData = parseData(msg);
        } catch (e) {
            //TODO message with error
            systemout("Error", e)
            return
        }
        try {
            this.addToMessageQueue(formatedData);
            await this.timeout(this.config.tempo * 1000)
            
            this.dequeue();
        
        } catch (e) {
            systemout("Error", e)
            //TODO sei la o que fazer quando a fila está cheia? retorna erro?
            console.log(e)
        } 
    }

    _syncDequeue() {
        this.lock.acquire();
        // Shift faz o trabalho de deque no caso
        let msg = this.messages.shift();

        this.lock.release();
        return msg;
    }

    async dequeue() {
        const msg = this._syncDequeue();

    }*/


}