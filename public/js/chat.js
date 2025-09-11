// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';
import socket from './notfSocketsConfig.js';
import carregarInfosUsuario from './infosUsuarios.js';

const params = new URLSearchParams(window.location.search)
let usuarioTipo;
let usuarioNome;
let usuarioId;
let conversas = [];

async function carregarConversasBack() {
    const infosUsuario = await carregarInfosUsuario();
    console.log(infosUsuario)
    if(infosUsuario==='visitante'){
        usuarioTipo = infosUsuario; 
        return
    };
    usuarioTipo = infosUsuario.tipo;
    usuarioNome = infosUsuario.nome;
    usuarioId = infosUsuario.id;
    const response = usuarioTipo === 'candidato' ? await axiosWe('/chats/candidato'): await axiosWe('/chats/empresa')
    const data = response.data;
    console.log(data)
    conversas = data.map(chat=>{
        socket.emit('joinRoom', chat.id);
        const ct = {
            id: chat.id,
            remetente: usuarioTipo === 'candidato' ? chat.empresas.cnpj : String(chat.candidatos.id),
            statusRemetente: 'offline',
            nome: usuarioTipo === 'candidato' ? chat.empresas.nome_fant : chat.candidatos.nome,
            ultimaMensagem: chat.mensagens.toReversed()[0]?.mensagem || '',
            hora: (() => {
                const msg = chat.mensagens.toReversed()[0]?.data_criacao
                if(!msg) return '';
                const horario = new Date(msg);
                return `${String(horario.getHours()).padStart(2, "0")}:${String(horario.getMinutes()).padStart(2, "0")}`;
            })(),
            naoLidas: (()=>{
                const naoLidas = chat.mensagens.reduce((ac, msg)=>{
                    if(msg.de !== usuarioTipo && !msg.status){
                        ac++
                    }
                    return ac;
                }, 0);
                return naoLidas;
            })(),
            avatar: usuarioTipo === 'candidato' ? chat.empresas.foto : chat.candidatos.foto,
            favoritada: (usuarioTipo === 'candidato' ? chat.favoritos_chats_cand[0] : chat.favoritos_chats_emp[0]) ? true : false,
            mensagens: chat.mensagens.map(msg=>{
                return {
                    texto: msg.mensagem,
                    remetente: msg.de === usuarioTipo ? 'usuario' : 'eles',
                    hora: (()=>{
                        const horario = new Date(msg.data_criacao);
                        return `${String(horario.getHours()).padStart(2, "0")}:${String(horario.getMinutes()).padStart(2, "0")}`
                    })()
                }
            })
        };
        return ct;
    })
    return conversas;
}

socket.on('receivedMessage', async (message)=>{
    console.log(message)
    if(message.type === usuarioTipo) return;
    const conversa = estado.conversas.find(c => c.id === message.room);
    carregarMsgRecebida(conversa, message)
    if (!conversa) return;
    if(conversa.id===message.room){
        try {
            console.log('lendo msgs...')
            await axiosWe.patch('/mensagens/vizualizar', { chatId: message.room })
        } catch (erro) {
            console.error(erro)
        }
    }
})

let estado;

socket.on('userStatus', (user)=>{
    if(user.socket===socket.id) return;
    const conversa = estado.conversas.find(c => c.id === user.room);
    conversa.statusRemetente = user.status;
    if(user.room===estado.conversaAtualId){
        document.getElementById('current-chat-status').textContent = conversa.statusRemetente;
        document.getElementById('bolaStatus').className = user.status === 'online' ? "w-2 h-2 rounded-full bg-green-500 mr-2" : "w-2 h-2 rounded-full bg-red-500 mr-2";
    }
    console.log(user)
})

let dadosConversas;

