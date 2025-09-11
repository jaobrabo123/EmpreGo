import axiosWe from "./axiosConfig.js";

function mostrarErro(msg) {
  const erroDiv = document.getElementById("mensagemErro");
  erroDiv.textContent = msg;
  erroDiv.style.display = "block";
}

function limparErro() {
  const erroDiv = document.getElementById("mensagemErro");
  erroDiv.textContent = "";
  erroDiv.style.display = "none";
}

document.getElementById("btnEnviar").addEventListener("click", function () {
  enviarEdicao();
});

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, ""); // Remove pontos e traços

  if (cpf.length !== 11) {
    return 1;
  } else if (/^(\d)\1{10}$/.test(cpf)) {
    return 2;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digito1 = 11 - (soma % 11);
  if (digito1 > 9) digito1 = 0;
  if (digito1 != parseInt(cpf.charAt(9))) return 2;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digito2 = 11 - (soma % 11);
  if (digito2 > 9) digito2 = 0;
  if (digito2 != parseInt(cpf.charAt(10))) return 2;

  return true;
}


async function enviarEdicao() {
  limparErro();

  const foto = document.getElementById("inputFotoPerfil").files[0];
  const descricao = document.getElementById("inputDescricao").value;
  const cpf = document.getElementById("inputCpf").value;
  const estado = document.getElementById("selectEstado").value;
  const cidade = document.getElementById("inputCidade").value;
  const instagram = document.getElementById("inputInstagram").value;
  const github = document.getElementById("inputGithub").value;
  const youtube = document.getElementById("inputYoutube").value;
  const twitter = document.getElementById("inputTwitter").value;

  // Obtem os pronomes corretamente, considerando "Outro"
  let pronomes = document.getElementById("selectPronomes").value;
  if (pronomes === "Outro") {
    const outroPronome = document.getElementById("outroPronomeInput").value.trim();
    if (!outroPronome) {
      mostrarErro("Por favor, preencha o campo de pronomes personalizados.");
      return;
    }
    pronomes = outroPronome;
  }

  if (cpf && validarCPF(cpf) === 1) {
    mostrarErro("CPF inválido. Formato correto: 123.456.789-10");
    return;
  }

  if (cpf && validarCPF(cpf) === 2) {
    mostrarErro("CPF inválido. Confira se não digitou algo errado.");
    return;
  }

  if (cidade && estado !== "NM") {
    const response = await axios(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`
    );
    const cidades = response.data.map((ci) => ci.nome.toLowerCase());
    if (!cidades.includes(cidade.toLowerCase())) {
      mostrarErro(`Cidade inválida pro estado selecionado: ${estado}`);
      return;
    }
  }

  if (instagram && !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/.test(instagram)){
    mostrarErro("URL do Instagram inválida.");
    return;
  }

  if (github && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9._-]+\/?$/.test(github)){
    mostrarErro("URL do GitHub inválida.");
    return;
  }

  if (youtube && !/^https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9._-]+)(\/)?(\?.*)?$/.test(youtube)){
    mostrarErro("URL do Youtube inválida.");
    return;
  }

  if (twitter && !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9._-]+\/?$/.test(twitter)){
    mostrarErro("URL do Twitter/X inválida.");
    return;
  }

  const formData = new FormData();
  if (foto) formData.append("foto", foto);
  if (descricao) formData.append("descricao", descricao);
  if (cpf) formData.append("cpf", cpf);
  if (estado && estado !== "NM") formData.append("estado", estado);
  if (cidade) formData.append("cidade", cidade);
  if (instagram) formData.append("instagram", instagram);
  if (github) formData.append("github", github);
  if (youtube) formData.append("youtube", youtube);
  if (twitter) formData.append("twitter", twitter);
  if (pronomes && pronomes!=="NM") formData.append("pronomes", pronomes);
  if (!foto && !descricao && !cpf && estado==="NM" && !cidade && !instagram && !github && !youtube && !twitter && pronomes==="NM") return mostrarErro("Pelo menos um campo deve ser fornecido para editar o perfil.");

  try{
    await axiosWe.post('/perfil/candidato', formData);
    window.location.href = "/perfil/candidato";
  }
  catch(erro){
    if(erro.message.includes('Cidade inválida para o estado')){
      mostrarErro("A cidade digitada não é equivalente ao estado cadastrado no seu perfil, altere o estado ou cadastre uma cidade válida.");
    }
    else{
      mostrarErro(`Erro ao editar perfil: ${erro.message}`);
    }
  }
}

// Formata o campo CPF enquanto o usuário digita
document.getElementById("inputCpf").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  e.target.value = value;
});
