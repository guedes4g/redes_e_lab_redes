const { question } = require('./helpers/cli')

/**
 * Ao iniciar o programa,
 * o usuário deverá informar o endereço IP da máquina que está a sua direita, 
 * um apelido e o
 * tempo do token 
 * e dos dados.
 */
const cyan = '\x1b[34m';
const reset = '\x1b[0m'
module.exports = async () => {
    let Ip = '';
    while ( Ip === '' ) {
        Ip = await question(cyan+'\tInforme o Ip da máquina a sua direita\n🡆 '+reset);
    }

    let Apelido = '';
    while ( Apelido === '' ) {
        Apelido = await question(cyan+'\x1b[34m\tInforme um Apelido\n🡆 '+reset);
    }

    let Tempo = '';
    while ( Tempo === '' ) {
        Tempo = await question(cyan+'\x1b[34m\tInforme o Tempo do Token\n🡆 '+reset);
    }

    return {
        ip: Ip, 
        apelido: Apelido, 
        tempo: Tempo, 
        }
}