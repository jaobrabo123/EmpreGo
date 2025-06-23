// Modo Login/Cadastro
const sign_in_btn = document.querySelector("#login-in-btn");
const sign_up_btn = document.querySelector("#login-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => container.classList.add("sign-up-mode"));
sign_in_btn.addEventListener("click", () => container.classList.remove("sign-up-mode"));


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

// Voltar para modo usuário ao clicar nos botões de usuário

sign_in_btn.addEventListener("click", () => container.classList.remove("empresa-mode"));
sign_up_btn.addEventListener("click", () => container.classList.remove("empresa-mode"));

// _________________________ OLHO SENHA _______________________
function handlePasswordToggle(inputId, eyeIconId, toggleBtnId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(eyeIconId);
  const togglePasswordBtn = document.getElementById(toggleBtnId);

  function updateVisibility() {
    eyeIcon.style.display = passwordInput.value.length > 0 ? "block" : "none";
    togglePasswordBtn.style.display = passwordInput.value.length > 0 ? "block" : "none";
  }

  passwordInput.addEventListener("input", updateVisibility);
  updateVisibility();

  togglePasswordBtn.addEventListener("click", function () {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    eyeIcon.src = passwordInput.type === "password" ? "../assets/imgs/escondido.png" : "../assets/imgs/olho.png";
  });
}

handlePasswordToggle("password", "eyeIcon", "togglePassword");
handlePasswordToggle("registerPassword", "eyeIconRegister", "toggleRegisterPassword");
handlePasswordToggle("confirmPassword", "eyeIconConfirm", "toggleConfirmPassword");
// EMPRESA OLHO
handlePasswordToggle("empresaPassword", "eyeIconEmpresa", "toggleEmpresaPassword");
handlePasswordToggle("empresaRegisterPassword", "eyeIconEmpresaRegister", "toggleEmpresaRegisterPassword");
handlePasswordToggle("empresaConfirmPassword", "eyeIconEmpresaConfirm", "toggleEmpresaConfirmPassword");

// _________________________ CAMPOS OBRIGATÓRIOS _______________________
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('username');
const loginPassword = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');

const registerForm = document.getElementById('registerForm');
const registerUsername = document.getElementById('regUsername');
const registerEmail = document.getElementById('email');
const registerPassword = document.getElementById('registerPassword');
const confirmPassword = document.getElementById('confirmPassword');
const dob = document.getElementById('dob');
const genderSelect = document.getElementById('genderSelect');
const outroGeneroInput = document.getElementById('outroGeneroInput');

function checkLoginFields() {
  loginBtn.disabled = !(loginUsername.value && loginPassword.value);
}

function checkRegisterFields() {
  const outroGeneroVal = outroGeneroInput ? outroGeneroInput.value.trim() : '';
  const generoSelecionado = genderSelect.value;

  const generoPreenchido = (generoSelecionado !== '' && generoSelecionado !== 'Outro') ||
    (generoSelecionado === 'Outro' && outroGeneroVal !== '');

  const allFieldsFilled =
    registerUsername.value.trim() &&
    registerEmail.value.trim() &&
    registerPassword.value.trim() &&
    confirmPassword.value.trim() &&
    dob.value.trim() &&
    generoPreenchido;

  const submitBtn = registerForm.querySelector('input[type="submit"]');
  if (submitBtn) submitBtn.disabled = !allFieldsFilled;
}

const loginInputs = [loginUsername, loginPassword];
const registerInputs = [registerUsername, registerEmail, registerPassword, confirmPassword, dob, genderSelect];

loginInputs.forEach(input => input.addEventListener('input', checkLoginFields));
registerInputs.forEach(input => input.addEventListener('input', checkRegisterFields));
if (outroGeneroInput) outroGeneroInput.addEventListener('input', checkRegisterFields);

// Inicializa estado dos botões
checkLoginFields();
checkRegisterFields();

// ________________________ DROPDOWN DE GÊNERO _______________________
function handleGenderChange() {
  const select = document.getElementById('genderSelect');
  const otherInputContainer = document.querySelector('.other-gender-input-container');

  if (select.value === 'Outro') {
    otherInputContainer.style.display = 'block';
    setTimeout(() => {
      otherInputContainer.classList.add('show');
    }, 10);
  } else {
    otherInputContainer.classList.remove('show');
    setTimeout(() => {
      otherInputContainer.style.display = 'none';
    }, 300); // Espera a animação sumir
  }
  checkRegisterFields();
}

// ________________________ MÁSCARA DE DATA DE NASCIMENTO _______________________
document.addEventListener('DOMContentLoaded', function () {
  const dobInput = document.getElementById('dob');

  // Máscara de data de nascimento
  dobInput.addEventListener('input', function () {
    var value = dobInput.value.replace(/\D/g, '');

    value = value.slice(0, 8);

    if (value.length >= 5) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
    } else if (value.length >= 3) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }

    dobInput.value = value;
  });

  // Permitir apenas números e teclas de navegação
  dobInput.addEventListener('keydown', function (e) {
    const key = e.key;
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/[0-9]/.test(key) && !allowedKeys.includes(key)) {
      e.preventDefault();
    }
  });
});

// Função de validação da data de nascimento
function validarDataNascimento(dobStr) {
  const partes = dobStr.split('/');
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
  let idade = hoje.getFullYear() - ano;

  // Corrige se ainda não fez aniversário no ano
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade--;
  }

  return idade >= 12 && idade <= 120;
}

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  login();
});

function login() {
  const email = loginUsername.value.trim();
  const senha = loginPassword.value.trim();

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer login.');
      }
      localStorage.setItem('token', data.token);
      window.location.href = './index.html';
    })
    .catch(err => alert(err.message));
}

// ________________________ CADASTRO _______________________
registerForm.addEventListener('submit', function (e) {
  e.preventDefault();
  cadastrar();
});

function cadastrar() {
  const username = registerUsername.value.trim();
  const dobValue = dob.value.trim();
  let genero = genderSelect.value;

  if (genero === 'Outro') {
    const outroGenero = outroGeneroInput.value.trim();
    if (!outroGenero) {
      alert("Por favor, preencha o campo de gênero personalizado.");
      return;
    }
    genero = outroGenero;
  }

  if (username.length < 4) {
    alert("O Username deve ter no mínimo 4 caracteres.");
    return;
  }

  if (!validarDataNascimento(dobValue)) {
    alert("Por favor, insira uma data de nascimento válida. Sua idade deve ser entre 12 e 120 anos.");
    return;
  }

  const nome = username;
  const email = registerEmail.value.trim();
  const senha = registerPassword.value.trim();

  const [dia, mes, ano] = dobValue.split('/');
  const datanasc = `${ano}-${mes}-${dia}`;

  fetch('/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, genero, datanasc })
  })
    .then(async res => {
      if (res.ok) {
        return fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });
      } else {
        const erro = await res.json();
        throw new Error(erro.error || 'Erro ao cadastrar o usuário.');
      }
    })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Login automático falhou.');
      }
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      alert("Cadastro realizado com sucesso!");
      window.location.href = './index.html';
    })
    .catch(err => alert(err.message));
}