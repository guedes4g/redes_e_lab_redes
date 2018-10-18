const Semaphore = require('semaphore-async-await').default
const { parseData } = require('./helpers/parse')
const systemout = require('./helpers/systemout')

module.exports = class MessageManager {
    constructor({ socket, config, udp }) {
        this.config         = config
        this.socket         = socket
        this.udp            = udp
        this.messages       = new Array();
        this.lock           = new Semaphore(1);
        this.sendRetries    = {}
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
        let formattedData

        try {
            formattedData = parseData(msg);
        } catch (e) {
            //TODO message with error
            systemout(`Error while trying to parse the message ${msg}`, e)

            return
        }

        await this.timeout(this.config.tempo * 1000)

        //
        if (formattedData.apelidoOrigem.toLowerCase() === this.config.apelido.toLowerCase()) {
            //minha mensagem voltou pra mim.
            //Verificar se é OK, ou erro, ou naocopiado
            systemout(`Pacote recebido de volta`, `Status foi ${formattedData.errorControl}`)

            switch (formattedData.errorControl.toLowerCase()) {
                case "ok":
                    systemout("Não é necessário rotear o pacote. Mensagem: ", formattedData.mensagem)

                    //Clear from send tries dictionary
                    if (this.sendRetries[formattedData.hash])
                        delete this.sendRetries[formattedData.hash]

                    break;

                case "erro":
                    systemout(`Erro ao enviar mensagem para destinatário '${formattedData.apelidoDestino}'. Mensagem: `, formattedData.mensagem)

                    this._tryResendPacket(formattedData)

                    break;

                case "naocopiado":
                    if (formattedData.apelidoDestino.toLowerCase() === "todos") {
                        systemout("Mensagem de broadcast, portanto não é necessário rotear o pacote. Mensagem: ", formattedData.mensagem)
                    }
                    else {
                        systemout("Usuário não localizado na rede. Usuário: ", formattedData.apelidoDestino)

                        this._tryResendPacket(formattedData)
                    }

                    break;
            }
        }
        else {
            systemout(`Pacote deve ser roteado. De '${formattedData.apelidoOrigem}' - Para '${formattedData.apelidoDestino}'.`)
            switch (formattedData.apelidoDestino.toLowerCase()) {
                case this.config.apelido.toLowerCase():
                    //mensagem era pra mim (unicast way)


                case "todos":
                    //mensagem era pra todos (broadcast way)
                
                default:
                    //mensagem não era pra mim, portanto deve rotear
            }
        }
    }

    _tryResendPacket(data) {
        if (this.sendRetries[formattedData.hash])
            console.log("Já houve tentativa de envio deste pacote. Não vamos tentar novamente")
        else {
            console.log("Não houve tentativa de envio deste pacote. Vamos tentar novamente")

            this.sendRetries[formattedData.hash] = true

            //TODO: Aplicar lógica de reenvio
        }
    }

    async sendToken() {
        console.log("Indo enviar token para nodo da direita")
        await this.timeout(this.config.tempo * 1000)
        
        const { dest } = this.config

        let message = '1234';

        this.socket.send(message, 0, message.length, dest.port, dest.ip, err => {
            if (err) 
                systemout('Erro ao enviar token', err);
            else 
                console.log("Token enviado")

            systemout('UDP message sent to ', dest.ip +':'+ dest.port);
        });
    }

    /*async enqueue(msg) {

        let formattedData
        try {
            formattedData = parseData(msg);
        } catch (e) {
            //TODO message with error
            systemout("Error", e)
            return
        }
        try {
            this.addToMessageQueue(formattedData);
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