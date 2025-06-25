fetch('/get-tipo', {
    method: 'GET',
    credentials: 'include'
})
.then(async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error);
    }
    if(data.tipo ==='usuario'){
        fetch('/perfil', {
            credentials: 'include'
        })
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) throw new Error('Usuário não autenticado');

            document.querySelector('#loginOuCadas').style.display = 'none';
            document.querySelector('#fotoPerfil').style.display = '';
            document.querySelector('#fotoPerfilImg').src = data.foto_perfil;
        })
        .catch(() => {
            document.querySelector('#logout').style.display = 'none';
        });
    } else if(data.tipo === 'empresa'){
        //fetch de empresa
    }
    else {
        alert('Tipo de usuário desconhecido');
        window.location.href = './index.html';
    }
})
.catch((err) => {
  console.error('Erro ao obter tipo de usuário:', err);
  document.querySelector('#logout').style.display = 'none';
});


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