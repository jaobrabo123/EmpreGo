document.querySelector('#selectTabelas').addEventListener('change', (option)=>{
    const tabela = option.target.value
    carregarTabela(tabela)
})

document.querySelector('#dataCriacao').addEventListener('change', ()=>{
    const tabela = document.querySelector('#selectTabelas').value
    carregarTabela(tabela)
})

document.querySelector('#todosDados').addEventListener('change', ()=>{
    const tabela = document.querySelector('#selectTabelas').value
    carregarTabela(tabela)
})

let candidatos = null;
let empresas = null;
let experiencias = null;
let tags = null;

const carregando = document.querySelector('#carregando')
const tabelaContent = document.querySelector('#tabelaContent')
const titleTable = document.querySelector('#titleTable')
const infoExtra = [
    'descricao','cpf','estado','cidade','instagram',
    'github','youtube','twitter','pronomes','setor',
    'porte','data_fund','contato','site','nivel'
]

async function carregarTabela(tabela) {
    const mostrarDataCriacao = document.querySelector('#dataCriacao').checked;
    const mostrarTodosDados = document.querySelector('#todosDados').checked;

    carregando.style.display = ''
    tabelaContent.style.display = 'none'
    
    let conteudo
    titleTable.textContent = tabela
    if(tabela==='Candidatos'){
        if(candidatos){
            conteudo = candidatos
        }else{
            console.log('Pegando candidatos')
            
            candidatos = await fetch('/candidatos/all',{
                method: 'GET',
                credentials: 'include',
            })
            .then(async res =>{
                let data = await res.json();
                if(!res.ok) return {status: res.status, error: data.error};
                return data;
            })
            conteudo = candidatos
        }
    }else
    if(tabela==='Empresas'){
        if(empresas){
            conteudo = empresas
        }else{
            console.log('Pegando empresas')
            empresas = await fetch('/empresas/all',{
                method: 'GET',
                credentials: 'include',
            })
            .then(async res =>{
                let data = await res.json();
                if(!res.ok) return {status: res.status, error: data.error};
                return data;
            })
            conteudo = empresas
        }
    }else
    if(tabela==='Experiencias'){
        if(experiencias){
            conteudo = experiencias
        }else{
            console.log('Pegando experiências')
            experiencias = await fetch('/experiencias/all',{
                method: 'GET',
                credentials: 'include',
            })
            .then(async res =>{
                let data = await res.json();
                if(!res.ok) return {status: res.status, error: data.error};
                return data;
            })
            conteudo = experiencias
        }
    }else
    if(tabela==='Tags'){
        if(tags){
            conteudo = tags
        }else{
            console.log('Pegando tags')
            tags = await fetch('/tags/all',{
                method: 'GET',
                credentials: 'include',
            })
            .then(async res =>{
                let data = await res.json();
                if(!res.ok) return {status: res.status, error: data.error};
                return data;
            })
            conteudo = tags
        }
    }
    
    if(conteudo.error) {
        if(conteudo.status===500){
            alert('Erro de conexão com o Banco de Dados (a culpa não foi sua, tente acessar a página novamente).')
            window.location.href = '/';
        }
        else{
            alert(conteudo.error);
            window.location.href = '/';
        }
    }
    document.querySelector('body').style.display = ''
    console.log(conteudo)
    const tabelaHead = document.querySelector('#tabelaHead')
    const tabelaBody = document.querySelector('#tabelaBody')
    tabelaHead.innerHTML = '';
    tabelaBody.innerHTML = '';

    const colunas = Object.keys(conteudo[0]).filter(col=>{
        if(!mostrarDataCriacao || !mostrarTodosDados){
            let confirm
            confirm = !mostrarDataCriacao && col==='data_criacao' ? false : true
            if (confirm) confirm = !mostrarTodosDados && infoExtra.includes(col) ? false : true 
            return confirm
        }else{
            return true
        }
    });
    const trHead = document.createElement('tr');
    colunas.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
    });
    tabelaHead.appendChild(trHead);

    conteudo.forEach(linha => {
        const tr = document.createElement('tr');
        colunas.forEach(col =>{
            const td = document.createElement('td')
            if(col.includes('data')&&linha[col]!==null){
                td.textContent = col === 'data_nasc' || col === 'data_fund' ?  new Date(linha[col]).toLocaleDateString('pt-BR') : new Date(linha[col]).toLocaleString('pt-BR');
            }else
            if(linha[col]===null){
                td.textContent='[NULL]'
            }else{
                td.textContent = linha[col]
            }
            tr.appendChild(td)
        })
        const buttonRemover = document.createElement('button')
        buttonRemover.className = 'buttonRemover'
        buttonRemover.innerHTML = '❌'
        buttonRemover.addEventListener('click', ()=>{
            let nome
            let id = linha['id']||linha['cnpj']
            if(tabela==='Candidatos'||tabela==='Tags'){
                nome = linha['nome']
            }else
            if(tabela==='Empresas'){
                nome = linha['nome_fant']
            }else
            if(tabela==='Experiencias'){
                nome = linha['titulo']
            }
            console.log(nome)
            botaoLixeira(nome,tabela,id)
            
        })
        tr.appendChild(buttonRemover)
        tabelaBody.appendChild(tr)
    });
    carregando.style.display = 'none'
    tabelaContent.style.display = ''
}

