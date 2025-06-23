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

function validarCPF(cpf) {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
}

document.getElementById("formEditarPerfil").addEventListener("submit", function(e) {
  e.preventDefault();
  enviarEdicao();
});

function enviarEdicao() {
  limparErro();

  const token = localStorage.getItem("token");

  const fotoPerfil = document.getElementById("inputFotoPerfil").files[0];
  const descricao = document.getElementById("inputDescricao").value;
  const cpf = document.getElementById("inputCpf").value;
  const estado = document.getElementById("selectEstado").value;
  const cidade = document.getElementById("inputCidade").value;
  const endereco = document.getElementById("inputEndereco").value;
  const instagram = document.getElementById("inputInstagram").value;
  const github = document.getElementById("inputGithub").value;
  const youtube = document.getElementById("inputYoutube").value;
  const twitter = document.getElementById("inputTwitter").value;
  const pronomes = document.getElementById("inputPronomes").value;

  if (cpf && !validarCPF(cpf)) {
    mostrarErro("CPF inválido. Formato correto: 123.456.789-10");
    return;
  }

  const formData = new FormData();
  if (fotoPerfil) formData.append("foto_perfil", fotoPerfil);
  if (descricao) formData.append("descricao", descricao);
  if (cpf) formData.append("cpf", cpf);
  if (estado && estado !== "NM") formData.append("estado", estado);
  if (cidade) formData.append("cidade", cidade);
  if (endereco) formData.append("endereco", endereco);
  if (instagram) formData.append("instagram", instagram);
  if (github) formData.append("github", github);
  if (youtube) formData.append("youtube", youtube);
  if (twitter) formData.append("twitter", twitter);
  if (pronomes) formData.append("pronomes", pronomes);

  fetch("/perfil-edit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        mostrarErro(data.error || "Erro ao editar perfil");
        throw new Error(data.error || "Erro ao editar perfil");
      }
      window.location.href = "./profile.html";
    })
    .catch((error) => {
      console.error("Erro ao editar perfil:", error);
    });
}

// Formata o campo CPF enquanto o usuário digita
document.getElementById("inputCpf").addEventListener("input", function(e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  e.target.value = value;
});
