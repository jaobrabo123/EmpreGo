const bodyBottom = document.getElementById('bodyBottom')
var textoDesc = ""

fetch('/perfil', {
    method: 'GET',
    credentials: 'include'
})
.then(async response => {
    if (response.ok) return response.json();
    else {
        const erro = await response.json();
        throw new Error(erro.error);
    }
})
.then(data => {
    document.querySelector('#loginOuCadas').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = '';
    document.querySelector('#fotoPerfilImg').src = data.foto;
    document.querySelector('#descUsuario').textContent = data.descricao
    document.querySelector('#nomUsuario').textContent = data.nome;
    document.querySelector('#emailUsuario').textContent = data.email;
    document.querySelector('#fotoUsuario').src = data.foto;
    document.querySelector("#cpfUsuario").textContent = data.cpf;

    const dataNasc = new Date(data.data_nasc);
    const dia = String(dataNasc.getDate()).padStart(2, '0');
    const mes = String(dataNasc.getMonth() + 1).padStart(2, '0');
    const ano = dataNasc.getFullYear();

    const dataFormatada = `${dia}/${mes}/${ano}`;
    document.querySelector('#nascUsuario').textContent = dataFormatada;
})
.catch((err) => {
  if (err.message === 'Token não fornecido') {
    alert('Você precisa estar logado para acessar o perfil.');
  } else if (err.message === 'Token expirado') {
    alert('Sua sessão expirou. Faça login novamente.');
  } else if (err.message === 'Token inválido'){
    alert('Erro com o seu token. Faça login novamente.')
  }else {
    alert('Erro inesperado. Tente novamente.');
  }

  window.location.href = './index.html';
});
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

function logout() {
    fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        alert('Você foi desconectado.');
        window.location.href = './index.html';
    });
}