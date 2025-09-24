// * Conexão com os WebSockets
const server = window.location.hostname.includes('localhost') ? 
'http://localhost:3001' : 'https://app.emprego-vagas.com.br';
var socket = io(server);

// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';

const salasEntradas = new Set();

let chatsBack

async function carregarChatsBack() {
    try{
        const response = await axiosWe.get('/chats/info');
        const data = response.data;

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
        console.log(data)
        chatsBack = data;
    }
    catch(erro){
        if(erro.status===500){
            chatsBack = 'Erro de conexão com o Banco de Dados.'
        }
        else{
            chatsBack = `Erro ao pegar chats: ${erro.message}`;
        } 
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
        const nomeRemetenteConteudo = chatsBack.tipo === 'candidato' ? data.empresas.nome_fant : data.candidatos.nome;
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
        send.addEventListener('click', async ()=>{
            var author = chatsBack.tipo === 'candidato' ? chatsBack.chats[0].candidatos.nome : chatsBack.chats[0].empresas.nome_fant;
            var message = document.querySelector(`#inputBack${data.id}`).value;
            document.querySelector(`#inputBack${data.id}`).value = ''
            
            if(author.length > 0 && message.length > 0){
                var messageObject = {
                    author: author,
                    message: message,
                    room: data.id,
                    type: chatsBack.tipo,
                };

                socket.emit('sendMessage', messageObject);
                
                try{
                    await axiosWe.post('/mensagens',{
                        autor: author,
                        mensagem: message,
                        chat: data.id,
                        de: chatsBack.tipo,
                    });
                }
                catch(erro){
                    let simpMsg = message.length>20 ? message.substring(0, 20) + '...' : message;
                    alert(`${erro.message} (Talvez a mensagem: "${simpMsg}" não apareça ao recarregar o chat)`)
                }
            }
        })

        msgsEEnviar.appendChild(messages);
        msgsEEnviar.appendChild(messageInput);
        msgsEEnviar.appendChild(send);

        chat.appendChild(nomeEMinimize);
        chat.appendChild(msgsEEnviar);

        minimize.addEventListener('click', async ()=>{
            await minimizeELoadMessages(msgsEEnviar, minimize, data.id)
        })

        document.querySelector('#chats').appendChild(chat);
    })
}

async function minimizeELoadMessages(msgsEEnviar, minimize, chatIdBack){
    let display
    if(msgsEEnviar.classList.contains('minimizado')){
        if (!salasEntradas.has(chatIdBack)){
            socket.emit('joinRoom', chatIdBack, (response) => {
                if (response.status==='error') {
                    alert('Erro ao entrar na sala:' + response.message);
                } else {
                    salasEntradas.add(chatIdBack)
                }
            });  
        }
        display = 'block'
        minimize.textContent = '⬇️'
        msgsEEnviar.classList.remove('minimizado')
    }else{
        display = 'none'
        minimize.textContent = '➡️'
        msgsEEnviar.classList.add('minimizado')
        /*messages.innerHTML = '';
        socket.emit('leaveRoom', chatIdBack)
        salasEntradas.delete(chatIdBack);*/
    }
    msgsEEnviar.style.display = display;
}

document.addEventListener('DOMContentLoaded', async ()=>{
    await carregarChatsBack();
    exibirChatsFront();
})

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