const divLogin = document.querySelector("#login")
const divCadastro = document.querySelector("#cadastro")

function trocarCadastrar(){
    divLogin.style.display = 'none'
    divCadastro.style.display = 'flex'
}

function trocarLogar(){
    divLogin.style.display = 'flex'
    divCadastro.style.display = 'none'
}

const formLogin = document.getElementById('formLogin');
const formCadastro = document.getElementById('formCadastro');

//login
formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.querySelector('#emailLogin').value;
    const senha = document.querySelector('#senhaLogin').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
    
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('Login inválido.');
        }
    })
    .then(data => {
        localStorage.setItem('token', data.token);
        window.location.href = '../index/index.html';
    })
    .catch(err => alert('Erro: ' + err.message));
})

//cadastro
formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nome = document.querySelector('#nome').value;
    const email = document.querySelector('#emailCadastro').value;
    const senha = document.querySelector('#senhaCadastro').value;
    const senha2 = document.querySelector('#senhaCadastro2').value;
    const genero = document.querySelector('#genero').value;
    const datanasc = document.querySelector('#datanasc').value;
    const mensagemErro = document.getElementById("mensagemErro");

    if (senha !== senha2) {
        mensagemErro.style.display = "flex";
        return;
    }
    mensagemErro.style.display = "none";

    fetch('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, genero, datanasc })
    })
    .then(res => {
        if (res.ok) {
            // Cadastro bem-sucedido, agora faz login automático
            return fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
        } else {
            throw new Error('Erro ao cadastrar o usuário.');
        }
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('Login automático falhou.');
        }
    })
    .then(data => {
        localStorage.setItem('token', data.token);
        window.location.href = '../index/index.html'; // Redireciona após login
    })
    .catch(err => alert('Erro: ' + err.message));
})