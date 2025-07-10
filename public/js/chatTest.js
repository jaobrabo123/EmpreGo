//Função para minimizar e expandir o chat
async function exibirChat(chat, button){
    const mensagens = document.getElementById(chat);
    const toggleButton = document.getElementById(button);

    if (mensagens.classList.contains('minimized')) {
        mensagens.classList.remove('minimized');
        toggleButton.innerHTML = '<i class="fa-solid fa-arrow-right"></i>'; // Setinha para expandir
    } else {
        mensagens.classList.add('minimized');
        toggleButton.innerHTML = '<i class="fa-solid fa-arrow-down"></i>'; // Setinha para minimizar
    }
}

async function carregarChats() {
    fetch('/chats', {
        method: 'GET',
        credentials: 'include',
    })
    .then(async response => {
        if (response.ok) return response.json();
        else {
            const erro = await response.json();
            throw { status: erro.status, message: erro.error};
        }
    })
    .then(data=>{
        console.log(data)
        let tipo = 0
        if(data.tipo==='candidato'){
            tipo = 1
        }else
        if(data.tipo==='empresa'){
            tipo = 2
        }
        for (let i = 0; i < data.chats.length; i++) {
            if(document.querySelector(`#chat${i+1}`)){
                continue;
            }
            console.log('Número '+i)

            const divChats = document.querySelector('#chats') //pegando a div #chats q fica embaixo do botão carregarChats

            //Criando uma div pra cada chat do usuário
            const novoChat = document.createElement('div')
            novoChat.className = 'chat'
            novoChat.id = `chat${i+1}`

            //Criando um parágrafo com o nome do chat dependendo do tipo do usuário
            const nomeChat = document.createElement('p')
            if(tipo===1){
                nomeChat.innerHTML = `${data.chats[i].nome_fant} <button onclick="exibirChat('mensagens${i+1}','exibir${i+1}')" id="exibir${i+1}"><i class="fa-solid fa-arrow-right"></i></button>`
            }else
            if(tipo===2){
                nomeChat.innerHTML = `${data.chats[i].nome} <button onclick="exibirChat('mensagens${i+1}','exibir${i+1}')" id="exibir${i+1}"><i class="fa-solid fa-arrow-right"></i></button>`
            }
            novoChat.appendChild(nomeChat) //Adicionando o nome à div do chat

            //Criando a div onde aparecerá as mensagens
            const mensagensConteudo = document.createElement('div')
            mensagensConteudo.className = 'mensagens minimized'
            mensagensConteudo.id = `mensagens${i+1}`

            const chatIdAtual = data.chats[i].id; //Salvando o id do chat carregado
            
            //Carregando mensagens do chat atual
            fetch(`/mensagens?chat=${chatIdAtual}`, {
                method: 'GET',
                credentials: 'include',
            })
            .then(async response => {
                if (response.ok) return response.json();
                else {
                    const erro = await response.json();
                    throw { status: erro.status, message: erro.error};
                }
            })
            .then(data=>{
                console.log(data)
                for (let j = 0; j < data.length; j++) {
                    if(data[j].de==='empresa'){
                        const novaMensagem = document.createElement('p')
                        novaMensagem.className = 'empresa'
                        novaMensagem.id = `chat${i+1}mensagem${j+1}`
                        novaMensagem.innerHTML = `${data[j].mensagem}`
                        mensagensConteudo.appendChild(novaMensagem)
                    }else
                    if(data[j].de==='candidato'){
                        const novaMensagem = document.createElement('p')
                        novaMensagem.className = 'candidato'
                        novaMensagem.id = `chat${i+1}mensagem${j+1}`
                        novaMensagem.innerHTML = `${data[j].mensagem}`
                        mensagensConteudo.appendChild(novaMensagem)
                    }
                }
                const novoInput = document.createElement('input')
                novoInput.type = 'text'
                novoInput.className = 'escrever'
                novoInput.id = `escrever${i+1}`
                novoChat.appendChild(novoInput)
                const novoBtn = document.createElement('button')
                novoBtn.className = `enviarMsg`
                novoBtn.id = `enviarMsg${i+1}`
                novoBtn.innerHTML = 'Enviar'
                novoBtn.addEventListener('click', () => {
                    const copiaInput = novoInput.value
                    novoInput.value = ''
                    enviarMensagem(copiaInput, chatIdAtual, novoChat.id, mensagensConteudo.id);
                });
                novoChat.appendChild(novoBtn)
            })
            .catch(erro => {
                console.error('Erro ao carregar mensagens:', erro);
            });
            const botaoAtualizar = document.createElement('button')
            botaoAtualizar.innerHTML = 'Atualizar'
            botaoAtualizar.addEventListener('click', () => {
                recarregarMensagens(novoChat.id, mensagensConteudo.id);
            });
            novoChat.appendChild(botaoAtualizar)
            novoChat.appendChild(mensagensConteudo)
            mensagensConteudo.dataset.idChat = chatIdAtual;
            divChats.appendChild(novoChat)
        }
    })
    .catch(erro => {
        console.error('Erro ao carregar chats:', erro);
    });
}

