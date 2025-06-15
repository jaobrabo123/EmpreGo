// Modo Login/Cadastro
const sign_in_btn = document.querySelector("#login-in-btn");
const sign_up_btn = document.querySelector("#login-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => container.classList.add("sign-up-mode"));
sign_in_btn.addEventListener("click", () => container.classList.remove("sign-up-mode"));

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
    eyeIcon.src = passwordInput.type === "password" ? "../imagens/escondido.png" : "../imagens/olho.png";
  });
}

handlePasswordToggle("password", "eyeIcon", "togglePassword");
handlePasswordToggle("registerPassword", "eyeIconRegister", "toggleRegisterPassword");
handlePasswordToggle("confirmPassword", "eyeIconConfirm", "toggleConfirmPassword");

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

function checkLoginFields() {
  loginBtn.disabled = !(loginUsername.value && loginPassword.value);
}

function checkRegisterFields() {
  const outroGeneroVal = document.getElementById('outroGeneroInput').value.trim();

  const allFieldsFilled =
    registerUsername.value.trim() &&
    registerEmail.value.trim() &&
    registerPassword.value.trim() &&
    confirmPassword.value.trim() &&
    dob.value.trim() &&
    (genderSelect.value !== 'Outro' ? genderSelect.value.trim() : outroGeneroVal !== '');

  const submitBtn = registerForm.querySelector('input[type="submit"]');
  submitBtn.disabled = !allFieldsFilled;
}

const loginInputs = [loginUsername, loginPassword];
const registerInputs = [registerUsername, registerEmail, registerPassword, confirmPassword, dob, genderSelect];

loginInputs.forEach(input => input.addEventListener('input', checkLoginFields));
registerInputs.forEach(input => input.addEventListener('input', checkRegisterFields));
document.getElementById('outroGeneroInput').addEventListener('input', checkRegisterFields);

// ________________________ CONTROLE DE ETAPAS (Cadastro Multi-step) _______________________
let etapaAtual = 0;
const steps = document.querySelectorAll("#registerForm .step");

function mostrarEtapa(n) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === n);
  });
}

function avancarEtapa() {
  if (etapaAtual === 0) {
    const email = registerEmail.value.trim();
    const senha = registerPassword.value.trim();
    const confirmar = confirmPassword.value.trim();

    if (!email || !senha || !confirmar) {
      alert("Preencha todos os campos da Etapa 1 antes de avançar.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor, insira um e-mail válido no formato exemplo@dominio.com.");
      return;
    }

    if (senha !== confirmar) {
      alert("As senhas não coincidem.");
      return;
    }

    if (senha.length < 8) {
      alert("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
  }

  if (etapaAtual < steps.length - 1) {
    etapaAtual++;
    mostrarEtapa(etapaAtual);
  } 
}

function voltarEtapa() {
  if (etapaAtual > 0) {
    etapaAtual--;
    mostrarEtapa(etapaAtual);
  }
}

// ________________________ DROPDOWN DE GÊNERO _______________________
function toggleDropdown() {
  document.getElementById('genderDropdown').classList.toggle('active');
}

function selectGender() {
  const value = document.querySelector("#selectGenderGuis").value
  const outroContainer = document.getElementById('outroGeneroContainer');
  const outroInput = document.getElementById('outroGeneroInput');
  const caixaText = document.getElementById('genderDropdown').closest('.caixa-text');
  const selectedText = document.querySelector('#genderDropdown .selected');
  const genderSelect = document.getElementById('genderSelect');
  genderSelect.value = value;
  selectedText.innerText = value;

  if (value === 'Outro') {
    outroContainer.style.display = 'block';
    caixaText.classList.add('show-outro');
    outroInput.focus();
  } else {
    outroContainer.style.display = 'none';
    caixaText.classList.remove('show-outro');
    outroInput.value = '';
  }

  document.getElementById('genderDropdown').classList.remove('active');

  checkRegisterFields();
}

window.addEventListener('click', function (e) {
  const dropdown = document.getElementById('genderDropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    dropdown.classList.remove('active');
  }
});

const outroInput = document.getElementById('outroGeneroInput');
if (outroInput) {
  outroInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      const outroValue = this.value.trim();
      if (outroValue) {
        document.querySelector('#genderDropdown .selected').innerText = outroValue;
        document.getElementById('genderSelect').value = outroValue;
        document.getElementById('outroGeneroContainer').style.display = 'none';
        this.value = '';
        checkRegisterFields();
      }
    }
  });
}

// ________________________ MÁSCARA DE DATA DE NASCIMENTO _______________________
document.addEventListener('DOMContentLoaded', function () {
  mostrarEtapa(etapaAtual);

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

function cadastrar() {
  const username = registerUsername.value.trim();
  const dob = document.getElementById('dob').value.trim();

  if (username.length < 4) {
    alert("O Username deve ter no mínimo 4 caracteres.");
    return;
  }

  if (!validarDataNascimento(dob)) {
    alert("Por favor, insira uma data de nascimento válida. Sua idade deve ser entre 12 e 120 anos.");
    return;
  }

  const nome = document.querySelector('#regUsername').value;
  const email = document.querySelector('#email').value;
  const senha = document.querySelector('#registerPassword').value;
  var genero = document.querySelector('#selectGenderGuis').value;
  if (genero=='Outro'){
    genero = document.querySelector("#outroGeneroInput").value
  }
  var datanasc = document.querySelector('#dob').value;

  const [dia, mes, ano] = datanasc.split('/');
  datanasc = `${ano}-${mes}-${dia}`

  fetch('/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, genero, datanasc })
  })
  .then(res => {
      if (res.ok) {
          // Cadastro bem-sucedido, agora faz login automático
          return fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, senha })
          });
      } else {
          throw new Error('Erro ao cadastrar o usuário.');
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
      window.location.href = '../index/index.html';
  })
  .catch(err => alert('Erro: ' + err.message));  
}

document.querySelector("#loginForm").addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector("#username").value
  const senha = document.querySelector("#password").value

  fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
    
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('Login inválido.');
        }
    })
    .then(data => {
        localStorage.setItem('token', data.token);
        window.location.href = '../index/index.html';
    })
    .catch(err => alert('Erro: ' + err.message));
})
