var socket = io('https://tcc-vjhk.onrender.com');
/*socket.on('connect', () => {
    socket.emit('joinRoom', 'teste', (response) => {
        if (response.error) {
            console.error('Erro ao entrar na sala:', response.error);
        } else {
            console.log('Entrou na sala "teste" com sucesso!');
        }
    });
});*/

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

        const nomeEMinimize = document.createElement('div');
        nomeEMinimize.className = 'nomeEMinimize';

        const nomeRemetente = document.createElement('p');
        nomeRemetente.className = 'nomeRemetente';
        const nomeRemetenteConteudo = chatsBack.tipo === 'candidato' ? data.nome_fant : data.nome;
        nomeRemetente.textContent = nomeRemetenteConteudo;

        const minimize = document.createElement('button')
        minimize.className = 'minimize';
        minimize.textContent = '➡️';

        nomeEMinimize.appendChild(nomeRemetente);
        nomeEMinimize.appendChild(minimize);

        const msgsEEnviar = document.createElement('div');
        msgsEEnviar.className = 'msgsEEnviar';
        msgsEEnviar.classList.add('minimizado');
        msgsEEnviar.style.display = 'none';

        const messages = document.createElement('div');
        messages.className = 'messages';
        messages.id = `idChatBack${data.id}`;

        const messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.className = 'messageInput';
        messageInput.id = `inputBack${data.id}`;
        messageInput.placeholder = 'Digite aqui sua mensagem';

        const send = document.createElement('button');
        send.className = 'send';
        send.id = `sendBack${data.id}`;
        send.textContent = 'Enviar';

        msgsEEnviar.appendChild(messages);
        msgsEEnviar.appendChild(messageInput);
        msgsEEnviar.appendChild(send);

        chat.appendChild(nomeEMinimize);
        chat.appendChild(msgsEEnviar);

        minimize.addEventListener('click', async ()=>{
            await minimizeELoadMessages(msgsEEnviar, minimize, data.id, send)
        })

        document.querySelector('#chats').appendChild(chat);
    })
}

async function minimizeELoadMessages(msgsEEnviar, minimize, chatIdBack, send){
    console.log('click')
    let display
    if(msgsEEnviar.classList.contains('minimizado')){
        socket.emit('joinRoom', chatIdBack, (response) => {
            if (response.status==='error') {
                alert('Erro ao entrar na sala:', response.message);
            } else {
                console.log(`Entrou na sala ${chatIdBack} com sucesso!`);
            }
        });
        send.addEventListener('click', async ()=>{
            var author = chatsBack.tipo === 'candidato' ? chatsBack.chats[0].nome : chatsBack.chats[0].nome_fant;
            var message = document.querySelector(`#inputBack${chatIdBack}`).value;
            document.querySelector(`#inputBack${chatIdBack}`).value = ''

            console.log(chatsBack.tipo)
            
            if(author.length > 0 && message.length > 0){
                var messageObject = {
                    author: author,
                    message: message,
                    room: chatIdBack,
                    type: chatsBack.tipo,
                };
                fetch('/mensagens',{
                    method: 'POST',
                    credentials: 'include',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        autor: author,
                        mensagem: message,
                        chat: chatIdBack,
                        de: chatsBack.tipo,
                    })
                })
                .then(async res=>{
                    const data = res.json();
                    if(!res.ok) throw ({status: res.status, message: data.error});

                    socket.emit('sendMessage', messageObject);
                })
                .catch(erro=>{
                    if(erro.status===500){
                        alert(`Erro ao enviar a mensagem (A culpa não foi sua, tente novamente).`)
                    }
                    else{
                        alert(`${erro.message}: ${erro.status}`)
                    }
                })

                //renderMessage(messageObject);
                
            }
        })
        display = 'block'
        minimize.textContent = '⬇️'
        msgsEEnviar.classList.remove('minimizado')
    }else{
        display = 'none'
        minimize.textContent = '➡️'
        msgsEEnviar.classList.add('minimizado')
    }
    msgsEEnviar.style.display = display;
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
    const room = message.room;

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
    document.querySelector(`#idChatBack${room}`).appendChild(mensagemEAutor);
};

socket.on('previousMessages', function(messages){
    for(let i = 0; i<messages.length; i++){
        renderMessage(messages[i])
    }
})

socket.on('receivedMessage', function(message){
    renderMessage(message)
})

/*const send1 = document.querySelector('#send')

send1.addEventListener('click', ()=>{
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
})*/