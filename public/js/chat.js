// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';
import socket from './notfSocketsConfig.js';
import carregarInfosUsuario from './infosUsuarios.js';
import { finalizarLoader, mostrarErroTopo } from '/js/globalFunctions.js';

const params = new URLSearchParams(window.location.search)
let usuarioTipo;
let usuarioNome;
let usuarioId;
let conversas = [];

function criarModal(mensagem, acao, conversa, valor, id){
    const modalOld = document.querySelector('#modalDelete');
    if(modalOld) modalOld.remove();
    const html = `
        <div id="modalDelete" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div id="modalDelete-content" class="bg-dark-800 rounded-xl p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4 text-center"><strong>${mensagem}</strong></h3>
                <div class="flex justify-center space-x-3">
                    <button id="btnCancelarDel" class="px-4 py-2 rounded-lg bg-dark-600 text-gray-300 hover:bg-dark-500 transition-colors">Cancelar</button>
                    <button id="btnConfirmarDel" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Confirmar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('btnCancelarDel').addEventListener('click',()=>{
        document.getElementById('modalDelete').remove();
    })
    switch (acao) {
        case 'block':
            document.getElementById('btnConfirmarDel').addEventListener('click', async()=>{
                try {
                    await axiosWe.patch('/chats/block', {idChat: id, bloqueado: valor});
                    conversa.bloqueadoStatus = valor;
                    if(valor) conversa.bloqueador = usuarioTipo;
                    const bloquearTxt = document.getElementById('bloquearTxt');
                    bloquearTxt.textContent = conversa.bloqueadoStatus ? 'Desbloquear' : 'Bloquear';
                    document.getElementById('modalDelete').remove();
                    if(valor) {
                        document.getElementById('current-chat-status').textContent = 'Offline';
                        document.getElementById('bolaStatus').className = "w-2 h-2 rounded-full bg-red-500 mr-2";
                        socket.emit('leaveRoom', id);
                    }
                    else socket.emit('joinRoom', id);
                } catch (erro) {
                    console.error(erro)
                    document.getElementById('modalDelete').remove();
                    mostrarErroTopo(erro.message);
                }
            }, {once: true})
            break;
        case 'clean':
            document.getElementById('btnConfirmarDel').addEventListener('click', async()=>{
                try {
                    if(conversa.mensagens.length === 0) return mostrarErroTopo(`A conversa com ${conversa.nome} já está vazia!`);
                    await axiosWe.delete(`/mensagens/limpar/${id}`);
                    conversa.mensagens = [];
                    conversa.ultimaMensagem = '';
                    document.getElementsByClassName('text-sm text-gray-400 truncate').textContent = '';
                    document.getElementById('messages-container').innerHTML = '';
                    document.querySelector('.bg-gray-700 .text-sm.text-gray-400.truncate').textContent = '';
                    document.querySelector('.bg-gray-700 .text-xs.text-gray-400.ml-2').textContent = '';
                } catch (erro) {
                    console.error(erro);
                    mostrarErroTopo(erro.message);
                }
                finally{
                    document.getElementById('modalDelete').remove();
                }
            }, {once: true})
            break;
        case 'remove':
            document.getElementById('btnConfirmarDel').addEventListener('click', async()=>{
                try {
                    await axiosWe.delete(`/chats/${id}`);
                    //window.location.href = '/chats';
                    estado.conversas = estado.conversas.filter(c => c.id !== id);
                    estado.conversaAtualId = 0;
                    carregarConversa(estado.conversaAtualId);
                    atualizarListaConversas();
                    socket.emit('leaveRoom', id);
                } catch (erro) {
                    console.error(erro);
                    mostrarErroTopo(erro.message);
                }
                finally{
                    document.getElementById('modalDelete').remove();
                }
            }, {once: true})
            break;
        default:
            break;
    }
}

document.querySelector('#fecharBtn').addEventListener('click', ()=>{
    estado.conversaAtualId = 0;
    carregarConversa(estado.conversaAtualId);

    document.querySelectorAll('#conversations-list > div').forEach(div => {
        div.classList.remove('bg-gray-700');
    });

    const menuDropdown = document.getElementById("menu-dropdown");
    menuDropdown.classList.toggle("hidden");
});

function hojeOntem(data){
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    // zera horas pra comparar só a parte da data
    const normalizar = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const dataNormalizada = normalizar(data);
    const hojeNormalizada = normalizar(hoje);
    const ontemNormalizada = normalizar(ontem);

    if (dataNormalizada.getTime() === hojeNormalizada.getTime()) {
        return "Hoje";
    } else if (dataNormalizada.getTime() === ontemNormalizada.getTime()) {
        return "Ontem";
    } else {
        return `${data.getDate().toString().padStart(2, '0')}/${data.getMonth().toString().padStart(2, '0')}/${data.getFullYear()}`
    }
}

async function carregarConversasBack() {
    const infosUsuario = await carregarInfosUsuario();
    
    if(infosUsuario==='visitante'){
        usuarioTipo = infosUsuario; 
        return
    };
    usuarioTipo = infosUsuario.tipo;
    usuarioNome = infosUsuario.nome;
    usuarioId = infosUsuario.id;
    document.querySelector('#FotoDePerfil').src = infosUsuario.foto;
    const response = usuarioTipo === 'candidato' ? await axiosWe('/chats/candidato'): await axiosWe('/chats/empresa')
    const data = response.data;
    
    conversas = data.map(chat=>{
        if(!chat.bloqueado) socket.emit('joinRoom', chat.id);
        const ct = {
            id: chat.id,
            bloqueadoStatus: chat.bloqueado,
            bloqueador: chat.bloqueador_tipo,
            remetente: usuarioTipo === 'candidato' ? chat.empresas.cnpj : String(chat.candidatos.id),
            statusRemetente: 'Offline',
            nome: usuarioTipo === 'candidato' ? chat.empresas.nome_fant : chat.candidatos.nome,
            ultimaMensagem: chat.mensagens.toReversed()[0]?.mensagem || '',
            hora: (() => {
                const msg = chat.mensagens.toReversed()[0]?.data_criacao
                if(!msg) return '';
                const horario = new Date(msg);
                const txtData = hojeOntem(horario);
                return `${txtData==='Hoje' ? `${String(horario.getHours()).padStart(2, "0")}:${String(horario.getMinutes()).padStart(2, "0")}` : `${txtData}`}`;
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
                        const txtData = hojeOntem(horario);
                        return `${txtData==='Hoje' ? '' : `${txtData} `}${String(horario.getHours()).padStart(2, "0")}:${String(horario.getMinutes()).padStart(2, "0")}`
                    })()
                }
            })
        };
        return ct;
    })
    return conversas;
}

socket.on('receivedMessage', async (message)=>{
    
    if(message.type === usuarioTipo) return;
    const conversa = estado.conversas.find(c => c.id === message.room);
    if (!conversa) return;
    carregarMsgRecebida(conversa, message)
    if(estado.conversaAtualId===message.room){
        try {
            conversa.naoLidas = 0;
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
    if(conversa.bloqueadoStatus) {
        conversa.bloqueadoStatus = false;
        conversa.bloqueador = null;
    }
    if(user.room===estado.conversaAtualId){
        document.getElementById('current-chat-status').textContent = conversa.statusRemetente;
        document.getElementById('bolaStatus').className = user.status === 'Online' ? "w-2 h-2 rounded-full bg-green-500 mr-2" : "w-2 h-2 rounded-full bg-red-500 mr-2";
    }
    
})

let dadosConversas;

document.addEventListener('DOMContentLoaded', async ()=>{
    dadosConversas = await carregarConversasBack();
    // ____________________________Const de ARQUIVOS_______________________________ 
    const attachButton = document.getElementById('attach-button');
    const attachmentMenu = document.getElementById('attachment-menu');

    // Inputs escondidos
    const inputDocumento = document.getElementById('input-documento');
    const inputFotos = document.getElementById('input-fotos');
    const inputCamera = document.getElementById('input-camera');

    // Botões do menu
    const btnDocumento = document.getElementById('btn-documento');
    const btnFotos = document.getElementById('btn-fotos');
    const btnCamera = document.getElementById('btn-camera');
    // ____________________________ARQUIVOS MODAL CONST_______________________________ 
    const modal = document.getElementById('modalConfirmacao');
    const fileName = document.getElementById('modal-file-name');
    const fileSize = document.getElementById('modal-file-size');
    const btnConfirmar = document.getElementById('btnConfirmarEnvio');
    const btnCancelar = document.getElementById('btnCancelarEnvio');

    const chatAtual = await (async()=>{
            const id = params.get('id');
            if(id){
                const atual = dadosConversas.find(cvs => cvs.remetente === id)?.id
                if(!atual){
                    try {
                        
                        const obj = {
                            empresa: usuarioTipo === 'candidato' ? id : usuarioId,
                            candidato: usuarioTipo === 'candidato' ? usuarioId : Number(id)
                        }
                        const response = await axiosWe.post('/chats', obj);
                        const chat = response.data
                        
                        if(!chat.bloqueado) socket.emit('joinRoom', chat.id);
                        conversas.push({
                            id: chat.id,
                            bloqueadoStatus: chat.bloqueado,
                            bloqueador: chat.bloqueador_tipo,
                            remetente: usuarioTipo === 'candidato' ? chat.empresas.cnpj : String(chat.candidatos.id),
                            statusRemetente: 'Offline',
                            nome: usuarioTipo === 'candidato' ? chat.empresas.nome_fant : chat.candidatos.nome,
                            ultimaMensagem: chat.mensagens.toReversed()[0]?.mensagem || '',
                            hora: (() => {
                                const msg = chat.mensagens.toReversed()[0]?.data_criacao
                                if(!msg) return '';
                                const horario = new Date(msg);
                                const txtData = hojeOntem(horario);
                                return `${txtData==='Hoje' ? `${String(horario.getHours()).padStart(2, "0")}:${String(horario.getMinutes()).padStart(2, "0")}` : `${txtData}`}`;
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
                                        const txtData = hojeOntem(horario);
                                        return `${txtData==='Hoje' ? '' : `${txtData} `}${String(horario.getHours()).padStart(2, "0")}:${String(horario.getMinutes()).padStart(2, "0")}`
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
    if (estado.conversaAtualId === 0) {
        document.getElementById("TelaBoasVindas").style.display = "flex";
        
    } else {
        document.getElementById("TelaBoasVindas").style.display = "none";
        
    }

    
    
    carregarConversas(dadosConversas);
    carregarConversa(estado.conversaAtualId);
    configurarEventos();
    atualizarContadorMensagens();
    finalizarLoader();
    //finalizarLoader()
    setInterval(()=>{
        socket.emit('refreshStatus');
    }, 5000)

    // _____________________________ARQUIVOS______________________________
    // Alternar visibilidade do menu
    attachButton.addEventListener('click', function () {
        attachmentMenu.classList.toggle('hidden');
        if (!attachmentMenu.classList.contains('hidden')) {
            attachmentMenu.classList.add('animate-slideIn');
        }
    });

    // Fechar ao clicar fora
    document.addEventListener('click', function (event) {
        if (!attachButton.contains(event.target) && !attachmentMenu.contains(event.target)) {
            attachmentMenu.classList.add('hidden');
        }
    });

    // Documento
    btnDocumento.addEventListener('click', () => inputDocumento.click());
    inputDocumento.addEventListener('change', function () {
        const arquivo = this.files[0];
        if (arquivo && arquivo.size > 2 * 1024 * 1024) { // 2MB
            alert("O arquivo deve ter no máximo 2MB.");
            this.value = "";
            return;
        }
        if (arquivo) {
            console.log("Documento selecionado:", arquivo);
            // Aqui você envia para o backend
            // uploadArquivo(arquivo, "documento") funcionando 
        }
    });

    // Fotos
    btnFotos.addEventListener('click', () => inputFotos.click());
    inputFotos.addEventListener('change', function () {
        const arquivo = this.files[0];
        if (arquivo) {
            console.log("Foto selecionada:", arquivo);
            // uploadArquivo funcionando!
        }
    });

    // Câmera
    btnCamera.addEventListener('click', () => inputCamera.click());

    inputCamera.addEventListener('change', function () {
    const arquivo = this.files[0];
    if (arquivo) {
        // Preview imediato, como no WhatsApp
        const preview = URL.createObjectURL(arquivo);
        renderArquivo({
            name: arquivo.name,
            size: arquivo.size,
            type: arquivo.type,
            link: preview
        }, "camera");

        // Aqui você ainda pode enviar pro backend
        // uploadArquivo(arquivo, "camera");
    }
    });

    // _____________________________MODAL______________________________
    let arquivoSelecionado = null;

    function mostrarModal(arquivo) {
        arquivoSelecionado = arquivo;
        fileName.textContent = arquivo.name;
        fileSize.textContent = `${(arquivo.size / 1024).toFixed(2)} KB`;
        modal.classList.remove('hidden');
    }

    function fecharModal() {
        modal.classList.add('hidden');
        arquivoSelecionado = null;
    }

    inputDocumento.addEventListener('change', function () {
        if (this.files.length > 0) {
            mostrarModal(this.files[0]);
            this.value = "";
        }
    });

    inputFotos.addEventListener('change', function () {
        if (this.files.length > 0) {
            mostrarModal(this.files[0]);
            this.value = "";
        }
    });

    inputCamera.addEventListener('change', function () {
        if (this.files.length > 0) {
            mostrarModal(this.files[0]);
            this.value = "";
        }
    });

    btnConfirmar.addEventListener('click', function () {
        if (arquivoSelecionado) {
            renderArquivo(arquivoSelecionado, 'enviado');
            fecharModal();
        }
    });

    btnCancelar.addEventListener('click', function () {
        fecharModal();
    });

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            fecharModal();
        }
    });
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
                mudarConversa(conversa.id); 
                atualizarListaConversas();
            } else {
                mudarConversa(conversa.id);
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
        
        if (estado.contadorFavoritos >= 3) {
            mostrarErroTopo('Você só pode favoritar no máximo 3 conversas.');
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
function mudarConversa(conversaId) {
    const containerMensagens = document.getElementById('messages-container');
    containerMensagens.style.opacity = '0';

    
    estado.conversaAtualId = conversaId;
    carregarConversa(conversaId);
    atualizarListaConversas();
    containerMensagens.style.opacity = '1';
    
}

// Carregar conversa ativa
async function carregarConversa(conversaId) {
    const conversa = estado.conversas.find(c => c.id === conversaId);
    if (!conversa) return document.getElementById("TelaBoasVindas").style.display = "flex";
    document.getElementById("TelaBoasVindas").style.display = "none";
    
    
    document.getElementById('current-chat-name').textContent = conversa.nome;
    document.getElementById('current-chat-avatar').src = conversa.avatar;
    document.getElementById('current-chat-status').textContent = conversa.statusRemetente;
    document.getElementById('bolaStatus').className = conversa.statusRemetente === 'Online' ? "w-2 h-2 rounded-full bg-green-500 mr-2" : "w-2 h-2 rounded-full bg-red-500 mr-2";
    const bloquearTxt = document.getElementById('bloquearTxt');
    const txt = conversa.bloqueadoStatus && conversa.bloqueador === usuarioTipo ? 'Desbloquear' : 'Bloquear';
    bloquearTxt.textContent = txt;
    const oldBlock = document.getElementById("bloquearBtn");
    const newBlock = oldBlock.cloneNode(true);
    oldBlock.parentNode.replaceChild(newBlock, oldBlock);
    newBlock.addEventListener('click', ()=>{
        criarModal(`Tem certeza que deseja ${txt} ${conversa.nome}?`, 'block', conversa, !conversa.bloqueadoStatus, conversa.id);
    });

    const oldClean = document.getElementById("limparBtn");
    const newClean = oldClean.cloneNode(true);
    oldClean.parentNode.replaceChild(newClean, oldClean);
    newClean.addEventListener('click', ()=>{
        criarModal(`Tem certeza que deseja limpar a conversa com ${conversa.nome} (Esta ação é irreversível e apagará completamente todas as mensagens desta conversa)?`, 'clean', conversa, true, conversa.id);
    });

    const oldRemove = document.getElementById("apagarBtn");
    const newRemove = oldRemove.cloneNode(true);
    oldRemove.parentNode.replaceChild(newRemove, oldRemove);
    newRemove.addEventListener('click', ()=>{
        criarModal(`Tem certeza que deseja apagar a conversa com ${conversa.nome} (Esta ação é irreversível e apagará completamente esta conversa)?`, 'remove', conversa, true, conversa.id);
    });

    const containerMensagens = document.getElementById('messages-container');
    containerMensagens.innerHTML = '';

    conversa.mensagens.forEach(mensagem => {
        const elemento = criarElementoMensagem(mensagem);
        containerMensagens.appendChild(elemento);
    });
    

    rolarParaFim();
    estado.contadorMensagens = conversa.mensagens.length;
    atualizarContadorMensagens();
    try {
        
        if(conversa.naoLidas===0) return;
        
        conversa.naoLidas = 0;
        await axiosWe.patch('/mensagens/vizualizar', { chatId: conversaId })
    } catch (erro) {
        console.error(erro)
    }
}

function validarSeEhArquivo(texto){
    const textoSplited = texto.split('|');
    if(textoSplited.length !== 4) return false;
    const [prefixo, url, size, sufixo] = textoSplited;
    if(prefixo!=='NewSendFile' || sufixo!=='fileNew' || !size.endsWith('KB') || !url.startsWith('https://res.cloudinary.com/dr0mhgdbr/raw/upload/')) return false;
    const filename = url.split('/').pop();
    const extensao = filename.split('.').pop().toUpperCase();
    return {url, size, filename, extensao};
}

function transformarLinksEmAnchors(mensagem) {
  const regex = /(https?:\/\/[^\s]+)/g;
  return mensagem.replace(regex, '<a href="$1" target="_blank" class="text-blue-400 underline hover:text-blue-600">$1</a>');
}

// Criar elemento de mensagem
function criarElementoMensagem(mensagem) {
    const div = document.createElement('div');
    const ehUsuario = mensagem.remetente === 'usuario';

    div.className = `mb-2 flex ${ehUsuario ? 'justify-end' : 'justify-start'} fade-in`;
    div.dataset.mensagem = mensagem.texto.toLowerCase();

    const ehArquivo = validarSeEhArquivo(mensagem.texto);

    if(!ehArquivo){
        div.innerHTML = `
            <div class="max-w-md px-3 py-2 text-sm shadow-md flex items-end gap-2
                ${ehUsuario
                        ? 'bg-purple-900 text-white rounded-2xl rounded-br-sm'
                        : 'bg-gray-700 text-gray-100 rounded-2xl rounded-bl-sm'}">
                
                <p class="whitespace-pre-wrap break-words">${transformarLinksEmAnchors(mensagem.texto)}</p>
                <span class="text-[10px] opacity-80">${mensagem.hora}</span>
            </div>
        `;
    } else{
        div.innerHTML = `
            <div class="mensagem-arquivo ${ehUsuario ?
                'bg-purple-900' :
                'bg-dark-800' 
            } rounded-xl p-3 flex items-center justify-between w-100 shadow-md my-2">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-file-zipper text-yellow-400 text-3xl"></i>
                    <div>
                        <p class="text-white font-semibold text-sm truncate">${ehArquivo.filename}</p>
                        <p class="text-gray-400 text-xs">${ehArquivo.extensao} • ${ehArquivo.size}</p>
                    </div>
                </div>
                <button class="download-btn text-gray-300 hover:text-white">
                    <i class="fa-solid fa-download text-lg"></i>
                </button>
            </div>
        `;
        const downloadIcon = div.querySelector('.fa-download');
        downloadIcon.addEventListener('click', ()=>{
            axiosWe.download(ehArquivo.url)
        })
    }
    
    return div;
}



// Enviar mensagem
async function enviarMensagem() {
    const input = document.getElementById('message-input');
    const texto = input.value.trim();
    if (!texto) return;

    const conversa = estado.conversas.find(c => c.id === estado.conversaAtualId);
    if (!conversa) return;

    if(conversa.bloqueadoStatus) {
        input.value = '';
        input.style.height = 'auto';
        mostrarErroTopo('Você não pode mandar mensagem para este chat, pois ele está bloqueado.')
        return;
    }

    const agora = new Date();
    const hora = `${agora.getHours()}:${agora.getMinutes().toString().padStart(2, '0')}`;

    const novaMensagem = { texto: texto, remetente: 'usuario', hora: hora };

    conversa.mensagens.push(novaMensagem);
    conversa.ultimaMensagem = texto;
    conversa.hora = hora;

    const containerMensagens = document.getElementById('messages-container');
    const novaMsg = criarElementoMensagem(novaMensagem);
    containerMensagens.appendChild(novaMsg);

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
    
    try {
        await axiosWe.post('/mensagens', {
            autor: usuarioNome,
            mensagem: texto,
            chat: estado.conversaAtualId,
            de: usuarioTipo
        })
        socket.emit('sendMessage', messageObject);
    } catch (erro) {
        console.error(erro);
        novaMsg.remove();
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
        //alert('Nenhum resultado encontrado para: ' + termo);
    }
}

function destacarResultadoAtual() {
    const elementos = document.querySelectorAll('#messages-container > div');
    elementos.forEach(el => {
        const msgDiv = el.querySelector('div');
        if(msgDiv) msgDiv.style.border = 'none';
        el.classList.remove('active-search-result');
    });

    if (estado.indicePesquisaAtual >= 0 && estado.indicePesquisaAtual < estado.resultadosPesquisa.length) {
        const idx = estado.resultadosPesquisa[estado.indicePesquisaAtual];
        const el = elementos[idx];
        if (el) {
            const msgDiv = el.querySelector('div'); 
            if(msgDiv) msgDiv.style.border = '2px solid white';
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


  // Configurações de conversa--------------------------------------------MAIS TRABALHO AZEVEDO!!!!!!!!!
const menuToggle = document.getElementById("menu-toggle");
  const menuDropdown = document.getElementById("menu-dropdown");

  menuToggle.addEventListener("click", () => {
    menuDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.add("hidden");
    }
});

function renderArquivo(arquivo, tipo, jaBaixado = false) {
    const container = document.getElementById("messages-container");

    let html = "";

    if (tipo === "documento") {
        if (!jaBaixado) {
            // Pré-download
            html = `
            <div class="mensagem-arquivo bg-dark-800 rounded-xl p-3 flex items-center justify-between w-80 shadow-md my-2">
              <div class="flex items-center gap-3">
                <i class="fa-solid fa-file text-purple-400 text-3xl"></i>
                <div>
                  <p class="text-white font-semibold text-sm truncate">${arquivo.name}</p>
                  <p class="text-gray-400 text-xs">${arquivo.type.toUpperCase()} • ${(arquivo.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button class="download-btn text-gray-300 hover:text-white" onclick="baixarArquivo('${arquivo.link}', '${arquivo.name}')">
                <i class="fa-solid fa-download text-lg"></i>
              </button>
            </div>`;
        } else {
            // Pós-download
            html = `
            <div class="mensagem-arquivo bg-dark-800 rounded-xl p-3 flex flex-col w-80 shadow-md my-2">
              <p class="text-white font-semibold text-sm truncate mb-2">${arquivo.name}</p>
              <p class="text-gray-400 text-xs mb-3">${arquivo.type.toUpperCase()} • ${(arquivo.size / 1024).toFixed(1)} KB</p>
              <div class="flex gap-2">
                <button class="flex-1 bg-dark-700 hover:bg-gray-700 text-white text-sm py-2 rounded-lg">Abrir</button>
                <button class="flex-1 bg-dark-700 hover:bg-gray-700 text-white text-sm py-2 rounded-lg">Salvar como...</button>
              </div>
            </div>`;
        }
    }

    if (tipo === "foto" || tipo === "camera") {
        html = `
        <div class="mensagem-imagem bg-dark-800 rounded-xl p-2 w-64 shadow-md my-2">
          <img src="${arquivo.link}" alt="Imagem enviada"
               class="rounded-lg w-full h-auto object-cover mb-2">
          <div class="flex justify-between text-xs text-gray-400">
            <span>${tipo === "camera" ? "Foto da câmera" : "Foto"} • ${(arquivo.size / 1024).toFixed(1)} KB</span>
            <button class="text-primary-500 hover:underline" onclick="baixarArquivo('${arquivo.link}', '${arquivo.name}')">Baixar</button>
          </div>
        </div>`;
    }

    container.insertAdjacentHTML("beforeend", html);
    container.scrollTop = container.scrollHeight;
}

function baixarArquivo(link, nome) {
    // Aqui chamamos o backend para gerar o link de download
    const a = document.createElement("a");
    a.href = link;  // link retornado para a Cloudinary
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
