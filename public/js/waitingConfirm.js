const params = new URLSearchParams(window.location.search);
const email = params.get('email');
document.querySelector('#email').textContent = email

const mensagem = document.querySelector('#mensagem')

document.querySelector('#confirm').addEventListener('click', ()=>{
    window.location.href = '/login'
})

document.querySelector('#reenvio').addEventListener('click', async ()=>{
    try{
        if(!email) return;
        const res = await fetch('/candidatos/reenviar',{
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if(!res.ok) throw { status: res.status, message: data.error };

        mensagem.textContent = `${data.message}`
    }
    catch(erro){
        if(erro.status === 429){
            return mensagem.textContent = `Aguarde 15 segundos para reenviar um novo email.`
        }
        mensagem.textContent = erro.message;
    }
})