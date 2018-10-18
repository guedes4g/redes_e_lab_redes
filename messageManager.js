const Semaphore = require('semaphore-async-await').default
const { packet2Data, data2Packet } = require('./helpers/parse')
const systemout = require('./helpers/systemout')

module.exports = class MessageManager {
    constructor({ socket, config }) {
        this.config         = config
        this.socket         = socket
        this.messages       = new Array();
        this.lock           = new Semaphore(1);
        this.sendRetries    = {}

        this.errorProbability = 20
    }

    async route(packet) {
        //Primeiramente, formata o pacote para objeto 'data'
        let data = packet2Data(packet)

        //Caso haja algum erro de parse, encerra esta execução
        if (data === null)
            return systemout(`Error while trying to parse the packet`, packet)

        //Timeout no fluxo das informações
        await this._timeout()

        //Verifica qual fluxo deve ser seguido - PACOTE ERA MEU ou DEVE SER ROTEADO
        if (data.apelidoOrigem.toLowerCase() === this.config.apelido.toLowerCase())
            this._packetIsMineFlow(data)
        else
            this._packetIsNotMineFlow(data)
    }

    async sendToken() {
        console.log("Indo enviar token para nodo da direita")

        await this._timeout()
        
        this._send("1234", err => {
            if (err) 
                systemout('Erro ao enviar pacote', err)
            else 
                console.log("Pacote enviado")

            systemout('UDP message sent to ', dest.ip +':'+ dest.port)
        });
    }

    _packetIsMineFlow(packet) {
        const { errorControl, mensagem, hhashash, apelidoDestino } = packet

        systemout(`Pacote recebido de volta`, `Status foi ${errorControl}`)

        switch (errorControl.toLowerCase()) {
            case "ok":
                systemout("Não é necessário rotear o pacote. Mensagem: ", mensagem)

                //Clear from send tries dictionary
                if (this.sendRetries[hash])
                    delete this.sendRetries[hash]

                break;

            case "erro":
                systemout(`Erro ao enviar mensagem para destinatário '${apelidoDestino}'. Mensagem: `, mensagem)
                this._tryResendPacket(packet)

                break;

            case "naocopiado":
                if (apelidoDestino.toLowerCase() === "todos")
                    systemout("Mensagem de broadcast, portanto não é necessário rotear o pacote. Mensagem: ", mensagem)
                else {
                    systemout("Usuário não localizado na rede. Usuário: ", apelidoDestino)

                    this._tryResendPacket(packet)
                }

                break;
        }
    }

    _packetIsNotMineFlow(packet) {
        const { errorControl, mensagem, apelidoDestino, apelidoOrigem } = packet

        systemout(`Verificando se pacote deve ser roteado... De '${apelidoOrigem}' - Para '${apelidoDestino}'.`)

        switch (apelidoDestino.toLowerCase()) {
            //mensagem era pra mim (unicast way) - exibe e passa adiante com status OK
            case this.config.apelido.toLowerCase():
                systemout("Pacote recebido era pra mim. Mensagem: ", mensagem)

                //Reenvia pacote para rede
                errorControl = this._getRandomErrorControl()
                systemout("Reenviando pacote para a rede com 'error control'...", errorControl)
                this._sendDataPacket(packet)

                break

            //mensagem era pra todos (broadcast way)
            case "todos":
                systemout("Pacote recebido por Broadcast. Mensagem: ", mensagem)
            
            //mensagem não era pra mim, portanto deve rotear
            default:
                console.log("Reenviando pacote para a rede")
                this._sendDataPacket(packet)
        }
    }

    _sendDataPacket(data) {
        //Envia pacote para nodo da direita
        this._send(data2Packet(data), () => {
            console.log("Pacote roteado novamente para nodo da direita")
        })
    }

    _send(message, cb) {
        const { dest } = this.config

        this.socket.send(message, 0, message.length, dest.port, dest.ip, cb);
    }

    _tryResendPacket(data) {
        if (!this.sendRetries[formattedData.hash]) {
            console.log("Não houve tentativa de envio deste pacote. Vamos tentar novamente")

            //Guarda tentativa de envio no dicionário
            this.sendRetries[formattedData.hash] = true

            //Reseta flag de error
            data.errorControl = "naocopiado"

            //Reenvia pacote para nodo da direita
            this._sendDataPacket(data)
        }
        else
            console.log("Já houve tentativa de envio deste pacote. Não vamos tentar novamente")
    }

    _getRandomErrorControl() {
        let prob = Math.random() * 100

        return prob < this.errorProbability ? "erro" : "OK"
    }

    _timeout() {
        return new Promise((resolve => {
            setTimeout(() => { 
                resolve()
            }, this.config.timeout * 1000)
        }))
    }

    /*async enqueue(msg) {

        let formattedData
        try {
            formattedData = packet2Data(msg);
        } catch (e) {
            //TODO message with error
            systemout("Error", e)
            return
        }
        try {
            this.addToMessageQueue(formattedData);
            await this._timeout()
            
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

    }
    
    addToMessageQueue(data) {
        if (this.messages.length >= 10) {
            throw "Queue is Full"
        } else {
            this.messages.push(data)
        }
    }

    */


}