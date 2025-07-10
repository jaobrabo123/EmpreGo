export function mostrarErroTopo(mensagem) {
  const old = document.querySelector('.erro-mensagem-geral');
  if (old) old.remove();

  const erroDiv = document.createElement('div');
  erroDiv.className = 'erro-mensagem-geral';

  const contrasteDiv = document.createElement('div');
  contrasteDiv.className = 'erro-mensagem-contraste';
  contrasteDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${mensagem}`;

  erroDiv.appendChild(contrasteDiv);
  document.body.prepend(erroDiv);

  setTimeout(() => {
    if (erroDiv.parentNode) erroDiv.remove();
  }, 5000);
}

export async function carregarLinks() {
  const infos = await carregarInfo();
  console.log(infos)
  if(infos === 'visitante' || infos.tipo==='visitante'){
    document.querySelector('#loginOuCadas').style.display = '';
    document.querySelector('#logout').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = 'none';
  }else
  if (infos.tipo==='candidato'){
    document.querySelector('#fotoPerfil').href = './profile.html';
    document.querySelector('#loginOuCadas').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = '';
    document.querySelector('#fotoPerfilImg').src = infos.info.foto;
  }
  else
  if (infos.tipo==='empresa') {
    document.querySelector('#fotoPerfil').href = './profileCompany.html';
    document.querySelector('#loginOuCadas').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = '';
    document.querySelector('#fotoPerfilImg').src = infos.info.foto;
  }
}

export async function carregarInfo() {
    try{
      const tipo = await fetch('/get-tipo', {
        method: 'GET',
        credentials: 'include'
      })
      .then(async res=>{
        const data = await res.json()
        if(!res.ok) throw ({status: res.status, message: data.error})
        const { tipo } = data;
        return tipo;
      })
      .catch(()=>{
        return 'visitante';
      })

      let data = null;

      if(tipo==='candidato'){
        const res = await fetch('/perfil', {
            method: 'GET',
            credentials: 'include'
        });
        data = await res.json()
        if (!res.ok) {
          throw ({status: data.status, message: data.error});
        }
      }else
      if(tipo==='empresa'){
        const res = await fetch('/perfil-empresa', {
            method: 'GET',
            credentials: 'include'
        });
        data = await res.json()
        if (!res.ok){
          throw ({status: data.status, message: data.error});
        }
      }
      return {info: data, tipo: tipo};
    }
    catch(erro){
      console.log(erro.message)
      return 'visitante'
    }
}

//Função pra deslogar
export function logout(){
    fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        alert('Você foi desconectado.');
        window.location.href = './index.html';
    });
}