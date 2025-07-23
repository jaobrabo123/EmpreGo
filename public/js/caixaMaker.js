import { mostrarErroTopo } from './globalFunctions.js'

var liberar = true

document.querySelector('#btnSalvar').addEventListener('click', adicionarExp)

function adicionarExp() {
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

        fetch('/experiencias', {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        .then(async (res) => {
            const data = await res.json();

            if (!res.ok) {
                throw ({ status: res.status, message: data.error || 'Erro ao adicionar experiência'});
            }

            alert('Experiência adicionada com sucesso!');
            window.location.href = '/perfil/candidato';
        })
        .catch(erro => {
            console.error('Erro ao adicionar experiência:', erro.message);
            if(erro.status === 500){
                mostrarErroTopo('Erro ao adicionar experiência, a culpa não foi sua. Tente novamente.')
                liberar = true;
                return;
            }
            mostrarErroTopo(erro.message);
            liberar = true;
        });
    } else {
        mostrarErroTopo("A experiencia deve ter um título e uma descrição.");
        liberar = true;
    }


}