document.addEventListener('DOMContentLoaded', async ()=>{
    dadosConversas = await carregarConversasBack();
    console.log(dadosConversas)
    const chatAtual = await (async()=>{
            const id = params.get('id');
            if(id){
                const atual = dadosConversas.find(cvs => cvs.remetente === id)?.id
                if(!atual){
                    try {
                        console.log("Criando novo chat")
                        const obj = {
                            empresa: usuarioTipo === 'candidato' ? id : usuarioId,
                            candidato: usuarioTipo === 'candidato' ? usuarioId : Number(id)
                        }
                        const response = await axiosWe.post('/chats', obj);
                        const chat = response.data
                        console.log(chat)
                        socket.emit('joinRoom', chat.id);
                        conversas.push({
                            id: chat.id,
                            remetente: usuarioTipo === 'candidato' ? chat.empresas.cnpj : String(chat.candidatos.id),
                            statusRemetente: 'offline',
                            nome: usuarioTipo === 'candidato' ? chat.empresas.nome_fant : chat.candidatos.nome,
                            ultimaMensagem: chat.mensagens.toReversed()[0]?.mensagem || '',
                            hora: (() => {
                                const msg = chat.mensagens.toReversed()[0]?.data_criacao
                                if(!msg) return '';
                                const horario = new Date(msg);
                                return `${String(horario.getHours()).padStart(2, "0")}:${String(horario.getMinutes()).padStart(2, "0")}`;
                            })(),
                            naoLidas: (()=>{
                                const naoLidas = chat.mensagens.reduce((ac, msg)=>{
                                    if(msg.de !== usuarioTipo && !msg.status){
                                        ac++
                                    }
                                    return ac;
                                }, 0);
                                return naoLidas;
                            })(),
                            avatar: usuarioTipo === 'candidato' ? chat.empresas.foto : chat.candidatos.foto,
                            favoritada: (usuarioTipo === 'candidato' ? chat.favoritos_chats_cand[0] : chat.favoritos_chats_emp[0]) ? true : false,
                            mensagens: chat.mensagens.map(msg=>{
                                return {
                                    texto: msg.mensagem,
                                    remetente: msg.de === usuarioTipo ? 'usuario' : 'eles',
                                    hora: (()=>{
                                        const horario = new Date(msg.data_criacao);
                                        return `${String(horario.getHours()).padStart(2, "0")}:${String(horario.getMinutes()).padStart(2, "0")}`
                                    })()
                                }
                            })
                        })
                        return chat.id;
                    } catch (erro) {
                        console.error(erro)
                        return 0;
                    }
                    
                }
                return atual;
            }
            else return 0;
        })();
    
    // Estado dos perfis 
    estado = {
        conversaAtualId: chatAtual,
        conversas: [],
        contadorMensagens: 0,
        contadorFavoritos: (()=>
            dadosConversas.reduce((acc, dado)=>{
                if(dado.favoritada){
                    acc++
                }
                return acc;
            }, 0)
        )(),
        resultadosPesquisa: [],
        indicePesquisaAtual: -1
    };
    
    carregarConversas(dadosConversas);
    carregarConversa(estado.conversaAtualId);
    configurarEventos();
    atualizarContadorMensagens();
    setInterval(()=>{
        socket.emit('refreshStatus');
    }, 5000)
})

// Carregar lista de conversas
function carregarConversas(dadosConversas) {
    estado.conversas = dadosConversas;
    atualizarListaConversas();
}

