// * Importando as funções do globalFunctions
import { carregarInfo, mostrarErroTopo, logout } from '/js/globalFunctions.js';

// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';

// * Após o site carregar, ele carrega a navbar e o perfil
document.addEventListener('DOMContentLoaded', async ()=>{
    const data = await carregarInfo() // * Pega a resposta do carregarInfo

    // * Carregar informações
    if(data.tipo && (data.tipo ==='candidato')){ // * Se a resposta for do tipo candidato carrega o perfil do candidato e ajusta a navbar
        // * Tags Formais
        document.querySelector('#loginOuCadas').style.display = 'none';
        document.querySelector('#fotoPerfil').style.display = '';
        document.querySelector('#fotoPerfilImg').src = data.info.foto;
        document.querySelector('#descUsuario').textContent = data.info.descricao;
        document.querySelector('#nomUsuario').textContent = data.info.nome;
        document.querySelector('#emailUsuario').textContent = data.info.email;
        document.querySelector('#cidadeUsuario').textContent = data.info.cidade;
        document.querySelector('#estadoUsuario').textContent = data.info.estado;
        document.querySelector('#fotoUsuario').src = data.info.foto;
        if(data.info.cpf){
            const cpfFormat = data.info.cpf.replace(
                /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
                "$1.$2.$3-$4"
            );
            document.querySelector("#cpfUsuario").textContent = cpfFormat;
        }
        document.querySelector("#pronUsuario").textContent = data.info.pronomes;

        // * Tags Sociais
        document.querySelector("#instUsuario").href = data.info.instagram;
        document.querySelector("#gitUsuario").href = data.info.github;
        document.querySelector("#ytUsuario").href = data.info.youtube;
        document.querySelector("#twtUsuario").href = data.info.twitter;
        // ? console.log(data.info) Usa esse log se precisar verificar oq vem no data.info

        // * Validação Tags Sociais
        if(!data.info.instagram) {
            document.querySelector("#instUsuario").style.display="none"
            document.querySelector("#LogoInst").style.display="none"
        }
        if(!data.info.github) {
            document.querySelector("#gitUsuario").style.display="none"
            document.querySelector("#LogoGit").style.display="none"
        }

        if(!data.info.youtube) {
            document.querySelector("#ytUsuario").style.display="none"
            document.querySelector("#LogoYt").style.display="none"
        }

        if(!data.info.twitter) {
            document.querySelector("#twtUsuario").style.display="none"
            document.querySelector("#LogoTwt").style.display="none"
        }

        // * Formata a data de nascimento
        const dataNasc = new Date(data.info.data_nasc);
        const dia = String(dataNasc.getDate()).padStart(2, '0');
        const mes = String(dataNasc.getMonth() + 1).padStart(2, '0');
        const ano = dataNasc.getFullYear();
        const dataFormatada = `${dia}/${mes}/${ano}`;
        document.querySelector('#nascUsuario').textContent = dataFormatada;

        // * Promise pra carregar as experiencias e tags simultaneamente
        await Promise.all([
            experiencias(),
            tags(6, 0)
        ]);
    } else{
        // * Se não for candidato, redireciona para a página inicial e mostra um alerta
        if(data.tipo==='expirado'){
            alert('Sua sessão expirou faça login novamente.');
            window.location.href = '/login';
        }else{
            alert('Acesso apenas para candidatos cadastrados e logados.');
            window.location.href = '/';
        }    
    }
})

const bodyBottom = document.getElementById('bodyBottom')

