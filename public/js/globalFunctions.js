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

export async function carregarLinks(axios) {
  const infos = await carregarInfo(axios);
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

export async function carregarInfo(axios) {
  try{
    const tipo = await axios.get('/get-tipo')
      .then((response)=>{
        const { tipo } = response.data;
        console.log(response.data)
        return tipo;
      })
      .catch(()=>{
        return 'visitante';
      })

    let data = null;

    if(tipo==='candidato'){
      const response = await axios.get('/perfil/candidato/info');
      data = response.data;
    }
    else if(tipo==='empresa'){
      const response = await axios.get('/perfil/empresa/info');
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
export function logout(axios){
  axios.post('/logout')
  .then(()=>{
    // ? alert('Você foi desconectado.'); Se achar necessario bota um alert pro logout
    window.location.href = '/';
  })
}

//Configurando axios
export function axiosConfig(axios){
  axios.defaults.withCredentials = true;

  axios.defaults.headers.post['Content-Type'] = 'application/json';

  axios.defaults.baseURL = window.location.hostname.includes('localhost') ? 'http://localhost:3001' : 'https://tcc-vjhk.onrender.com';

  axios.interceptors.response.use(function (config) {
    return config;
  }, function (erro) {
    let msg = erro.response.data.error;
    const status = erro.response.status;
    let erroTopo = true

    switch (status) {
      case 403:

        msg = 'Sessão expirada. Faça login novamente.';
        setTimeout(() => {
          window.location.href = '/login';
        }, 3*1000);

        break;
      case 500:

        msg = 'Erro do servidor, tente novamente.';

        break;
      case 401:

        if(msg.includes("Você não está logado")) erroTopo = false;

        break;
      default:
        break;
    }

    if(erroTopo) mostrarErroTopo(msg);
    return Promise.reject({ message: msg, status: status, originalError: erro.response.data.error });
  });
}