const modal = document.querySelector('#modalConfirmacao');
const textoConfirmacao = document.querySelector('#textoConfirmacao')
const textoDetalhes = document.querySelector('#textoDetalhes')
const btnConfirmar = document.querySelector('#btnConfirmar')
const btnCancelar = document.querySelector('#btnCancelar')

async function botaoLixeira(nome,tabela,id) {
    modal.style.display = 'flex';
    textoConfirmacao.textContent = `Tem certeza que deseja remover ${nome} (Identificador: ${id}) da tabela ${tabela}?`;
    if(tabela==='Candidatos'){
        textoDetalhes.style.display = 'flex';
        textoDetalhes.textContent = `Esta ação também removerá todas as informações relacionadas ao candidato (ex: experiencias, tags, etc)`;
    }
    else{
        textoDetalhes.style.display = 'none';
    };

    const confirmar = async function () {
        btnConfirmar.removeEventListener('click', confirmar)
        btnCancelar.removeEventListener('click', cancelar)
        await removerTupla(tabela, id)
    };

    const cancelar = async function () {
        modal.style.display = 'none'
        btnConfirmar.removeEventListener('click', confirmar)
        btnCancelar.removeEventListener('click', cancelar)
    };

    btnCancelar.addEventListener('click', cancelar);
    btnConfirmar.addEventListener('click', confirmar);
}

async function removerTupla(tabela, id) {
    try{
        if(tabela==='Candidatos'){

            const res = await fetch(`/candidatos/${id}`,{
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json();

            if(!res.ok) {
                throw ({status: res.status, message: data.error})
            }
            modal.style.display = 'none'
            alert(data.message);

            candidatos = null;

        }else
        if(tabela==='Empresas'){
            const res = await fetch(`/empresas/${id}`,{
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json();

            if(!res.ok) {
                throw ({status: res.status, message: data.error})
            }

            modal.style.display = 'none'
            alert(data.message);

            empresas = null;
        }else
        if(tabela==='Experiencias'){
            const res = await fetch(`/experiencias/${id}`,{
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json();

            if(!res.ok) {
                throw ({status: res.status, message: data.error})
            }

            modal.style.display = 'none'
            alert(data.message);

            experiencias = null;
        }else
        if(tabela==='Tags'){
            const res = await fetch(`/tags/${id}`,{
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json();

            if(!res.ok) {
                throw ({status: res.status, message: data.error})
            }

            modal.style.display = 'none'
            alert(data.message);

            tags = null;
        }
        carregarTabela(tabela)
    }
    catch(erro){
        modal.style.display = 'none'
        if(erro.status===401||erro.status===403){
            alert(erro.message);
            window.location.href = '/'
        }
        else{
            console.error('Erro ao remover tupla:', erro.message);
            alert('Erro ao remover tupla: ' + erro.message);
        }
    }
}

carregarTabela('Candidatos')