const crypto = require('crypto');

const ALGORITMO = 'aes-256-ctr';
const SECRET_KEY_CRYPTO = Buffer.from(process.env.CRYPTO_SECRET, 'hex');
const IV_SIZE = 16;

function criptografarMensagem(mensagem){
    const iv = crypto.randomBytes(IV_SIZE);
    const cifra = crypto.createCipheriv(ALGORITMO, Buffer.from(SECRET_KEY_CRYPTO, 'hex'), iv);
    const criptografado = Buffer.concat([cifra.update(mensagem, 'utf8'), cifra.final()]);
    return `${iv.toString('hex')}:${criptografado.toString('hex')}`;
}

function descriptografarMensagem(mensagemCriptografada){
    const [ivHex, hexCriptografado] = mensagemCriptografada.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const textoCriptografado = Buffer.from(hexCriptografado, 'hex');
    const decifrado = crypto.createDecipheriv(ALGORITMO, Buffer.from(SECRET_KEY_CRYPTO, 'hex'), iv);
    const descriptografato = Buffer.concat([decifrado.update(textoCriptografado), decifrado.final()]);
    return descriptografato.toString('utf8');
}

module.exports = {
    criptografarMensagem,
    descriptografarMensagem
};