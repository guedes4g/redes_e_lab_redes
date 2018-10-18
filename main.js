
/*
 * Nomes: Mateus Haas e Felipe Guedes
 * Implementação: Server UDP
 */
var consoleInfo =  require('./consoleInfo')
const readDataFromConfig = require('./helpers/readDataFromConfig')
const systemout = require('./helpers/systemout')
const MessageManager = require('./messageManager')

const udp = require('dgram');

const server = udp.createSocket('udp4');


//le o arquivo de configuração e retorna Json como callback
readDataFromConfig( config => {
  systemout('Config data',config)
  const messageManager = new MessageManager({socket: server, config: config, udp: udp});

  server.on('error', (err) => {
    systemout('server listening',`${err.stack}`)
    server.close();
  });
  
  server.on('message', (msg, rinfo) => {
    systemout('server got:',`${msg} from ${rinfo.address}:${rinfo.port}`)

    let strMsg = msg.toString()

    let code = strMsg.substr(0, 4)

    switch(code) {
      case '1234':
        //desempilha todas as mensagens que temos na fila e envia para nodo da direita
        //await messageManager.dequeue()

        //envia token para nodo da direita
        messageManager.sendToken()
        break;

      case '2345':
        messageManager.route(strMsg)
        break;

      default:
        console.log(`Code '${code}' does not match any rule.`)
        break;
    }
  });
  
  server.on('listening', async () => {
    const address = server.address();
    systemout('server listening',`${address.address}:${address.port}`)

    //No caso, quando este nodo deve gerar o token
    if (config.token)
      messageManager.sendToken()

  });
  
  server.bind(1234);
})



