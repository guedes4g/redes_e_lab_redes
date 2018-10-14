
/*
 * Nomes: Mateus Haas e Felipe Guedes
 * Implementação: Server UDP
 */
var consoleInfo =  require('./consoleInfo')
const readDataFromConfig = require('./helpers/readDataFromConfig')
const systemout = require('./helpers/systemout')
const messageQueue = require('./messageQueue')

const udp = require('dgram');

const server = udp.createSocket('udp4');


//le o arquivo de configuração e retorna Json como callback
readDataFromConfig( config => {
  systemout('Config data',config)
  const MessageQueue = new messageQueue({socket: server, config: config});

  server.on('error', (err) => {
    systemout('server listening',`${err.stack}`)
    server.close();
  });
  
  server.on('message', (msg, rinfo) => {
    systemout('server got:',`${msg} from ${rinfo.address}:${rinfo.port}`)
    let strMsg = msg.toString()
    console.log(strMsg.substr(0,4))
    switch(strMsg.substr(0,4)){
      case '1234':
      
      break;
      case '2345':
        MessageQueue.enqueue(strMsg)
      break;
    }
  });
  
  server.on('listening', async () => {
    const address = server.address();
    systemout('server listening',`${address.address}:${address.port}`)
  });
  
  server.bind(41234);
})