// Criar elemento de conversa para a sidebar
function criarElementoConversa(conversa) {
    const ativa = conversa.id === estado.conversaAtualId;
    const div = document.createElement('div');
    div.className = `flex items-center p-3 hover:bg-gray-700 cursor-pointer transition-colors mb-1 rounded-lg ${ativa ? 'bg-gray-700' : ''}`;
    div.dataset.id = conversa.id;

    div.innerHTML = `
    <div class="flex items-center w-full">
        <div class="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
            <img src="${conversa.avatar}" class="w-full h-full object-cover rounded-full">
        </div>
        <div class="ml-3 flex-1 min-w-0">
            <div class="flex justify-between items-baseline">
                <h3 class="font-semibold truncate">${conversa.nome}</h3>
                <span class="text-xs text-gray-400 ml-2">${conversa.hora}</span>
            </div>
            <p class="text-sm text-gray-400 truncate">${conversa.ultimaMensagem}</p>
        </div>
        ${conversa.naoLidas > 0 ? `
            <div class="ml-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                ${conversa.naoLidas}
            </div>
        ` : ''}
        <button class="ml-2 botao-favorito p-1 rounded-full ${conversa.favoritada ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}" 
                data-id="${conversa.id}">
            <i class="fa-star ${conversa.favoritada ? 'fa-solid' : 'fa-regular'}"></i>
        </button>
    </div>
`;

    // Estrela de favorito
    div.addEventListener('click', async (e) => {
        if (!e.target.closest('.botao-favorito')) {
            if (conversa.naoLidas > 0) {
                conversa.naoLidas = 0;
                await mudarConversa(conversa.id);
                atualizarListaConversas();
            } else {
                await mudarConversa(conversa.id);
            }
        }
    });

    const botaoFavorito = div.querySelector('.botao-favorito');
    botaoFavorito.addEventListener('click', async (e) => {
        e.stopPropagation();
        await alternarFavorito(conversa.id);
    });

    return div;
}

// Favoritar conversa 
async function alternarFavorito(conversaId) {
    const conversa = estado.conversas.find(c => c.id === conversaId);
    if (!conversa) return;

    if (conversa.favoritada) {
        conversa.favoritada = false;
        estado.contadorFavoritos--;
        try {
            await axiosWe.delete(`/favoritos/chat/${conversaId}`);
        } catch (erro) {
            console.error(erro);
        }
    } else {
        console.log(estado.contadorFavoritos)
        if (estado.contadorFavoritos >= 3) {
            alert('Você só pode favoritar no máximo 3 conversas.');
            return;
        }
        conversa.favoritada = true;
        estado.contadorFavoritos++;
        try {
            await axiosWe.post('/favoritos/chat', {chatId: conversaId});
        } catch (erro) {
            console.error(erro);
        }
    }

    atualizarListaConversas();
}

// Mudar de conversa
async function mudarConversa(conversaId) {
    const containerMensagens = document.getElementById('messages-container');
    containerMensagens.style.opacity = '0';

    
    estado.conversaAtualId = conversaId;
    carregarConversa(conversaId);
    atualizarListaConversas();
    containerMensagens.style.opacity = '1';

    try {
        const conversa = estado.conversas.find(c => c.id === conversaId);
        if (!conversa) return;
        await axiosWe.patch('/mensagens/vizualizar', { chatId: conversaId })
    } catch (erro) {
        console.error(erro)
    }
    
}

// Carregar conversa ativa
function carregarConversa(conversaId) {
    const conversa = estado.conversas.find(c => c.id === conversaId);
    if (!conversa) return;
    console.log(conversa)
    document.getElementById('current-chat-name').textContent = conversa.nome;
    document.getElementById('current-chat-avatar').src = conversa.avatar;
    document.getElementById('current-chat-status').textContent = conversa.statusRemetente;
    document.getElementById('bolaStatus').className = conversa.statusRemetente === 'online' ? "w-2 h-2 rounded-full bg-green-500 mr-2" : "w-2 h-2 rounded-full bg-red-500 mr-2";

    const containerMensagens = document.getElementById('messages-container');
    containerMensagens.innerHTML = '';

    conversa.mensagens.forEach(mensagem => {
        const elemento = criarElementoMensagem(mensagem);
        containerMensagens.appendChild(elemento);
    });

    rolarParaFim();
    estado.contadorMensagens = conversa.mensagens.length;
    atualizarContadorMensagens();
}

// Criar elemento de mensagem
function criarElementoMensagem(mensagem) {
    const div = document.createElement('div');
    const ehUsuario = mensagem.remetente === 'usuario';

    div.className = `mb-2 flex ${ehUsuario ? 'justify-end' : 'justify-start'} fade-in`;
    div.dataset.mensagem = mensagem.texto.toLowerCase();

    div.innerHTML = `
<div class="max-w-md px-3 py-2 text-sm shadow-md flex items-end gap-2
    ${ehUsuario
            ? 'bg-purple-900 text-white rounded-2xl rounded-br-sm'
            : 'bg-gray-700 text-gray-100 rounded-2xl rounded-bl-sm'}">
    
    <p class="whitespace-pre-wrap break-words">${mensagem.texto}</p>
    <span class="text-[10px] opacity-80">${mensagem.hora}</span>
</div>
`;
    return div;
}



