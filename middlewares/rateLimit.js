const rateLimit = require('express-rate-limit');

const limiteGeral = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: ()=>{return {error: 'Muitas requisições, tente novamente mais tarde.'}},
    statusCode: 429,
})

const limiteLogin = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: ()=>{return {error: 'Muitas tentativas de login, tente novamente em 5 minutos.'}},
    statusCode: 429,
})

const limiteNodemailer = rateLimit({
    windowMs: 15 * 1000,
    max: 1,
    message: ()=>{return {error: 'Aguarde 15 segundos para enviar um novo email.'}},
    statusCode: 429,
})

const limiteValidarCodigo = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: ()=>{return {error: 'Muitas tentativas de validar código, tente novamente mais tarde.'}},
    statusCode: 429,
})

module.exports = {
    limiteGeral,
    limiteLogin,
    limiteNodemailer,
    limiteValidarCodigo
}