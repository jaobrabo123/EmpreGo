//Importando as funções do globalFunctions
import { carregarInfo, mostrarErroTopo, logout } from './globalFunctions.js'

//Após o site carregar, ele carrega a navbar e o perfil
document.addEventListener('DOMContentLoaded', async ()=>{
    const data = await carregarInfo() //Pega a resposta do carregarInfo

    if(data.tipo && (data.tipo ==='candidato'||data.tipo==='admin')){ //Se a resposta for do tipo candidato carrega o perfil do candidato e ajusta a navbar
        document.querySelector('#loginOuCadas').style.display = 'none';
        document.querySelector('#fotoPerfil').style.display = '';
        document.querySelector('#fotoPerfilImg').src = data.info.foto;
        document.querySelector('#descUsuario').textContent = data.info.descricao;
        document.querySelector('#nomUsuario').textContent = data.info.nome;
        document.querySelector('#emailUsuario').textContent = data.info.email;
        document.querySelector('#fotoUsuario').src = data.info.foto;
        document.querySelector("#cpfUsuario").textContent = data.info.cpf;

        // Formata a data de nascimento
        const dataNasc = new Date(data.info.data_nasc);
        const dia = String(dataNasc.getDate()).padStart(2, '0');
        const mes = String(dataNasc.getMonth() + 1).padStart(2, '0');
        const ano = dataNasc.getFullYear();
        const dataFormatada = `${dia}/${mes}/${ano}`;
        document.querySelector('#nascUsuario').textContent = dataFormatada;

        //Puxa a função que carrega as experiências do candidato
        experiencias()
    } else{
        //Se não for candidato, redireciona para a página inicial e mostra um alerta
        alert('Acesso apenas para candidatos cadastrados e logados.')
        window.location.href = './index.html'
    }
})

const bodyBottom = document.getElementById('bodyBottom')

function experiencias(){
    fetch('/exps', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao buscar experiências');
        return response.json();
    })
    .then(data => {
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
    })
    .catch(error => {
        console.error('Erro ao carregar experiências:', error);
    });
}

document.querySelector('#buttonAddTag').addEventListener('click', adicionarTag)

function adicionarTag() {
    const tagUsuario = document.querySelector("#tagUsuario").value

    if (tagUsuario) {
        fetch('/tags', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome: tagUsuario })
        })
        .then(async res => {
            document.querySelector("#tagUsuario").value = ''
            const data = await res.json()
            if(!res.ok) throw ({status: res.status, message: data.error})
            alert(data.message || 'Tag adicionada com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao adicionar tag:', error);
            alert(error.message);
        });
    } else {
        alert("Você precisa digitar uma tag.");
    }
}


document.querySelector('#logout').addEventListener('click', logout)