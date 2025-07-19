var socket = io('http://localhost:3001');
socket.on('connect', () => {
    socket.emit('joinRoom', 'teste', (response) => {
        if (response.error) {
            console.error('Erro ao entrar na sala:', response.error);
        } else {
            console.log('Entrou na sala "teste" com sucesso!');
        }
    });
});

let chatsBack

async function carregarChatsBack() {
    try{
        const res = await fetch('/chats', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        if(!res.ok) throw ({ status: res.status, message: data.error });
        console.log(data);

        const messages = document.querySelectorAll('.message')
        if(data.tipo==='candidato'){
            messages.forEach(msg => {
                msg.classList.add(msg.classList.contains('empresa') ? 'esquerda' : 'direita');
            });
        }
        else{
            messages.forEach(msg => {
                msg.classList.add(msg.classList.contains('candidato') ? 'esquerda' : 'direita');
            });
        }
        
        chatsBack = data;
    }
    catch(erro){
        if(erro.status===500){
            chatsBack = 'Erro de conexão com o Banco de Dados.'
        }
        chatsBack = `Erro ao pegar chats: ${erro.message}`;
    }
}

function exibirChatsFront() {
    chatsBack.chats.forEach(data=>{
        const chat = document.createElement('div');
        chat.className = 'chat';

        const nomeRemetente = document.createElement('p');
        nomeRemetente.className = 'nomeRemetente';
        const nomeRemetenteConteudo = chatsBack.tipo === 'candidato' ? data.nome_fant : data.nome;
        nomeRemetente.textContent = nomeRemetenteConteudo;

        chat.appendChild(nomeRemetente);

        document.querySelector('#chats').appendChild(chat);
    })
}

document.addEventListener('DOMContentLoaded', async ()=>{
    await carregarChatsBack();
    exibirChatsFront();
})


const messages = document.querySelectorAll('.messages')
function renderMessage(message) {
    const texto = message.message;
    const autor = message.author;
    const type = message.type;

    const mensagemEAutor = document.createElement('p');
    mensagemEAutor.classList.add('message');
    mensagemEAutor.classList.add(type);
    if(chatsBack?.tipo){
        if(chatsBack.tipo==='candidato'){
            mensagemEAutor.classList.add(type === 'empresa' ? 'esquerda' : 'direita');
        }
        else{
            mensagemEAutor.classList.add(type === 'candidato' ? 'esquerda' : 'direita');
        }
    }

    mensagemEAutor.textContent = `${autor}: ${texto}`;
    messages[0].appendChild(mensagemEAutor);
};

socket.on('previousMessages', function(messages){
    for(let i = 0; i<messages.length; i++){
        renderMessage(messages[i])
    }
})

socket.on('receivedMessage', function(message){
    renderMessage(message)
})

const send = document.querySelector('#send')

send.addEventListener('click', ()=>{
    var author = chatsBack.tipo === 'candidato' ? chatsBack.chats[0].nome : chatsBack.chats[0].nome_fant;
    var message = document.querySelector('#message').value;
    document.querySelector('#message').value = ''

    console.log(chatsBack.tipo)
    
    if(author.length > 0 && message.length > 0){
        var messageObject = {
            author: author,
            message: message,
            room: 'teste',
            type: chatsBack.tipo,
        };

        //renderMessage(messageObject);

        socket.emit('sendMessage', messageObject);
    }
})