const { packet2Data, data2Packet } = require('./helpers/parse')
const systemout = require('./helpers/systemout').default
const fs = require('fs')
const path = require('path')
module.exports = class MessageManager {
    constructor({ socket, config }) {
        this.config         = config
        this.socket         = socket
        this.messages       = []
        this.sendRetries    = {}

        this.errorProbability = 20
        this.maxQueueLength = 10
    }

    async enqueue(message){
        //Caso nao haja mais espaço o pacote é jogado fora
        if (this.messages.length >= this.maxQueueLength)
            return console.log(`Jogando fora pacote ${message}`)
        
        //Muda cameçalho
        message = '2345' + message.substring(4)
        //Adiciona a fila
        let parsedMessage = packet2Data(message)
        this.messages.push(parsedMessage)
        console.log('Nova Fila: ', this.messages)
    }

    async dequeue() {
        console.log("Vamos desempilhar fila de mensagens.")

        if (this.messages.length) {
            while(this.messages.length > 0 ) {
                //pega e remove um pacote "equivalente a shift <---> dequeue"
                let packet = this.messages.shift()

                systemout("Enviando pacote para nodo amigo", `De: '${packet.apelidoDestino}' - Msg: '${packet.mensagem}'`)

                //envia pacote
                console.log(packet)
                this._sendDataPacket(packet)

                //dá timeout
                await this._timeout()
            }
        }
        else
            console.log("Não há mensagens na fila...")
    }

    async route(packet) {
        //Primeiramente, formata o pacote para objeto 'data'
        let data = packet2Data(packet)
        console.log(data)
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

            systemout('UDP message sent to ', this.config.dest.ip +':'+ this.config.dest.port)
        });
    }

    _packetIsMineFlow(packet) {
        const { errorControl, mensagem, hash, apelidoDestino } = packet

        systemout(`Pacote recebido de volta. Status: `, errorControl)

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
        const { mensagem, apelidoDestino, apelidoOrigem, tipo, hash} = packet

        systemout(`Verificando se pacote deve ser roteado...`, `De '${apelidoOrigem}' - Para '${apelidoDestino}'.`)

        switch (apelidoDestino.toLowerCase()) {
            //mensagem era pra mim (unicast way) - exibe e passa adiante com status OK
            case this.config.apelido.toLowerCase():
                systemout("Pacote recebido era pra mim. Mensagem: ", mensagem)

                if(tipo.toLowerCase() == 'a'){
                    const fileName = `${hash}${Date.now()}.txt`
                    const filePath = path.join(__dirname, 'db', fileName)
                    fs.writeFile( filePath, mensagem, () =>{
                        console.log(`Messagem "${mensagem}", escrita no arquivo ${filePath}`)
                    } )
                }
                //Reenvia pacote para rede
                packet.errorControl = this._getRandomErrorControl()
                this._sendDataPacket(packet)

                break

            //mensagem era pra todos (broadcast way)
            case "todos":
                systemout("Pacote recebido por Broadcast. Mensagem: ", mensagem)
            
            //mensagem não era pra mim, portanto deve rotear
            default:
                this._sendDataPacket(packet)
        }
    }

    _sendDataPacket(data) {
        systemout("Reenviando pacote para a rede com 'error control'...", data.errorControl)

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
        if (!this.sendRetries[data.hash]) {
            console.log("Não houve tentativa de envio deste pacote. Vamos tentar novamente")

            //Guarda tentativa de envio no dicionário
            this.sendRetries[data.hash] = true

            //Reseta flag de error
            data.errorControl = "naocopiado"

            //Reenvia pacote para nodo da direita
            this._addPacketToQueue(data)
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

    _addPacketToQueue(packet) {
        this.messages.push(packet)
    }

    _addMessageToQueue(to, message) {
        this._addPacketToQueue({
            errorControl: "naocopiado",
            apelidoOrigem: this.config.apelido,
            apelidoDestino: to,
            mensagem: message
        })
    }
}