fetch('/perfil', {
    credentials: 'include'
})
.then(response => {
    if (response.ok) return response.json();
    else throw new Error('Usuário não autenticado');
})
.then(data => {
    document.querySelector('#loginOuCadas').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = '';
    document.querySelector('#fotoPerfilImg').src = data.foto_perfil;
})
.catch(() => {
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