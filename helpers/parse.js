const sha1 = require("sha1")

/**
 * EXEMPLO: 2345;naocopiado:Bob:Alice:Oi Mundo!
 * <token>;<controle  de  erro>:<apelido  de  origem>:<apelido  do  destino>:<mensagemou dados do arquivo>.
 */
exports.packet2Data = (data) =>{
    const dataParts = data.split(';');

    if (dataParts.length !== 2)
        return null

    const bodyParts = dataParts[1].split(":");

    if (bodyParts.length !== 5)
        return null

    return {
        errorControl: bodyParts[0],
        apelidoOrigem: bodyParts[1],
        apelidoDestino: bodyParts[2],
        tipo: bodyParts[3],
        mensagem: bodyParts[4],
        rawData: data,
        hash: sha1(bodyParts[1] + bodyParts[2] + bodyParts[3])
    }
}

exports.data2Packet = (data, code = '2345') => {
    return `${code};${data.errorControl}:${data.apelidoOrigem}:${data.apelidoDestino}:${data.tipo}:${data.mensagem}`
}

exports.sendPacketFormat = (from, to, type , mensagem) => {
    return `2345;naocopiado:${from}:${to}:${type}:${mensagem}`
}