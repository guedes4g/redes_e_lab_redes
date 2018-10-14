/**
 * EXEMPLO: 2345;naocopiado:Bob:Alice:Oi Mundo!
 * <token>;<controle  de  erro>:<apelido  de  origem>:<apelido  do  destino>:<mensagemou dados do arquivo>.
 */
exports.parseData = (data) =>{
    const dataParts = data.split(';');
    const token = dataParts[0];
    const body = dataParts[1];
    const bodyParts = body.split(":");
    return {
        token: token,
        errorConstrol: bodyParts[0],
        apelidoOrigem: bodyParts[1],
        apelidoDestino: bodyParts[2],
        mensagem: bodyParts[3],
        rawData: data
    }
}