// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';

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

    try{
        await axiosWe.post('/candidatos/confirmar', { codigo, email });
        window.location.href = '/';
    } 
    catch(erro){
        event.target.value = '';
        input.disabled = false;
    }
});

let podeReenviar = true;
document.querySelector('#reenvio').addEventListener('click', async ()=>{
    if(!email || !podeReenviar) return;

    podeReenviar = false;

    try{
        const response = await axiosWe.post('/candidatos/reenviar', { email });
        mensagem.textContent = `${response.data.message}`;
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