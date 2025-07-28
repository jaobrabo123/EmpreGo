// Modo Login/Cadastro
const sign_in_btn = document.querySelector("#login-in-btn");
const sign_up_btn = document.querySelector("#login-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () =>
  container.classList.add("sign-up-mode")
);
sign_in_btn.addEventListener("click", () =>
  container.classList.remove("sign-up-mode")
);

const empresaLoginBtn = document.getElementById("empresa-login-btn");
const empresaCadastroBtn = document.getElementById("empresa-cadastro-btn");

empresaLoginBtn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
  setTimeout(() => {
    container.classList.add("empresa-mode");
  }, 700);
});
empresaCadastroBtn.addEventListener("click", () => {
  setTimeout(() => {
    container.classList.add("empresa-mode");
  }, 700);
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () =>
  container.classList.remove("empresa-mode")
);
sign_up_btn.addEventListener("click", () =>
  container.classList.remove("empresa-mode")
);

// _________________________ OLHO SENHA _______________________
function handlePasswordToggle(inputId, eyeIconId, toggleBtnId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(eyeIconId);
  const togglePasswordBtn = document.getElementById(toggleBtnId);

  function updateVisibility() {
    eyeIcon.style.display = passwordInput.value.length > 0 ? "block" : "none";
    togglePasswordBtn.style.display =
      passwordInput.value.length > 0 ? "block" : "none";
  }

  passwordInput.addEventListener("input", updateVisibility);
  updateVisibility();

  togglePasswordBtn.addEventListener("click", function () {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
    eyeIcon.src =
      passwordInput.type === "password"
        ? "/assets/imgs/escondido.png"
        : "/assets/imgs/olho.png";
  });
}

handlePasswordToggle("password", "eyeIcon", "togglePassword");
handlePasswordToggle(
  "registerPassword",
  "eyeIconRegister",
  "toggleRegisterPassword"
);
handlePasswordToggle(
  "confirmPassword",
  "eyeIconConfirm",
  "toggleConfirmPassword"
);
// EMPRESA OLHO
handlePasswordToggle(
  "empresaPassword",
  "eyeIconEmpresa",
  "toggleEmpresaPassword"
);
handlePasswordToggle(
  "empresaRegisterPassword",
  "eyeIconEmpresaRegister",
  "toggleEmpresaRegisterPassword"
);
handlePasswordToggle(
  "empresaConfirmPassword",
  "eyeIconEmpresaConfirm",
  "toggleEmpresaConfirmPassword"
);

// _________________________ CAMPOS OBRIGATÓRIOS _______________________
const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("username");
const loginPassword = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerForm = document.getElementById("registerForm");
const registerUsername = document.getElementById("regUsername");
const registerSobrenome = document.getElementById("regUsernameSobre");
const registerEmail = document.getElementById("email");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");
const dob = document.getElementById("dob");
const genderSelect = document.getElementById("genderSelect");
const outroGeneroInput = document.getElementById("outroGeneroInput");

function checkLoginFields() {
  loginBtn.disabled = !(loginUsername.value && loginPassword.value);
}

function checkRegisterFields() {
  const outroGeneroVal = outroGeneroInput ? outroGeneroInput.value.trim() : "";
  const generoSelecionado = genderSelect.value;

  const generoPreenchido =
    (generoSelecionado !== "" && generoSelecionado !== "Outro") ||
    (generoSelecionado === "Outro" && outroGeneroVal !== "");

  const allFieldsFilled =
    registerUsername.value.trim() &&
    registerEmail.value.trim() &&
    registerPassword.value.trim() &&
    confirmPassword.value.trim() &&
    dob.value.trim() &&
    generoPreenchido;
}

const loginInputs = [loginUsername, loginPassword];
const registerInputs = [
  registerUsername,
  registerEmail,
  registerPassword,
  confirmPassword,
  dob,
  genderSelect,
];

loginInputs.forEach((input) =>
  input.addEventListener("input", checkLoginFields)
);
registerInputs.forEach((input) =>
  input.addEventListener("input", checkRegisterFields)
);
if (outroGeneroInput)
  outroGeneroInput.addEventListener("input", checkRegisterFields);

// Inicializa estado dos botões
checkLoginFields();
checkRegisterFields();
// ________________________________________________________USUARIO ________________________________________________________________________
// ________________________ DROPDOWN DE GÊNERO _______________________
function handleGenderChange() {
  const select = document.getElementById("genderSelect");
  const otherInputContainer = document.querySelector(
    ".other-gender-input-container"
  );

  if (select.value === "Outro") {
    otherInputContainer.style.display = "block";
    setTimeout(() => {
      otherInputContainer.classList.add("show");
    }, 10);
  } else {
    otherInputContainer.classList.remove("show");
    setTimeout(() => {
      otherInputContainer.style.display = "none";
    }, 300);
  }
  checkRegisterFields();
}

// ________________________ MÁSCARA DE DATA DE NASCIMENTO _______________________
document.addEventListener("DOMContentLoaded", function () {
  const dobInput = document.getElementById("dob");

  // Máscara de data de nascimento
  dobInput.addEventListener("input", function () {
    var value = dobInput.value.replace(/\D/g, "");

    value = value.slice(0, 8);

    if (value.length >= 5) {
      value =
        value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
    } else if (value.length >= 3) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }

    dobInput.value = value;
  });

  // Permitir apenas números e teclas de navegação
  dobInput.addEventListener("keydown", function (e) {
    const key = e.key;
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (!/[0-9]/.test(key) && !allowedKeys.includes(key)) {
      e.preventDefault();
    }
  });
});

