const crypto = require('crypto');

const ALGORITMO = 'aes-256-ctr';
const SECRET_KEY_CRYPTO = Buffer.from(process.env.CRYPTO_SECRET, 'hex');
const IV_SIZE = 16;

function criptografarMensagem(mensagem){
    const iv = crypto.randomBytes(IV_SIZE);
    const cifra = crypto.createCipheriv(ALGORITMO, SECRET_KEY_CRYPTO, iv);
    const criptografado = Buffer.concat([cifra.update(mensagem, 'utf8'), cifra.final()]);
    return `${iv.toString('base64')}:${criptografado.toString('base64')}`;
}

function descriptografarMensagem(mensagemCriptografada){
    const [ivHex, hexCriptografado] = mensagemCriptografada.split(':');
    const iv = Buffer.from(ivHex, 'base64');
    const textoCriptografado = Buffer.from(hexCriptografado, 'base64');
    const decifrado = crypto.createDecipheriv(ALGORITMO, SECRET_KEY_CRYPTO, iv);
    const descriptografato = Buffer.concat([decifrado.update(textoCriptografado), decifrado.final()]);
    return descriptografato.toString('utf8');
}

module.exports = {
    criptografarMensagem,
    descriptografarMensagem
};