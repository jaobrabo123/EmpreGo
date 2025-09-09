import axiosWe from './axiosConfig.js';

let resultado

export default async function carregarInfosUsuario() {
    if(resultado && resultado==='visitante') return resultado;
    try {
        const response = await axiosWe('/perfil/link');
        resultado = response.data;
        return resultado;
    } catch (erro) {
        console.error(erro.message);
        resultado = 'visitante';
        return resultado;
    }
}
