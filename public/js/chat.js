var socket = io('http://localhost:3001')
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
        chatsBack = data;
    }
    catch(erro){
        if(erro.status===500){
            chatsBack = 'Erro de conexão com o Banco de Dados.'
        }
        chatsBack = `Erro ao pegar chats: ${erro.message}`;
    }
}

carregarChatsBack()

const messages = document.querySelectorAll('.messages')
function renderMessage(message) {
    const texto = message.message;
    const autor = message.author;
    const type = message.type;

    const mensagemEAutor = document.createElement('p');
    mensagemEAutor.classList.add('message');
    if(chatsBack.tipo==='candidato'){
        mensagemEAutor.classList.add(type === 'empresa' ? 'esquerda' : 'direita');
    }
    else{
        mensagemEAutor.classList.add(type === 'candidato' ? 'esquerda' : 'direita');
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
            type: chatsBack.tipo,
        };

        renderMessage(messageObject);

        socket.emit('sendMessage', messageObject);
    }
})