// Função de validação da data de nascimento
function validarDataNascimento(dobStr) {
  const partes = dobStr.split("/");
  if (partes.length !== 3) return false;

  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const ano = parseInt(partes[2], 10);

  const data = new Date(ano, mes, dia);

  // Verifica se a data é válida
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes ||
    data.getDate() !== dia
  ) {
    return false;
  }

  const hoje = new Date();
  var idade = hoje.getFullYear() - ano;

  // Corrige se ainda não fez aniversário no ano
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade--;
  }

  return idade >= 14 && idade <= 120;
}
// ________________________________________________________EMPRESA ________________________________________________________________________
// ________________________ CEP _______________________
async function preencherEnderecoPorCep() {
  const cepInput = document.getElementById("empresaCep");
  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    document.getElementById("empresaRua").value = "";
    document.getElementById("empresaBairro").value = "";
    document.getElementById("empresaCidade").value = "";
    document.getElementById("empresaEstado").value = "";
    return;
  }

  try {
    const API_CEP = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
    if (!API_CEP.ok) throw new Error("CEP não encontrado");
    const DADOS_API = await API_CEP.json();

    document.getElementById("empresaRua").value = DADOS_API.street || "";
    document.getElementById("empresaBairro").value =
      DADOS_API.neighborhood || "";
    document.getElementById("empresaCidade").value = DADOS_API.city || "";
    document.getElementById("empresaEstado").value = DADOS_API.state || "";
  } catch (err) {
    document.getElementById("empresaRua").value = "";
    document.getElementById("empresaBairro").value = "";
    document.getElementById("empresaCidade").value = "";
    document.getElementById("empresaEstado").value = "";
  }
}

const empresaCepInput = document.getElementById("empresaCep");
if (empresaCepInput) {
  empresaCepInput.addEventListener("input", function () {
    var value = this.value.replace(/\D/g, "");

    if (value.length > 5) {
      value = value.slice(0, 5) + "-" + value.slice(5, 8);
    }
    this.value = value;

    if (value.length === 0) {
      document.getElementById("empresaRua").value = "";
      document.getElementById("empresaBairro").value = "";
      document.getElementById("empresaCidade").value = "";
      document.getElementById("empresaEstado").value = "";
    }

    if (value.length === 9) {
      preencherEnderecoPorCep();
    }
  });

  empresaCepInput.addEventListener("blur", preencherEnderecoPorCep);
}
// ________________________ Numero De Telefone _______________________
const empresaTelefoneInput = document.getElementById("empresaTelefone");

