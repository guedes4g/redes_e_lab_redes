const Semaphore = require('semaphore-async-await').default
const { packet2Data, data2Packet } = require('./helpers/parse')
const systemout = require('./helpers/systemout')

module.exports = class MessageManager {
    constructor({ socket, config, udp }) {
        this.config         = config
        this.socket         = socket
        this.udp            = udp
        this.messages       = new Array();
        this.lock           = new Semaphore(1);
        this.sendRetries    = {}

        this.errorProbability = 20
    }

    async route(packet) {
        //Primeiramente, formata o pacote para objeto 'data'
        let formattedData = packet2Data(packet)

        if (formattedData === null)
            return systemout(`Error while trying to parse the packet`, packet)

        await this._timeout()

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
            systemout(`Verificando se pacote deve ser roteado... De '${formattedData.apelidoOrigem}' - Para '${formattedData.apelidoDestino}'.`)

            switch (formattedData.apelidoDestino.toLowerCase()) {
                //mensagem era pra mim (unicast way) - exibe e passa adiante com status OK
                case this.config.apelido.toLowerCase():
                    systemout("Pacote recebido era pra mim. Mensagem: ", formattedData.mensagem)

                    //Reenvia pacote para rede
                    formattedData.errorControl = this._getRandomErrorControl()
                    systemout("Reenviando pacote para a rede com 'error control'...", formattedData.errorControl)
                    this._sendDataPacket(formattedData)

                    break


                //mensagem era pra todos (broadcast way)
                case "todos":
                    systemout("Pacote recebido por Broadcast. Mensagem: ", formattedData.mensagem)
                
                //mensagem não era pra mim, portanto deve rotear
                default:
                    console.log("Reenviando pacote para a rede")
                    this._sendDataPacket(formattedData)
            }
        }
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