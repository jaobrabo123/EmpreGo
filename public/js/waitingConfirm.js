import { axiosConfig } from '/js/globalFunctions.js';
axiosConfig(axios);

const params = new URLSearchParams(window.location.search);
const email = params.get('email');
if(!email){
    window.location.href = '/';
}

document.querySelector('#email').textContent = email;

const mensagem = document.querySelector('#mensagem');
const input = document.querySelector('#inputCodigo');

input.addEventListener('input', async (event)=>{
    const codigo = event.target.value;
    if(codigo.length < 4) return;
    input.disabled = true;

    axios.post('/candidatos/confirmar', { codigo: codigo })
        .then(()=>{
            window.location.href = '/';
        })
        .catch((erro)=>{
            event.target.value = '';
            input.disabled = false;
            console.error(erro.response.data.error)
        })
});

let podeReenviar = true;
document.querySelector('#reenvio').addEventListener('click', async ()=>{
    if(!email || !podeReenviar) return;
    try{
        
        podeReenviar = false;
        const res = await fetch('/candidatos/reenviar',{
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if(!res.ok) throw { status: res.status, message: data.error };

        mensagem.textContent = `${data.message}`;
        podeReenviar = true;
    }
    catch(erro){
        mensagem.textContent = erro.message;
        podeReenviar = true;
        if(erro.status === 404){
            podeReenviar = false;
            mensagem.textContent += ' Redirecionando...';
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        }
    }
})