if (empresaTelefoneInput) {
  empresaTelefoneInput.addEventListener("input", function () {
    // Remove o +55 se já estiver presente para evitar duplicação
    let raw = this.value.replace(/\D/g, "");

    // Remove os dois primeiros dígitos se forem 55
    if (raw.startsWith("55")) {
      raw = raw.slice(2);
    }

    // Limita a 11 dígitos (2 DDD + 9 número)
    raw = raw.slice(0, 11);

    let formatted = "+55";

    if (raw.length > 0) {
      formatted += " " + raw.slice(0, 2);
    }
    if (raw.length > 2) {
      formatted += " " + raw.slice(2, 7);
    }
    if (raw.length > 7) {
      formatted += "-" + raw.slice(7, 11);
    }

    this.value = formatted;
  });
}
// ________________________ CNPJ _______________________
function aplicarMascaraCNPJ(input) {
  input.addEventListener("input", function () {
    let value = this.value.replace(/\D/g, "").slice(0, 14);

    if (value.length >= 3) value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    if (value.length >= 6)
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    if (value.length >= 9)
      value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    if (value.length >= 13)
      value = value.replace(
        /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
        "$1.$2.$3/$4-$5"
      );

    this.value = value;
  });
}

const cnpjRegisterInput = document.getElementById("empresaCNPJRegister");
if (cnpjRegisterInput) aplicarMascaraCNPJ(cnpjRegisterInput);

const cnpjLoginInput = document.getElementById("empresaCNPJ");
if (cnpjLoginInput) aplicarMascaraCNPJ(cnpjLoginInput);

// ________________________________________________________________________________________________________________________________

// ________________________ ERRO _______________________

function showInputError(input, message) {
  clearInputError(input);

  input.classList.add("erro-input");
  const errorDiv = document.createElement("div");
  errorDiv.className = "erro-mensagem";
  errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
  errorDiv.style.display = "block";

  input.parentNode.appendChild(errorDiv);
}

// ________________________ Erro do Sistema/BDA _______________________
function mostrarErroTopo(mensagem) {
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

function clearInputError(input) {
  input.classList.remove("erro-input");
  const error = input.parentNode.querySelector(".erro-mensagem");
  if (error) error.remove();
}


/**function mostrarErro(input, mensagem) {
input.classList.add("erro-input");
var erro = input.parentElement.querySelector(".erro-mensagem");
if (!erro) {
 erro = document.createElement("span");
 erro.className = "erro-mensagem";
 input.parentElement.appendChild(erro);
}
 erro.textContent = mensagem;
 erro.style.display = "block";
}
*/

function removerErros() {
  document
    .querySelectorAll(".erro-input")
    .forEach((el) => el.classList.remove("erro-input"));
  document
    .querySelectorAll(".erro-mensagem")
    .forEach((el) => (el.style.display = "none"));
}

document.addEventListener(
  "click",
  function () {
    removerErros();
  },
  true
);


// ________________________ LOGIN/EMPRESA _______________________
document
  .getElementById("loginEmpresaForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const cnpjInput = document.getElementById("empresaCNPJ");
    const senhaInput = document.getElementById("empresaPassword");

    [cnpjInput, senhaInput].forEach(clearInputError);

    const cnpj1 = cnpjInput.value.trim();
    const senha = senhaInput.value.trim();

    if (
      cnpj1.length !== 18 ||
      !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj1)
    ) {
      showInputError(cnpjInput, "CNPJ inválido. formato 00.000.000/0000-00.");
      return;
    }

    if (senha.length < 8) {
      showInputError(senhaInput, "mínimo 8 caracteres.");
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(senha)) {
      showInputError(
        senhaInput,
        "Senha deve ter maiúscula, minúscula, número e caractere especial."
      );
      return;
    }

    const cnpj = cnpj1.replace(/[^\d]/g, "");

    fetch("/login-empresa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cnpj, senha }),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const erro = await res.json();
          throw { status: res.status, message: erro.error || "Erro ao fazer login."};
        }
        window.location.href = "/";
      })
      .catch((erro) => {
        if(erro.status===500){
          mostrarErroTopo('Erro ao fazer login. (A culpa não foi sua, tente novamente)')
        }
        else {mostrarErroTopo(erro.message);}
      });
  });

// ________________________ CADASTRO/EMPRESA _______________________
const registerEmpresaForm = document.getElementById("registerEmpresaForm");
if (registerEmpresaForm) {
  registerEmpresaForm.addEventListener("submit", function (e) {
    e.preventDefault();
    cadastrarEmpresa();
  });
}

