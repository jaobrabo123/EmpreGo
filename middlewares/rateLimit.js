import rateLimit from "express-rate-limit"

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

export {limiteGeral, limiteLogin}