// Enviar mensagem
async function enviarMensagem() {
    const input = document.getElementById('message-input');
    const texto = input.value.trim();
    if (!texto) return;

    const conversa = estado.conversas.find(c => c.id === estado.conversaAtualId);
    if (!conversa) return;

    const agora = new Date();
    const hora = `${agora.getHours()}:${agora.getMinutes().toString().padStart(2, '0')}`;

    const novaMensagem = { texto: texto, remetente: 'usuario', hora: hora };

    conversa.mensagens.push(novaMensagem);
    conversa.ultimaMensagem = texto;
    conversa.hora = hora;

    const containerMensagens = document.getElementById('messages-container');
    containerMensagens.appendChild(criarElementoMensagem(novaMensagem));

    input.value = '';
    input.style.height = 'auto';

    rolarParaFim();
    estado.contadorMensagens++;
    atualizarContadorMensagens();
    atualizarListaConversas();

    const messageObject = {
        author: usuarioNome,
        message: texto,
        room: estado.conversaAtualId,
        type: usuarioTipo,
    };
    console.log(messageObject)

    socket.emit('sendMessage', messageObject);

    try {
        await axiosWe.post('/mensagens', {
            autor: usuarioNome,
            mensagem: texto,
            chat: estado.conversaAtualId,
            de: usuarioTipo
        })
    } catch (erro) {
        console.error(erro)
    }

    //setTimeout(() => simularResposta(conversa), 1000 + Math.random() * 2000);
}

// Simular resposta automática (pode apagar)
function carregarMsgRecebida(conversa, message) {
    // const respostas = [
    //     "Entendi, como posso ajudar?",
    //     "Interessante, conte-me mais.",
    //     "Estou processando sua solicitação...",
    //     "Hmm, preciso verificar isso.",
    //     "Ok, anotado!",
    //     "Ótima pergunta! Deixe-me pensar...",
    //     "Obrigado por compartilhar isso.",
    //     "Estou aqui para ajudar no que precisar."
    // ];

    const agora = new Date();
    const hora = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;

    const resposta = { texto: message.message, remetente: 'eles', hora: hora };

    conversa.mensagens.push(resposta);
    conversa.ultimaMensagem = resposta.texto;
    conversa.hora = hora;

    const containerMensagens = document.getElementById('messages-container');
    if(conversa.id===estado.conversaAtualId) {
        containerMensagens.appendChild(criarElementoMensagem(resposta));
    }
    else{
        conversa.naoLidas++;
    }

    rolarParaFim();
    estado.contadorMensagens++;
    atualizarContadorMensagens();
    atualizarListaConversas();
}

// Rolar para o fim
function rolarParaFim() {
    const containerMensagens = document.getElementById('messages-container');
    containerMensagens.scrollTop = containerMensagens.scrollHeight;
}

// Atualizar lista de conversas
function atualizarListaConversas() {
    estado.conversas.sort((a, b) => {
        if (a.favoritada === b.favoritada) return b.id - a.id;
        return a.favoritada ? -1 : 1;
    });

    const lista = document.getElementById('conversations-list');
    lista.innerHTML = '';

    const favoritas = estado.conversas.filter(c => c.favoritada);
    favoritas.forEach(c => lista.appendChild(criarElementoConversa(c)));

    if (favoritas.length > 0 && favoritas.length < estado.conversas.length) {
        const separador = document.createElement('div');
        separador.className = 'px-4 py-2 text-xs text-gray-500 uppercase font-semibold';
        separador.textContent = 'Conversas';
        lista.appendChild(separador);
    }

    const naoFavoritas = estado.conversas.filter(c => !c.favoritada);
    naoFavoritas.forEach(c => lista.appendChild(criarElementoConversa(c)));
}

