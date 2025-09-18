import { mostrarErroTopo } from '/js/globalFunctions.js';

// * Configurando axios
const axiosWe = axios.create();
axiosWe.defaults.withCredentials = true;

axiosWe.defaults.baseURL = window.location.hostname.includes('localhost') ? 'http://localhost:3001' : 'https://tcc-vjhk.onrender.com';

axiosWe.interceptors.response.use(function (config) {
  return config;
}, function (erro) {
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
      console.log(msg)
      if(msg.includes('Erro ao enviar mensagem')) erroTopo = false;
      if(msg.includes('Erro ao verificar token')) msg = 'Erro ao validar sessão, tente recarregar a página.';
      else msg = 'Erro do servidor, tente novamente.';

      break;
    default:
      break;
  }

  if(erroTopo) mostrarErroTopo(msg);
  return Promise.reject({ message: msg, status: status, originalError: originalError });
});

axiosWe.download = async function(url){
  try {
    const response = await this.get(`/mensagens/download?link=${encodeURIComponent(url)}`, { responseType: 'blob' });
    const blob = response.data;
    const fileName = url.split('/').pop().split('?')[0] || 'arquivo';

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (erro) {
    console.error('Erro ao baixar o arquivo: ', erro);
  }
}

export default axiosWe;