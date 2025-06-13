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
    })
    .catch(() => {
        alert('Sua sessão expirou.');
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    });
} else {
    document.querySelector('#logout').style.display = 'none';
}

function logout(){
    localStorage.removeItem('token');
    window.location.href = window.location.pathname;
    alert('Você foi desconectado.');
}