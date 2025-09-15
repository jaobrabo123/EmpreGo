// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';
import socket from './notfSocketsConfig.js';
import carregarInfosUsuario from './infosUsuarios.js';

export function mostrarErroTopo(mensagem) {
  const old = document.querySelector('.erro-mensagem-geral');
  if (old) old.remove();

  const erroDiv = document.createElement('div');
  erroDiv.className = 'erro-mensagem-geral';

  const contrasteDiv = document.createElement('div');
  contrasteDiv.className = 'erro-mensagem-contraste';
  contrasteDiv.innerHTML = `
                <div class="flex z-10 items-center bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 shadow-md rounded-b mb-4">
                    <i class="fas fa-exclamation-circle mr-3"></i>
                    <div>
                        <strong class="font-bold">Erro: </strong>
                        <span class="block sm:inline">${mensagem}</span>
                    </div>
                </div>
            `;

  erroDiv.appendChild(contrasteDiv);
  document.body.prepend(erroDiv);

  // Animação de entrada com Anime.js
  anime({
    targets: '.erro-mensagem-contraste',
    translateY: 0,
    opacity: 1,
    duration: 600,
    easing: 'easeOutElastic(1, .8)'
  });

  // Remover após 3 segundos com animação de saída
  setTimeout(() => {
    if (erroDiv.parentNode) {
      anime({
        targets: '.erro-mensagem-contraste',
        translateY: -100,
        opacity: 0,
        duration: 400,
        easing: 'easeInExpo',
        complete: function () {
          if (erroDiv.parentNode) erroDiv.remove();
        }
      });
    }
  }, 3000);
}

export async function carregarLinks() {
  const infos = await carregarFoto();
  console.log(infos)
  if (infos === 'visitante' || infos.tipo === 'visitante' || infos.tipo === 'expirado') {
    document.querySelector('#loginOuCadas').style.display = '';
    document.querySelector('#logout').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = 'none';
    document.querySelector('#mobileLoginOuCadas').style.display = '';
    document.querySelector('#mobileLogout').style.display = 'none';
    document.querySelector('#mobileFotoPerfil').style.display = 'none';
    if (infos.tipo === 'expirado') {
      alert('Sua sessão expirou faça login novamente.');
      window.location.href = '/login';
    }
  }
  else if (infos.tipo === 'candidato' || infos.tipo === 'empresa') {
    const ehCand = infos.tipo === 'candidato';
    // * Linkagem da foto de perfil para PC
    document.querySelector('#fotoPerfil').href = `/perfil/${ehCand ? 'candidato' : 'empresa'}`;
    document.querySelector('#loginOuCadas').style.display = 'none';
    document.querySelector('#fotoPerfil').style.display = '';
    document.querySelector('#fotoPerfilImg').src = infos.foto;
    // * Linkagem da foto de perfil para Mobile
    if (document.querySelector('#mobileFotoPerfil')) {
      document.querySelector('#mobileFotoPerfil').href = `/perfil/${ehCand ? 'candidato' : 'empresa'}`;
      document.querySelector('#mobileLoginOuCadas').style.display = 'none';
      document.querySelector('#mobileFotoPerfil').style.display = '';
      document.querySelector('#mobileFotoPerfilImg').src = infos.foto;
    }
  }
}

export async function carregarLinks2() {
  try {
    const infos = await carregarInfosUsuario();
    console.log(infos);
    if (infos === 'visitante') {
      return;
    }
    document.querySelector('.profile-name').textContent = infos.nome;
    document.querySelector('#FotoDePerfil').src = infos.foto;
    socket.emit('joinNotifications', { tipo: infos.tipo, id: infos.id }, (response) => {
      if (response.status === 'error') {
        console.log(response.message)
      }
    })
  } catch (erro) {
    console.error(erro.message)
  }
}

export async function carregarInfo() {
  try {
    const tipo = await axiosWe.get('/get-tipo')
      .then((response) => {
        const { tipo } = response.data;
        return tipo;
      })
      .catch(() => {
        return 'visitante';
      })

    let data = null;

    if (tipo === 'candidato') {
      const response = await axiosWe.get('/perfil/candidato/info');
      data = response.data;
    }
    else if (tipo === 'empresa') {
      const response = await axiosWe.get('/perfil/empresa/info');
      data = response.data;
    }
    return { info: data, tipo: tipo };
  }
  catch (erro) {
    console.error(erro.message)
    return 'visitante'
  }
}

export async function carregarFoto() {
  try {
    const tipo = await axiosWe.get('/get-tipo')
      .then((response) => {
        const { tipo } = response.data;
        return tipo;
      })
      .catch(() => {
        return 'visitante';
      })

    let foto = null;

    if (tipo === 'candidato') {
      const response = await axiosWe('/perfil/candidato/foto');
      foto = response.data;
    }
    else if (tipo === 'empresa') {
      const response = await axiosWe('/perfil/empresa/foto');
      foto = response.data;
    }
    return { foto, tipo: tipo };
  }
  catch (erro) {
    console.error(erro.message)
    return 'visitante'
  }
}

// export async function carregarInfosLinks(){
//   try {
//     const response = await axiosWe('/perfil/link');
//     const data = response.data;
//     return data;
//   } catch (erro) {
//     console.error(erro.message);
//     return 'visitante';
//   }
// }

//Função pra deslogar
export function logout() {
  axiosWe.post('/logout')
    .then(() => {
      // ? alert('Você foi desconectado.'); Se achar necessario bota um alert pro logout
      window.location.href = '/';
    })
}

export function finalizarLoader() {
  setTimeout(() => {
    gsap.to('#loader', {
      duration: 0.5,
      opacity: 0,
      onComplete: () => {
        document.getElementById('loader').classList.add('hidden');
        if (document.getElementById('content')) document.getElementById('content').classList.remove('hidden');

        // Animação de entrada do conteúdo
        // gsap.from('#content', {
        //     duration: 0.5,
        //     opacity: 0,
        //     y: 20
        // });
      }
    });
    if (document.querySelector('#content')) document.querySelector('#content').style.display = 'block'
  }, 300)

}