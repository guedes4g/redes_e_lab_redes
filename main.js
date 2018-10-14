
/*
 * Nomes: Mateus Haas e Felipe Guedes
 * Implementação: Server UDP
 */
var net = require('net');
var consoleInfo =  require('./consoleInfo')

const udp = require('dgram');
const server = udp.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', async () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
  let data = await consoleInfo();
  console.log('config:', data);
});

server.bind(41234);


