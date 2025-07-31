const { ErroDeValidacao } = require('./erroClasses.js');
const isUrl = require('is-url');

class ValidarCampos{

    static validarTamanhoMax(valor, maximo, nome){
        if (typeof valor !== 'string') {
            throw new ErroDeValidacao(`O campo ${nome} precisa ser uma string.`);
        }
        const valorTrimado = valor.trim();
        if(!valorTrimado){
            throw new ErroDeValidacao(`O campo ${nome} precisa ser fornecido.`)
        }
        if(valorTrimado.length > maximo){
            throw new ErroDeValidacao(`O campo ${nome} não pode ter mais de ${maximo} caracteres.`)
        }
    }

    static validarTamanhoMin(valor, minimo, nome){
        if (typeof valor !== 'string') {
            throw new ErroDeValidacao(`O campo ${nome} precisa ser uma string.`);
        }
        const valorTrimado = valor.trim();
        if(!valorTrimado){
            throw new ErroDeValidacao(`O campo ${nome} precisa ser fornecido.`)
        }
        if(valorTrimado.length < minimo){
            throw new ErroDeValidacao(`O campo ${nome} não pode ter menos de ${minimo} caracteres.`)
        }
    }

    static validarEmail(email){
        if (typeof email !== 'string') {
            throw new ErroDeValidacao(`O email precisa ser uma string.`);
        }
        const emailTrimado = email.trim();
        if(!emailTrimado){
            throw new ErroDeValidacao(`O email precisa ser fornecido.`)
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(emailTrimado)){
            throw new ErroDeValidacao(`O email fornecido não é válido.`)
        }
    }

    static validarIdade(data, minimo, maximo, nome){
        const nascimento = new Date(data);
        if (isNaN(nascimento)) {
            throw new ErroDeValidacao(`${nome} fornecida é inválida.`);
        }
        const hoje = new Date();
        if (nascimento > hoje) {
            throw new ErroDeValidacao(`${nome} não pode ser uma data no futuro.`);
        }
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        const dia = hoje.getDate() - nascimento.getDate();

        if (mes < 0 || (mes === 0 && dia < 0)) {
            idade--;
        }
        if (idade < minimo) {
            throw new ErroDeValidacao(`${nome} não pode ter menos de ${minimo} anos.`);
        }
        if (idade > maximo) {
            throw new ErroDeValidacao(`${nome} não pode ter mais de ${minimo} anos.`);
        }
    }

    static validarCpf(cpf) {
        if (typeof cpf !== 'string') {
            throw new ErroDeValidacao('O CPF precisa ser uma string.');
        }

        // Remove pontos e traços
        const cpfLimpo = cpf.replace(/[^\d]/g, '').trim();

        if (!cpfLimpo) {
            throw new ErroDeValidacao('O CPF precisa ser fornecido.');
        }

        if (!/^\d{11}$/.test(cpfLimpo)) {
            throw new ErroDeValidacao('O CPF deve conter exatamente 11 dígitos numéricos.');
        }

        if (/^(\d)\1{10}$/.test(cpfLimpo)) {
            throw new ErroDeValidacao('O CPF fornecido é inválido.');
        }

        const calcularDigito = (cpfParcial, pesoInicial) => {
            let soma = 0;
            for (let i = 0; i < cpfParcial.length; i++) {
                soma += parseInt(cpfParcial[i]) * (pesoInicial - i);
            }
            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        const primeiroDigito = calcularDigito(cpfLimpo.slice(0, 9), 10);
        const segundoDigito = calcularDigito(cpfLimpo.slice(0, 10), 11);

        if (
            parseInt(cpfLimpo[9]) !== primeiroDigito ||
            parseInt(cpfLimpo[10]) !== segundoDigito
        ) {
            throw new ErroDeValidacao('O CPF fornecido é inválido.');
        }
    }

    static validarCnpj(cnpj){
        if (typeof cnpj !== 'string') {
            throw new ErroDeValidacao('O CNPJ precisa ser uma string.');
        }

        // Remove pontos e traços
        const cnpjLimpo = cnpj.replace(/[^\d]/g, '').trim();

        if (!cnpjLimpo) {
            throw new ErroDeValidacao('O CNPJ precisa ser fornecido.');
        }

        if (!/^\d{14}$/.test(cnpjLimpo)) {
            throw new ErroDeValidacao('O CNPJ deve conter exatamente 14 dígitos numéricos.');
        }
    }

    static validarCep(cep){
        if (typeof cep !== 'string') {
            throw new ErroDeValidacao('O CEP precisa ser uma string.');
        }

        // Remove pontos e traços
        const cepLimpo = cep.replace(/[^\d]/g, '').trim();

        if (!cepLimpo) {
            throw new ErroDeValidacao('O CEP precisa ser fornecido.');
        }

        if (!/^\d{8}$/.test(cepLimpo)) {
            throw new ErroDeValidacao('O CEP deve conter exatamente 8 dígitos numéricos.');
        }
    }

    static validarTelefone(telefone){

        if (typeof telefone !== 'string') {
            throw new ErroDeValidacao('O Telefone precisa ser uma string.');
        }

        // Remove pontos e traços
        const telefoneLimpo = telefone.replace(/[^\d]/g, '').trim();

        if (!telefoneLimpo) {
            throw new ErroDeValidacao('O Telefone precisa ser fornecido.');
        }

        if (!/^\d{13}$/.test(telefoneLimpo)) {
            throw new ErroDeValidacao('O Telefone deve conter exatamente 13 dígitos numéricos.');
        }

    }

    static validarImagemNoCloudinary(imagem){
        const prefix = "https://res.cloudinary.com/ddbfifdxd/image/upload/";
        if (imagem && !imagem.startsWith(prefix)) {
            throw new ErroDeValidacao("A imagem não pode ser enviada diretamente. Use o upload de arquivo.");
        }
    }

    static validarLink(link, tipo){
        switch (tipo) {
            case 'i':
                const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/i;
                if(!instagramRegex.test(link.trim())){
                    throw new ErroDeValidacao("URL do Instagram inválida.");
                }
                break;
            case 'g':
                const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i;
                if(!githubRegex.test(link.trim())){
                    throw new ErroDeValidacao("URL do GitHub inválida.");
                }
                break;
            case 'y':
                const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
                if(!youtubeRegex.test(link.trim())){
                    throw new ErroDeValidacao("URL do YouTube inválida.");
                }
                break;
            case 'x':
                const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}\/?$/i;
                if(!twitterRegex.test(link.trim())){
                    throw new ErroDeValidacao("URL do Twitter/X inválida.");
                }
                break;
            default:
                if(!isUrl(link.trim())){
                    throw new ErroDeValidacao("URL inválida.");
                }
                break;
        }
    }

    static async validarEstadoSigla(estado){
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
        const estados = await response.json();
        const siglas = estados.map((e) => e.sigla.toUpperCase());
        if (!siglas.includes(estado.toUpperCase())) {
            throw new ErroDeValidacao(`Estado inválido. Use uma sigla válida.`);
        }
    }

    static async validarCidadePorEstadoSigla(cidade, estado){
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
        const cidades = await response.json();
        const nomesCidades = cidades.map((c) => c.nome.toLowerCase());
        if (!nomesCidades.includes(cidade.trim().toLowerCase())) {
            throw new ErroDeValidacao(`${cidade} não existe em: ${estado}.`);
        }
    }

}

module.exports = ValidarCampos;