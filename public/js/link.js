document.addEventListener('DOMContentLoaded', () => {
  carregarLinks();
});

async function carregarLinks() {
  try {
    const tipo = await pegarTipo();
    if (tipo === 'usuario'){
        carregarUsuario();
        document.querySelector('#fotoPerfil').href = './profile.html';
    }
    else if (tipo === 'empresa') {
        carregarEmpresa();
        document.querySelector('#fotoPerfil').href = './profileCompany.html';
    } else if (tipo === 'visitante') {
        document.querySelector('#loginOuCadas').style.display = '';
        document.querySelector('#logout').style.display = 'none';
        document.querySelector('#fotoPerfil').style.display = 'none';
    }
    else {
        throw new Error('Tipo de usuário desconhecido');
    }
  }
  catch (error) {
    console.error('Erro ao carregar links:', error);
    document.querySelector('#logout').style.display = 'none';
  }
}

async function pegarTipo() {
    const response = await fetch('/get-tipo', {
    method: 'GET',
    credentials: 'include'
    });

    if (!response.ok) {   
        return 'visitante';
    }

    const { tipo } = await response.json();
    return tipo;
}

async function carregarUsuario() {
    try {
        const response = await fetch('/perfil', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Usuário não autenticado');
        }

        const data = await response.json();
        document.querySelector('#loginOuCadas').style.display = 'none';
        document.querySelector('#fotoPerfil').style.display = '';
        document.querySelector('#fotoPerfilImg').src = data.foto_perfil;
    } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error);
        document.querySelector('#logout').style.display = 'none';
    }
}

async function carregarEmpresa() {
    try {
        const response = await fetch('/perfil-empresa', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok){
            throw new Error('Empresa não autenticada');
        }

        const data = await response.json();
        document.querySelector('#loginOuCadas').style.display = 'none';
        document.querySelector('#fotoPerfil').style.display = '';
        document.querySelector('#fotoPerfilImg').src = data.fotoempresa;
    }
    catch (error){
        console.error('Erro ao carregar perfil da empresa:', error);
        document.querySelector('#logout').style.display = 'none';
    }

}

//Função pra deslogar
function logout(){
    fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        alert('Você foi desconectado.');
        window.location.href = './index.html';
    });
}