// Atualizar contador de mensagens
function atualizarContadorMensagens() {
    document.getElementById('message-counter').textContent = `${estado.contadorMensagens} mensagens nesta conversa`;
}

// Pesquisa por filtragem de mensagem 
function realizarPesquisa() {
    const termo = document.getElementById('search-input').value.trim().toLowerCase();
    const elementos = document.querySelectorAll('#messages-container > div');

    // Limpa destaques antigos (não está funcionando direito)
    elementos.forEach(el => {
        const divMsg = el.querySelector('p');
        divMsg.innerHTML = divMsg.textContent;
    });

    if (!termo) {
        estado.resultadosPesquisa = [];
        estado.indicePesquisaAtual = -1;
        return;
    }

    estado.resultadosPesquisa = [];

    // Do mais recente para o mais antigo
    for (let i = elementos.length - 1; i >= 0; i--) {
        const el = elementos[i];
        const texto = el.dataset.mensagem;
        if (texto && texto.includes(termo)) {
            estado.resultadosPesquisa.push(i);
            const divMsg = el.querySelector('p');

            // Destaca todas as ocorrências do termo
            const regex = new RegExp(`(${termo})`, 'gi');
            divMsg.innerHTML = divMsg.textContent.replace(regex, '<span class="search-h">$1</span>');
        }
    }

    if (estado.resultadosPesquisa.length > 0) {
        estado.indicePesquisaAtual = 0; // primeira mensagem = mais recente
        destacarResultadoAtual();
    } else {
        estado.indicePesquisaAtual = -1;
        alert('Nenhum resultado encontrado para: ' + termo);
    }
}

function destacarResultadoAtual() {
    const elementos = document.querySelectorAll('#messages-container > div');
    elementos.forEach(el => { el.classList.remove('active-search-result'); el.style.border = 'none'; });

    if (estado.indicePesquisaAtual >= 0 && estado.indicePesquisaAtual < estado.resultadosPesquisa.length) {
        const idx = estado.resultadosPesquisa[estado.indicePesquisaAtual];
        const el = elementos[idx];
        if (el) {
            el.classList.add('active-search-result');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function limparPesquisa() {
    estado.resultadosPesquisa = [];
    estado.indicePesquisaAtual = -1;

    const elementos = document.querySelectorAll('#messages-container > div');
    elementos.forEach(el => {
        el.classList.remove('active-search-result');
        const divMsg = el.querySelector('p');
        if (divMsg) divMsg.innerHTML = divMsg.textContent;
    });

    document.getElementById('search-bar').classList.add('hidden');
}

function proximoResultado() {
    if (estado.resultadosPesquisa.length === 0) return;
    estado.indicePesquisaAtual++;
    if (estado.indicePesquisaAtual >= estado.resultadosPesquisa.length) estado.indicePesquisaAtual = 0;
    destacarResultadoAtual();
}

function resultadoAnterior() {
    if (estado.resultadosPesquisa.length === 0) return;
    estado.indicePesquisaAtual--;
    if (estado.indicePesquisaAtual < 0) estado.indicePesquisaAtual = estado.resultadosPesquisa.length - 1;
    destacarResultadoAtual();
}

// Configuração de eventos
function configurarEventos() {
    document.getElementById('send-button').addEventListener('click', enviarMensagem);

    document.getElementById('message-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagem(); }
        setTimeout(() => { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; }, 0);
    });

    document.getElementById('search-toggle').addEventListener('click', function () {
        const barra = document.getElementById('search-bar');
        barra.classList.toggle('hidden');
        if (!barra.classList.contains('hidden')) document.getElementById('search-input').focus();
        else limparPesquisa();
    });

    document.getElementById('search-close').addEventListener('click', limparPesquisa);
    document.getElementById('search-input').addEventListener('input', realizarPesquisa);
    document.getElementById('search-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') realizarPesquisa(); });

    document.getElementById('search-next').addEventListener('click', resultadoAnterior);
    document.getElementById('search-prev').addEventListener('click', proximoResultado);
}