async function recarregarMensagens(chat,mensagens) {
    console.log('tentando atualizar mensagens...')
    const idChatBD = document.querySelector(`#${mensagens}`).dataset.idChat
    fetch(`/mensagens?chat=${idChatBD}`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(async response => {
        if (response.ok) return response.json();
        else {
            const erro = await response.json();
            throw { status: erro.status, message: erro.error};
        }
    })
    .then(data=>{
        console.log(data)
        for (let j = 0; j < data.length; j++) {
            if(document.querySelector(`#${chat}mensagem${j+1}`)){
                continue;
            }
            if(data[j].de==='empresa'){
                const novaMensagem = document.createElement('p')
                novaMensagem.className = 'empresa'
                novaMensagem.id = `${chat}mensagem${j+1}`
                novaMensagem.innerHTML = `${data[j].mensagem}`
                document.querySelector(`#${mensagens}`).appendChild(novaMensagem)
            }else
            if(data[j].de==='candidato'){
                const novaMensagem = document.createElement('p')
                novaMensagem.className = 'candidato'
                novaMensagem.id = `${chat}mensagem${j+1}`
                novaMensagem.innerHTML = `${data[j].mensagem}`
                document.querySelector(`#${mensagens}`).appendChild(novaMensagem)
            }
        }
    })
    .catch(erro => {
        console.error('Erro ao carregar mensagens:', erro);
    });
}

async function enviarMensagem(mensagem, chat, idDivChat, idDivMensagens) {
    if(mensagem===''){
        return alert('Mensagem nao pode estar vazia')
    }

    fetch('/mensagens',{
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem, chat }),
    })
    .then(async res=>{
        const resposta = await res.json();
        if(!res.ok) {
            throw new Error("Erro ao enviar mensagem"||resposta.error);
        }
        console.log('Mensagem enviada: ' + mensagem + ' Idchat:' + chat + 'Tipo: ' + resposta.tipo)

        // Conta quantas mensagens já existem na div
        const mensagensDiv = document.querySelector(`#${idDivMensagens}`);
        const totalMensagens = mensagensDiv.querySelectorAll('p').length;
        const novoId = `${idDivChat}mensagem${totalMensagens + 1}`;

        const mensagemEnviada = document.createElement('p')
        mensagemEnviada.innerHTML = `${mensagem}`
        mensagemEnviada.className = resposta.tipo === 'candidato' ? 'candidato' : 'empresa'
         mensagemEnviada.id = novoId;
        document.querySelector(`#${idDivMensagens}`).appendChild(mensagemEnviada)
    })
    .catch(erro=>{
        console.error('Erro ao enviar mensagens:', erro.message);
    })
    
}


setInterval(() => {
    // Procura a div de mensagens que está expandida (sem a classe minimized)
    const mensagensAbertas = document.querySelectorAll('.mensagens:not(.minimized)');
    mensagensAbertas.forEach(div => {
        const chatDiv = div.parentElement;
        if (chatDiv && div.id) {
            recarregarMensagens(chatDiv.id, div.id);
        }
    });
}, 5 * 1000);

setInterval(carregarChats, 60*1000);
carregarChats();