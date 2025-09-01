// * Importando as funções do globalFunctions
import { mostrarErroTopo } from '/js/globalFunctions.js';

// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';

var liberar = true

document.querySelector('#btnSalvar').addEventListener('click', adicionarExp);

async function adicionarExp() {
    if(!liberar){
        return;
    }
    liberar = false
    const titulo = document.querySelector("#inputTitulo").value
    const imagem = document.querySelector("#imgPlaceholder").files[0];
    const descricao = document.querySelector("#caixaText").value

    
    if (titulo && descricao) {
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descricao', descricao);
        formData.append('imagem', imagem);

        try{
            await axiosWe.post('/experiencias', formData);
            alert('Experiência adicionada com sucesso!');
            window.location.href = '/perfil/candidato';
        }
        catch(erro){
            console.error('Erro ao adicionar experiência:', erro.message);
            liberar = true;
        }
    } else {
        mostrarErroTopo("A experiencia deve ter um título e uma descrição.");
        liberar = true;
    }


}