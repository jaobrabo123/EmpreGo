document.querySelector('#selectTabelas').addEventListener('change', (option)=>{
    const tabela = option.target.value
    carregarTabela(tabela)
})

document.querySelector('#dataCriacao').addEventListener('change', ()=>{
    const tabela = document.querySelector('#selectTabelas').value
    carregarTabela(tabela)
})

let candidatos = null;
let empresas = null;
let experiencias = null;
let tags = null;

const carregando = document.querySelector('#carregando')

async function carregarTabela(tabela) {
    const mostrarDataCriacao = document.getElementById('dataCriacao').checked;
    carregando.style.display = ''
    let conteudo
    if(tabela==='Candidatos'){
        if(candidatos){
            conteudo = candidatos
        }else{
            console.log('Pegando candidatos')
            
            candidatos = await fetch('/candidatos',{
                method: 'GET',
                credentials: 'include',
            })
            .then(async res =>{
                let data = await res.json();
                if(!res.ok) return {error: data.error};
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
            empresas = await fetch('/empresas',{
                method: 'GET',
                credentials: 'include',
            })
            .then(async res =>{
                let data = await res.json();
                if(!res.ok) return {error: data.error};
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
            experiencias = await fetch('/exps-all',{
                method: 'GET',
                credentials: 'include',
            })
            .then(async res =>{
                let data = await res.json();
                if(!res.ok) return {error: data.error};
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
            tags = await fetch('/tags-all',{
                method: 'GET',
                credentials: 'include',
            })
            .then(async res =>{
                let data = await res.json();
                if(!res.ok) return {error: data.error};
                return data;
            })
            conteudo = tags
        }
    }
    
    if(conteudo.error) alert(`Erro ao pegar tabela (${tabela}): ${conteudo.error}`);
    console.log(conteudo)
    const tabelaHead = document.querySelector('#tabelaHead')
    const tabelaBody = document.querySelector('#tabelaBody')
    tabelaHead.innerHTML = '';
    tabelaBody.innerHTML = '';

    const colunas = Object.keys(conteudo[0]).filter(col=>{
        if(!mostrarDataCriacao){
            return col!=='data_criacao';
        }else{
            return true;
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
            if(col.includes('data')){
                td.textContent = new Date(linha[col]).toLocaleDateString('pt-BR')
            }else
            if(linha[col]===null){
                td.textContent='[NULL]'
            }else{
                td.textContent = linha[col]
            }
            tr.appendChild(td)
        })
        
        tabelaBody.appendChild(tr)
    });
    carregando.style.display = 'none'
}

carregarTabela('Candidatos')