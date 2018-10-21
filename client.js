/*
 * Nomes: Mateus Haas e Felipe Guedes
 * Implementação: Client UDP
 */
const udp = require('dgram');
const programConfig = require("./config/programConfig.json");
const cli = require('./helpers/cli')
const readDataFromConfig = require('./helpers/readDataFromConfig')
const parse = require('./helpers/parse')

// creating a client socket
var client = udp.createSocket('udp4');

const IP = programConfig.IP;
const PORT = programConfig.PORT;


async function start () {
    let apelido, mensagem, tipo;
    readDataFromConfig( async (config) => {
        while(true) {
            apelido = await cli.question("Informe o apelido da máquina que deseja enviar mensagem")
            tipo = await cli.question("Informe o tipo da mensagem")
            mensagem = await cli.question("Informe a mensagem")
            sendFormatedData(apelido, tipo, mensagem, config);
        }
    })
}

function sendFormatedData(apelidoDest, tipo, mesagem, config){
    send(
        parse.data2Packet({
            errorControl: 'naocopiado',
            apelidoOrigem: config.apelido,
            apelidoDestino: apelidoDest,
            tipo: tipo,
            mensagem: mesagem,    
        }, '3456')
    )
}

function send(msg) {
    console.log(`Enviando mensagem '${msg}' para '${IP}:${PORT}'`)
    client.send(msg, PORT , IP, (error) => {
        if (error)
          console.log(error)  
      });    
}


start();