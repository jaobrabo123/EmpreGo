import { mostrarErroTopo } from '/js/globalFunctions.js';

// * Configurando axios
const axiosWe = axios.create();
axiosWe.defaults.withCredentials = true;

const hostName = window.location.hostname;
axiosWe.defaults.baseURL = hostName.includes('localhost') ? 'http://localhost:3001' : 'https://app.emprego-vagas.com.br';

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
  const link = document.createElement('a');   // * Cria um link temporário
  link.href = `/mensagens/download?link=${encodeURIComponent(url)}`;   // * Seta a rota de download como href do link
  document.body.appendChild(link);   // * Insere o link temporário na Árvore DOM
  link.click();   // * Clica no link temporário automaticamente para iniciar o download
  document.body.removeChild(link);   // * Remove o link temporário da Árvore DOM (OBS: fui eu q comentei isso tá? foi chat nn)
};

export default axiosWe;