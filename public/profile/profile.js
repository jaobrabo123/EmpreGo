const token = localStorage.getItem('token');

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
        document.querySelector('#nomUsuario').textContent = data.nome;
        document.querySelector('#emailUsuario').textContent = data.email;
        document.querySelector('#fotoUsuario').src = data.foto_perfil;
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
        window.location.href = window.location.pathname;
    });
} else {
    document.querySelector('#logout').style.display = 'none';
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
            alert(data.message || 'Tag adicionada com sucesso!');
            // você pode limpar o campo ou atualizar a lista de tags aqui
        })
        .catch(error => {
            console.error('Erro ao adicionar tag:', error);
            alert('Erro ao adicionar tag');
        });
    } else {
        alert("Você precisa digitar uma tag e estar logado.");
    }
}


function logout(){
    localStorage.removeItem('token');
    window.location.href = '../index.html';
    alert('Você foi desconectado.');
}