async function experiencias(){
    try{
        const response = await axiosWe.get('/experiencias/info');
        const data = response.data;
        console.log(data);
        data.forEach(expe => {
            const novaDiv = document.createElement("div");
            novaDiv.className = 'containerExemplo';
            bodyBottom.appendChild(novaDiv);

            const novoH1 = document.createElement("h1");
            novoH1.className = 'titExemplo';
            novoH1.textContent = `${expe.titulo}`;
            novaDiv.appendChild(novoH1);

            const boxExemplo = document.createElement("div");
            boxExemplo.className = 'boxExemplo';
            novaDiv.appendChild(boxExemplo);

            const imgExemplo = document.createElement("img");
            imgExemplo.className = 'imgExemplo';
            imgExemplo.src = `${expe.imagem}`;
            boxExemplo.appendChild(imgExemplo);

            const textExemplo = document.createElement("a");
            textExemplo.className = 'textExemplo';
            textExemplo.textContent = `${expe.descricao}`;
            boxExemplo.appendChild(textExemplo);
        });
    }
    catch(erro){
        console.error('Erro ao carregar experiências: ' + erro.message);
    }
}

document.querySelector('#btnAddTags').addEventListener('click', mostrarModalTag);
const modalInputTag = document.querySelector('#modalInput');
const inputTag = document.querySelector('#inputTag')
const btnConfirmar = document.querySelector('#btnConfirmar')
const btnCancelar = document.querySelector('#btnCancelar')

function mostrarModalTag() {
    modalInputTag.style.display = 'flex';

    const confirmar = async function () {
        btnConfirmar.removeEventListener('click', confirmar);
        btnCancelar.removeEventListener('click', cancelar);
        await adicionarTag();
    };

    const cancelar = async function () {
        modalInputTag.style.display = 'none';
        btnConfirmar.removeEventListener('click', confirmar);
        btnCancelar.removeEventListener('click', cancelar);
    };

    btnCancelar.addEventListener('click', cancelar);
    btnConfirmar.addEventListener('click', confirmar);
}

async function adicionarTag() {
    const tagUsuario = inputTag.value;
    inputTag.value = '';
    modalInputTag.style.display = 'none';
    if (tagUsuario) {
        if(document.querySelector("#maisTags")){
            await carregarTodasTags();
        }
        try{
            const response = await axiosWe.post('/tags', { nome: tagUsuario });
            const data = response.data;

            const buttonTag = document.createElement("button");
            buttonTag.classList.add("tags");
            buttonTag.textContent = tagUsuario;
            const remover = async function(id) {
                try {
                    await axiosWe.delete(`/tags/${id}`);
                    buttonTag.remove();
                }
                catch (erro) {
                    buttonTag.addEventListener('click', () => remover(id), { once: true });
                    alert(erro.message);
                };
            }
            buttonTag.addEventListener('click', () => remover(data.id), { once: true });
            
            document.querySelector("#Tags").prepend(buttonTag);
        }
        catch(erro){
            mostrarErroTopo(erro.message);
        }
    } else {
        mostrarErroTopo("Você precisa digitar uma tag.");
    }
}

const maisTags = document.querySelector("#maisTags");

async function carregarTodasTags(){
    maisTags.style.color = "#f05959";
    maisTags.textContent = 'Carregando...';
    await tags(99999999, 6);
    maisTags.remove();
}

maisTags.addEventListener("click", async () => {
    await carregarTodasTags()
}, { once: true });

async function tags(limit, offset) {
    try{
        const response = await axiosWe.get(`/tags?limit=${limit}&offset=${offset}`);
        const data = response.data;
        if(data.length===0){
            maisTags.remove();
            return
        }
        const divTags = document.querySelector("#Tags");
        data.forEach(tag=>{
            const nome = tag.nome;
            const buttonTag = document.createElement("button");
            buttonTag.classList.add("tags");
            buttonTag.textContent = nome;
            const remover = async function(id) {
                try {
                    if(document.querySelector("#maisTags")){
                        await carregarTodasTags();
                    }
                    await axiosWe.delete(`/tags/${id}`);
                    buttonTag.remove();
                }
                catch (erro) {
                    buttonTag.addEventListener('click', () => remover(id), { once: true });
                    alert(erro.message);
                };
            }
            buttonTag.addEventListener('click', () => remover(tag.id), { once: true });
            
            divTags.insertBefore(buttonTag, maisTags);
        })
    }
    catch(erro){
        alert(erro.message);
    };
}

document.querySelector('#logout').addEventListener('click', () => logout());