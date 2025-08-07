import { mostrarErroTopo } from '/js/globalFunctions.js';

//Configurando axios
function axiosConfig(axios){
  axios.defaults.withCredentials = true;

  axios.defaults.headers.post['Content-Type'] = 'application/json';

  axios.defaults.baseURL = window.location.hostname.includes('localhost') ? 'http://localhost:3001' : 'https://tcc-vjhk.onrender.com';

  axios.interceptors.response.use(function (config) {
    return config;
  }, function (erro) {
    console.log(erro)
    const status = erro.response?.status || erro.status;
    const originalError = erro.response?.data?.error || erro.message;
    let msg = originalError;
    let erroTopo = true;

    switch (status) {
      case 401:

        if(msg.includes("Você não está logado")) erroTopo = false;

        break;
      case 403:

        if(msg.includes("Sessão expirada")){
          msg = 'Sessão expirada. Faça login novamente.';
          setTimeout(() => {
            window.location.href = '/login';
          }, 3*1000);
        }

        break;
      case 409:

        erroTopo = false;

        break;
      case 500:
        
        if(msg.includes('Erro ao enviar mensagem')) erroTopo = false;
        msg = 'Erro do servidor, tente novamente.';

        break;
      default:
        break;
    }

    if(erroTopo) mostrarErroTopo(msg);
    return Promise.reject({ message: msg, status: status, originalError: originalError });
  });
}
axiosConfig(axios);