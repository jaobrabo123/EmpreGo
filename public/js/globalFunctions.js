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
  }, 5000);
}

export async function carregarLinks() {
  const infos = await carregarInfo();
  console.log(infos)
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
    .catch((erro)=>{
      if(erro.status===403 && erro.message.includes('Sessão expirada')){
        return 'expirado'
      }
      else{
        return 'visitante';
      }
    })

    let data = null;

    if(tipo==='candidato'){
      const res = await fetch('/perfil/candidato/info', {
        method: 'GET',
        credentials: 'include'
      });
      data = await res.json()
      if (!res.ok) {
        throw ({status: data.status, message: data.error});
      }
    }
    else if(tipo==='empresa'){
      const res = await fetch('/perfil/empresa/info', {
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
    window.location.href = '/';
  });
}

//Configurando axios
export function axiosConfig(axios){
  axios.defaults.withCredentials = true;

  axios.defaults.headers.post['Content-Type'] = 'application/json';

  axios.defaults.baseURL = window.location.hostname.includes('localhost') ? 'http://localhost:3001' : 'https://tcc-vjhk.onrender.com';

  axios.interceptors.response.use(function (config) {
    return config;
  }, function (erro) {
    const msg = erro.response.data.error;

    if (erro.status === 403) {
      mostrarErroTopo("Sessão expirada. Faça login novamente.");
      setTimeout(() => {
        window.location.href = '/login';
      }, 5*1000);
    }

    mostrarErroTopo(msg);
    return Promise.reject(erro);
  });
}