const token = localStorage.getItem('token');
const bodyBottom = document.getElementById('bodyBottom')
var textoDesc = ""

if (token) {
    fetch('/perfil', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then(response => {
        if (response.ok) return response.json();
        else throw new Error('Usuário não autenticado');
    })
    .then(data => {
        document.querySelector('#loginOuCadas').style.display = 'none';
        document.querySelector('#fotoPerfil').style.display = '';
        document.querySelector('#fotoPerfilImg').src = data.foto_perfil;
        document.querySelector('#descUsuario').textContent = data.descricao
        document.querySelector('#nomUsuario').textContent = data.nome;
        document.querySelector('#emailUsuario').textContent = data.email;
        document.querySelector('#fotoUsuario').src = data.foto_perfil;
        textoDesc = data.descricao
        document.querySelector("#editDesc").value = data.descricao

        const dataNasc = new Date(data.datanasc);
        const dia = String(dataNasc.getDate()).padStart(2, '0');
        const mes = String(dataNasc.getMonth() + 1).padStart(2, '0');
        const ano = dataNasc.getFullYear();

        const dataFormatada = `${dia}/${mes}/${ano}`;
        document.querySelector('#nascUsuario').textContent = dataFormatada;
    })
    .catch(() => {
        alert('Sua sessão expirou.');
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    });
    fetch('/exps', {
    headers: {
        Authorization: `Bearer ${token}`,
    },
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
            novoH1.textContent = `${expe.titulo_exp}`;
            novaDiv.appendChild(novoH1);

            const boxExemplo = document.createElement("div");
            boxExemplo.className = 'boxExemplo';
            novaDiv.appendChild(boxExemplo);

            const imgExemplo = document.createElement("img");
            imgExemplo.className = 'imgExemplo';
            imgExemplo.src = `${expe.img_exp}`;
            boxExemplo.appendChild(imgExemplo);

            const textExemplo = document.createElement("a");
            textExemplo.className = 'textExemplo';
            textExemplo.textContent = `${expe.descricao_exp}`;
            boxExemplo.appendChild(textExemplo);
        });
    })
    .catch(error => {
        console.error('Erro ao carregar experiências:', error);
    });

} else {
    alert('Você precisa estar logado para acessar o perfil.');
    window.location.href = '../index.html';
}

function adicionarTag() {
    const tagUsuario = document.querySelector("#tagUsuario").value

    if (token && tagUsuario) {
        fetch('/tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome_tag: tagUsuario })
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector("#tagUsuario").value = ''
            alert(data.message || 'Tag adicionada com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao adicionar tag:', error);
            alert('Erro ao adicionar tag');
        });
    } else {
        alert("Você precisa digitar uma tag.");
    }
}

function mudarDesc(){
    document.querySelector("#editDesc").style.display = 'flex'
    document.querySelector("#enviarDesc").style.display = 'flex'
    document.querySelector("#editarDescr").style.display = 'none'
    document.querySelector('#descUsuario').style.display = 'none'
    document.querySelector('#cancelDesc').style.display = 'flex'
}

function editarDesc(){
    atributo = 'descricao'
    valor = document.querySelector("#editDesc").value
    
    fetch('/perfil-edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ atributo, valor })
    })
    window.location.href = window.location.pathname;
}

function cancelarEditDesc(){
    document.querySelector("#editDesc").style.display = 'none'
    document.querySelector("#enviarDesc").style.display = 'none'
    document.querySelector("#editarDescr").style.display = 'flex'
    document.querySelector('#descUsuario').style.display = 'flex'
    document.querySelector('#cancelDesc').style.display = 'none'
    document.querySelector("#editDesc").value = textoDesc
    
}

document.getElementById('fotoUsuario').addEventListener('click', () => {
    document.getElementById('inputFotoPerfil').click();
});

document.getElementById('inputFotoPerfil').addEventListener('change', function () {
    if (this.files.length === 0) return;
    const formData = new FormData();
    const foto_perfil = document.querySelector("#inputFotoPerfil").files[0];

    formData.append('valor', foto_perfil);
    formData.append('atributo', 'foto_perfil');

    fetch('/perfil-edit', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || 'Foto adicionada com sucesso!');
        window.location.href = window.location.pathname;
    })
    .catch(error => {
        console.error('Erro ao adicionar foto de perfil:', error);
        alert('Erro ao adicionar foto de perfil');
    });
})

function logout(){
    localStorage.removeItem('token');
    window.location.href = '../index.html';
    alert('Você foi desconectado.');
}