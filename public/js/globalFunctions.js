// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';

export function mostrarErroTopo(mensagem) {
  const old = document.querySelector('.erro-mensagem-geral');
  if (old) old.remove();

  const erroDiv = document.createElement('div');
  erroDiv.className = 'erro-mensagem-geral';

  const contrasteDiv = document.createElement('div');
  contrasteDiv.className = 'erro-mensagem-contraste';
  contrasteDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagem}`;

  erroDiv.appendChild(contrasteDiv);
  document.body.prepend(erroDiv);

  setTimeout(() => {
    if (erroDiv.parentNode) erroDiv.remove();
  }, 3000);
}

export async function carregarLinks() {
  const infos = await carregarInfo();
  if(infos === 'visitante' || infos.tipo==='visitante' || infos.tipo==='expirado'){
    document.querySelector('#loginOuCadas').style.display = '';
    document.querySelector('#logout').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = 'none';
    if(infos.tipo==='expirado'){
      alert('Sua sessão expirou faça login novamente.');
      window.location.href = '/login';
    }
  }
  else if (infos.tipo==='candidato'){
    document.querySelector('#fotoPerfil').href = '/perfil/candidato';
    document.querySelector('#loginOuCadas').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = '';
    document.querySelector('#fotoPerfilImg').src = infos.info.foto;
  }
  else if (infos.tipo==='empresa') {
    document.querySelector('#fotoPerfil').href = '/perfil/empresa';
    document.querySelector('#loginOuCadas').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = '';
    document.querySelector('#fotoPerfilImg').src = infos.info.foto;
  }
}

export async function carregarInfo() {
  try{
    const tipo = await axiosWe.get('/get-tipo')
      .then((response)=>{
        const { tipo } = response.data;
        return tipo;
      })
      .catch(()=>{
        return 'visitante';
      })

    let data = null;

    if(tipo==='candidato'){
      const response = await axiosWe.get('/perfil/candidato/info');
      data = response.data;
    }
    else if(tipo==='empresa'){
      const response = await axiosWe.get('/perfil/empresa/info');
      data = response.data;
    }
    return {info: data, tipo: tipo};
  }
  catch(erro){
    console.error(erro.message)
    return 'visitante'
  }
}

//Função pra deslogar
export function logout(){
  axiosWe.post('/logout')
  .then(()=>{
    // ? alert('Você foi desconectado.'); Se achar necessario bota um alert pro logout
    window.location.href = '/';
  })
}