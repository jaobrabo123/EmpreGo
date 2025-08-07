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

    carregando.style.display = '';
    tabelaContent.style.display = 'none';
    
    let conteudo;
    titleTable.textContent = tabela;
    switch (tabela) {
        case 'Candidatos':
            if(candidatos){
                conteudo = candidatos
            }
            else{
                console.log('Pegando candidatos')
                try{
                    const response = await axios.get('/candidatos/all');
                    candidatos = response.data;
                }
                catch(erro){
                    candidatos = { status: erro.status, error: erro.message };
                }
                finally{
                    conteudo = candidatos;
                }
            }
            break;
        case 'Empresas':
            if(empresas){
                conteudo = empresas
            }
            else{
                console.log('Pegando empresas')
                try{
                    const response = await axios.get('/empresas/all');
                    empresas = response.data;
                }
                catch(erro){
                    empresas = { status: erro.status, error: erro.message };
                }
                finally{
                    conteudo = empresas;
                }
            }
            break;
        case 'Experiencias':
            if(experiencias){
                conteudo = experiencias
            }
            else{
                console.log('Pegando experiências');
                try{
                    const response = await axios.get('/experiencias/all');
                    experiencias = response.data;
                }
                catch(erro){
                    experiencias = { status: erro.status, error: erro.message };
                }
                finally{
                    conteudo = experiencias;
                }
            }
            break;
        case 'Tags':
            if(tags){
                conteudo = tags
            }
            else{
                console.log('Pegando tags');
                try{
                    const response = await axios.get('/tags/all');
                    tags = response.data;
                }
                catch(erro){
                    tags = { status: erro.status, error: erro.message };
                }
                finally{
                    conteudo = tags;
                }
            }
            break;
        default:
            alert('Erro no switch case.')
            return; // * Só pra ter um debug se der erro no switch
    }
    
    if(conteudo.error) {
        if(conteudo.status===500){
            alert('Erro de conexão com o Banco de Dados (a culpa não foi sua, tente acessar a página novamente).');
            window.location.href = '/';
            return;
        }
        else{
            alert(conteudo.error);
            window.location.href = '/';
            return;
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
                td.textContent = linha[col].length>50 ? linha[col].substring(0, 50) + '...' : linha[col];
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
        switch (tabela) {
            case 'Candidatos': {
                const response = await axios.delete(`/candidatos/${id}`);
                const data = response.data;

                modal.style.display = 'none';
                alert(data.message);

                candidatos = null;
                break;
            }
            case 'Empresas': {
                const response = await axios.delete(`/empresas/${id}`);
                const data = response.data;

                modal.style.display = 'none';
                alert(data.message);

                empresas = null;
                break;
            }
            case 'Experiencias': {
                const response = await axios.delete(`/experiencias/${id}`);
                const data = response.data;

                modal.style.display = 'none';
                alert(data.message);

                experiencias = null;
                break;
            }
            case 'Tags': {
                const response = await axios.delete(`/tags/${id}`);
                const data = response.data;

                modal.style.display = 'none'
                alert(data.message);

                tags = null;
                break;
            }
            default:
                alert('Erro no Switch do delete');
                return;
        }
        carregarTabela(tabela)
    }
    catch(erro){
        modal.style.display = 'none';
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