function cadastrarEmpresa() {
  const emailInput = document.getElementById("empresaEmail");
  const razaoInput = document.getElementById("empresaRazao");
  const cnpjInput = document.getElementById("empresaCNPJRegister");
  const senhaInput = document.getElementById("empresaRegisterPassword");
  const confirmSenhaInput = document.getElementById("empresaConfirmPassword");
  const telefoneInput = document.getElementById("empresaTelefone");
  const cepInput = document.getElementById("empresaCep");
  const numeroInput = document.getElementById("empresaNumero");
  const complementoInput = document.getElementById("empresaComplemento");
  const empresaFantasiaInput = document.getElementById("empresaFantasia");
  [
    emailInput,
    razaoInput,
    cnpjInput,
    senhaInput,
    confirmSenhaInput,
    telefoneInput,
    cepInput,
    numeroInput,
    complementoInput,
    empresaFantasiaInput,
  ].forEach(clearInputError);

  const email = emailInput.value.trim();
  const razao_soci = razaoInput.value.trim();
  const cnpj1 = cnpjInput.value.trim();
  const senha = senhaInput.value.trim();
  const confirmSenha = confirmSenhaInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const cep = cepInput.value.trim();
  const numero = numeroInput.value.trim();
  let complemento = complementoInput.value.trim();
  const nome_fant = empresaFantasiaInput.value.trim();

  if (!email) {
    showInputError(emailInput, "preencha o e-mail.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showInputError(emailInput, "insira um email válido.");
    return;
  }
  if (!telefone) {
    showInputError(telefoneInput, "preencha o telefone.");
    return;
  }
  if (!/^\+55 \d{2} \d{4,5}-\d{4}$/.test(telefone)) {
    showInputError(telefoneInput, "Telefone inválido (use +55 XX XXXXX-XXXX)");
    return;
  }
  if (!razao_soci) {
    showInputError(razaoInput, "preencha a razão social.");
    return;
  }
  if (!nome_fant) {
    showInputError(empresaFantasiaInput, "preencha o nome fantasia.");
    return;
  }
  if (!cnpj1) {
    showInputError(cnpjInput, "preencha o CNPJ.");
    return;
  }
  if (
    cnpj1.length !== 18 ||
    !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj1)
  ) {
    showInputError(cnpjInput, "insira um CNPJ válido.");
    return;
  }
  if (!cep) {
    showInputError(cepInput, "preencha o CEP.");
    return;
  }
  if (!/^\d{5}-\d{3}$/.test(cep)) {
    showInputError(cepInput, "CEP inválido (use XXXXX-XXX).");
    return;
  }
  if (!numero) {
    showInputError(numeroInput, "Por favor, preencha o número.");
    return;
  }
  if (!/[a-zA-Z0-9]/.test(numero)) {
    showInputError(numeroInput, "use letras ou números.");
    return;
  }
  if (!senha) {
    showInputError(senhaInput, "Por favor, preencha a senha.");
    return;
  }
  if (senha.length < 8) {
    showInputError(senhaInput, "mínimo 8 caracteres.");
    return;
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(senha)) {
    showInputError(
      senhaInput,
      "Senha deve ter maiúscula, minúscula, número e caractere especial."
    );
    return;
  }
  if (!confirmSenha) {
    showInputError(confirmSenhaInput, "confirme a senha.");
    return;
  }
  if (senha !== confirmSenha) {
    showInputError(confirmSenhaInput, "As senhas não coincidem.");
    return;
  }

  if(document.getElementById("empresaRua").value === ""){
    showInputError(cepInput, "CEP inválido");
    return;
  }

  const cnpj = cnpj1.replace(/[^\d]/g, "");

  fetch("/empresas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cnpj,
      nome_fant,
      telefone,
      email,
      senha,
      razao_soci,
      cep,
      complemento,
      numero,
    }),
  })
    .then(async (res) => {
      if (res.ok) {
        return fetch("/login-empresa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cnpj, senha }),
          credentials: "include",
        });
      } else {
        const erro = await res.json();
        throw { status: res.status, message: erro.error || "Erro ao cadastrar a empresa." };
      }
    })
    .then(async (res) => {
      if (!res.ok) {
        const erro = await res.json();
        throw { status: res.status, message: erro.error || "Erro ao fazer login automático." };
      }
      alert("Empresa cadastrada com SUCESSO!");
      window.location.href = "/";
    })
    .catch((erro) => {
      console.log(erro.message)
      if (erro.status===409)
        {
        mostrarErroTopo("Empresa já cadastrada.");
        return;
      }
      else if(erro.status===500){
        mostrarErroTopo('Erro ao cadastrar empresa (A culpa não foi sua, tente novamente).');
        return;
      }else{
        mostrarErroTopo(erro.message||'Erro desconhecido, tente novamente.');
        return;
      }
    });
}

