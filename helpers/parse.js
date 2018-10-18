const sha1 = require("sha1")

/**
 * EXEMPLO: 2345;naocopiado:Bob:Alice:Oi Mundo!
 * <token>;<controle  de  erro>:<apelido  de  origem>:<apelido  do  destino>:<mensagemou dados do arquivo>.
 */
exports.parseData = (data) =>{
    const dataParts = data.split(';');
    const body = dataParts[1];
    const bodyParts = body.split(":");

    return {
        errorControl: bodyParts[0],
        apelidoOrigem: bodyParts[1],
        apelidoDestino: bodyParts[2],
        mensagem: bodyParts[3],
        rawData: data,

        hash: sha1(bodyParts[1] + bodyParts[2] + bodyParts[3])
    }
}

exports.data2Packet = (data) => {
    return `2345;${data.errorControl}:${data.apelidoOrigem}:${data.apelidoDestino}:${data.mensagem}`
}

exports.sendPacketFormat = (from, to, mensagem) => {
    return `2345;naocopiado:${from}:${to}:${mensagem}`
}