// ________________________ LOGIN/US _______________________
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  login();
});

function login() {
  const email = loginUsername.value.trim();
  const senha = loginPassword.value.trim();

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
    credentials: "include",
  })
  .then(async (res) => {
    
    if (!res.ok) {
      const erro = await res.json();
      throw { status: res.status, message: erro.error || "Erro ao fazer login."};
    }
    window.location.href = "/";
  })
  .catch((erro) => {
    if(erro.status===500){
      mostrarErroTopo('Erro ao fazer login. (A culpa não foi sua, tente novamente)')
    }else{
      mostrarErroTopo(erro.message)
    }
  });
}

// ________________________ CADASTRO/US _______________________
registerForm.addEventListener("submit", cadastrar);

function cadastrar(e) {
  e.preventDefault();
  [
    registerUsername,
    registerEmail,
    registerPassword,
    confirmPassword,
    dob,
    registerSobrenome,
  ].forEach(clearInputError);
  const name = registerUsername.value.trim();
  const sobrenome = registerSobrenome.value.trim();
  const dobValue = dob.value.trim();
  const email = registerEmail.value.trim();
  const senha = registerPassword.value.trim();
  const confirmSenha = confirmPassword.value.trim();
  var genero = genderSelect.value;

  if (!name) {
    showInputError(registerUsername, "preencha o nome.");
    return;
  }
  if (!sobrenome) {
    showInputError(registerSobrenome, "preencha o sobrenome.");
    return;
  }
  if (name.length < 4) {
    showInputError(registerUsername, "mínimo 4 caracteres.");
    return;
  }
  if (!dobValue) {
    showInputError(dob, "preencha a data de nascimento.");
    return;
  }
  if (!dobValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    showInputError(dob, "formato DD/MM/AAAA.");
    return;
  }
  if (!validarDataNascimento(dobValue)) {
    showInputError(dob, "Data inválida (idade: 14 a 120 anos).");
    return;
  }
  if (!email) {
    showInputError(registerEmail, "preencha o e-mail.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showInputError(registerEmail, "insira um email válido.");
    return;
  }
  if (!senha) {
    showInputError(registerPassword, "preencha a senha.");
    return;
  }
  if (senha.length < 8) {
    showInputError(registerPassword, "mínimo 8 caracteres.");
    return;
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(senha)) {
    showInputError(registerPassword, "use maiúscula, minúscula, número e caractere especial.");
    return;
  }
  if (!confirmSenha) {
    showInputError(confirmPassword, "confirme a senha.");
    return;
  }
  if (confirmSenha.length < 8) {
    showInputError(confirmPassword, "mínimo 8 caracteres.");
    return;
  }
  if (senha !== confirmSenha) {
    showInputError(confirmPassword, "As senhas não coincidem.");
    return;
  }
  if (!genero) {
    showInputError(genderSelect, "selecione um gênero.");
    return;
  }
  if (genero === "Outro") {
    const outroGenero = outroGeneroInput.value.trim();
    if (!outroGenero) {
      showInputError(
        outroGeneroInput,
        "preencha o campo de gênero personalizado."
      );
      return;
    }
    genero = outroGenero;
  }

  const nome = `${name} ${sobrenome}`;
  const [dia, mes, ano] = dobValue.split("/");
  const data_nasc = `${ano}-${mes}-${dia}`;

  fetch("/candidatos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, genero, data_nasc }),
  })
  .then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw { status: res.status, message: data.error || "Erro ao cadastrar o usuário." };
    window.location.href = `./pages/waitingConfirm.html?email=${email}`;
  })
  .catch((erro) => {
    console.log(erro.message)
    if (erro.status===409) {
      mostrarErroTopo(
        erro.message
      );
      return;
    }else
    if(erro.status===500){
      mostrarErroTopo("Erro ao cadastrar usuário. (A culpa não foi sua, tente novamente)")
    }
    else{
      mostrarErroTopo(`Erro do sistema: ${erro.message}`);
    }
  });
}
