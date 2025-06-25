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
}

const loginInputs = [loginUsername, loginPassword];
const registerInputs = [registerUsername, registerEmail, registerPassword, confirmPassword, dob, genderSelect];

loginInputs.forEach(input => input.addEventListener('input', checkLoginFields));
registerInputs.forEach(input => input.addEventListener('input', checkRegisterFields));
if (outroGeneroInput) outroGeneroInput.addEventListener('input', checkRegisterFields);

// Inicializa estado dos botões
checkLoginFields();
checkRegisterFields();
// ________________________________________________________USUARIO ________________________________________________________________________
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
    }, 300);
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
  const cepInput = document.getElementById('empresaCep');
  const cep = cepInput.value.replace(/\D/g, '');

  if (cep.length !== 8) {
    document.getElementById('empresaRua').value = '';
    document.getElementById('empresaBairro').value = '';
    document.getElementById('empresaCidade').value = '';
    document.getElementById('empresaEstado').value = '';
    return;
  }

  try {
    const API_CEP = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
    if (!API_CEP.ok) throw new Error('CEP não encontrado');
    const DADOS_API = await API_CEP.json();

    document.getElementById('empresaRua').value = DADOS_API.street || '';
    document.getElementById('empresaBairro').value = DADOS_API.neighborhood || '';
    document.getElementById('empresaCidade').value = DADOS_API.city || '';
    document.getElementById('empresaEstado').value = DADOS_API.state || '';
  } catch (err) {
    document.getElementById('empresaRua').value = '';
    document.getElementById('empresaBairro').value = '';
    document.getElementById('empresaCidade').value = '';
    document.getElementById('empresaEstado').value = '';
  }
}

const empresaCepInput = document.getElementById('empresaCep');
if (empresaCepInput) {
  empresaCepInput.addEventListener('input', function () {
    var value = this.value.replace(/\D/g, '');

    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    this.value = value;

    if (value.length === 0) {
      document.getElementById('empresaRua').value = '';
      document.getElementById('empresaBairro').value = '';
      document.getElementById('empresaCidade').value = '';
      document.getElementById('empresaEstado').value = '';
    }

    if (value.length === 9) {
      preencherEnderecoPorCep();
    }
  });

  empresaCepInput.addEventListener('blur', preencherEnderecoPorCep);
}
// ________________________ Numero De Telefone _______________________
const empresaTelefoneInput = document.getElementById('empresaTelefone');

if (empresaTelefoneInput) {
  empresaTelefoneInput.addEventListener('input', function () {
    // Remove o +55 se já estiver presente para evitar duplicação
    let raw = this.value.replace(/\D/g, '');

    // Remove os dois primeiros dígitos se forem 55
    if (raw.startsWith('55')) {
      raw = raw.slice(2);
    }

    // Limita a 11 dígitos (2 DDD + 9 número)
    raw = raw.slice(0, 11);

    let formatted = '+55';

    if (raw.length > 0) {
      formatted += ' ' + raw.slice(0, 2); // DDD
    }
    if (raw.length > 2) {
      formatted += ' ' + raw.slice(2, 7);
    }
    if (raw.length > 7) {
      formatted += '-' + raw.slice(7, 11);
    }

    this.value = formatted;
  });
}
// ________________________ CNPJ _______________________
const cnpjInput = document.getElementById('empresaCNPJRegister');

cnpjInput.addEventListener('input', function () {
  var value = this.value.replace(/\D/g, ''); // Remove tudo que não for número
  value = value.slice(0, 14); // Limita a 14 dígitos

  // Aplica a máscara
  if (value.length >= 3) value = value.replace(/^(\d{2})(\d)/, '$1.$2');
  if (value.length >= 6) value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  if (value.length >= 9) value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
  if (value.length >= 13) value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');

  this.value = value;
});

// ________________________________________________________________________________________________________________________________
// ________________________ LOGIN/EMPRESA _______________________
document.getElementById('loginEmpresaForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const cnpjInput = document.getElementById('empresaCNPJ');
  const senhaInput = document.getElementById('empresaPassword');

  [cnpjInput, senhaInput].forEach(clearInputError);
  
  const cnpj = cnpjInput.value.trim();
  const senha = senhaInput.value.trim();

  if (cnpj.length !== 18 || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj)) {
    showInputError(cnpjInput, 'CNPJ inválido. Use o formato 00.000.000/0000-00.');
    return;
  }

  if (senha.length < 8) {
    showInputError(senhaInput, 'A senha deve ter no mínimo 8 caracteres.');
    return;
  }

});
// ________________________ CADASTRO/EMPRESA _______________________


function showInputError(input, message) {
  clearInputError(input);

  input.classList.add('erro-input');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'erro-mensagem';
  errorDiv.innerHTML = `<span class="icon">⚠️</span> ${message}`;
  errorDiv.style.display = 'block';

  input.parentNode.appendChild(errorDiv);
}

function clearInputError(input) {
  input.classList.remove('erro-input');
  const error = input.parentNode.querySelector('.erro-mensagem');
  if (error) error.remove();
}

const registerEmpresaForm = document.getElementById('registerEmpresaForm');
if (registerEmpresaForm) {
  registerEmpresaForm.addEventListener('submit', function (e) {
    e.preventDefault();
    cadastrarEmpresa();
  });
}

function cadastrarEmpresa() {
  const emailInput = document.getElementById('empresaEmail');
  const razaoInput = document.getElementById('empresaRazao');
  const cnpjInput = document.getElementById('empresaCNPJRegister');
  const senhaInput = document.getElementById('empresaRegisterPassword');
  const confirmSenhaInput = document.getElementById('empresaConfirmPassword');
  const telefoneInput = document.getElementById('empresaTelefone');
  const cepInput = document.getElementById('empresaCep');
  const numeroInput = document.getElementById('empresaNumero');
  const complementoInput = document.getElementById('empresaComplemento');
  [
    emailInput, razaoInput, cnpjInput, senhaInput, confirmSenhaInput,
    telefoneInput, cepInput, numeroInput, complementoInput
  ].forEach(clearInputError);

  const email = emailInput.value.trim();
  const razao = razaoInput.value.trim();
  const cnpj = cnpjInput.value.trim();
  const senha = senhaInput.value.trim();
  const confirmSenha = confirmSenhaInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const cep = cepInput.value.trim();
  const numero = numeroInput.value.trim();
  const complemento = complementoInput.value.trim();

  if (!email) { showInputError(emailInput, 'Por favor, preencha o e-mail.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showInputError(emailInput, 'Por favor, insira um email válido.');
    return;
  }
  if (!telefone) { showInputError(telefoneInput, 'Por favor, preencha o telefone.'); return; }
  if (!/^\+55 \d{2} \d{4,5}-\d{4}$/.test(telefone)) {
    showInputError(telefoneInput, 'Por favor, insira um telefone válido no formato +55 XX XXXXX-XXXX.');
    return;
  }
  if (!razao) { showInputError(razaoInput, 'Por favor, preencha a razão social.'); return; }
  if (!cnpj) { showInputError(cnpjInput, 'Por favor, preencha o CNPJ.'); return; }
  if (cnpj.length !== 18 || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj)) {
    showInputError(cnpjInput, 'Por favor, insira um CNPJ válido.');
    return;
  }
  if (!cep) { showInputError(cepInput, 'Por favor, preencha o CEP.'); return; }
  if (!/^\d{5}-\d{3}$/.test(cep)) {
    showInputError(cepInput, 'Por favor, insira um CEP válido no formato XXXXX-XXX.');
    return;
  }
  if (!numero) { showInputError(numeroInput, 'Por favor, preencha o número.'); return; }
  if (!/[a-zA-Z0-9]/.test(numero)) {
    showInputError(numeroInput, 'O número deve conter pelo menos um caractere alfanumérico.');
    return;
  }
  if (!complemento) { showInputError(complementoInput, 'Por favor, preencha o complemento.'); return; }
  if (!senha) { showInputError(senhaInput, 'Por favor, preencha a senha.'); return; }
  if (senha.length < 8) {
    showInputError(senhaInput, 'A senha deve ter pelo menos 8 caracteres.');
    return;
  }
  if (!confirmSenha) { showInputError(confirmSenhaInput, 'Por favor, confirme a senha.'); return; }
  if (senha !== confirmSenha) {
    showInputError(confirmSenhaInput, 'As senhas não coincidem.');
    return;
  }
}

// ________________________ LOGIN/US _______________________
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
    body: JSON.stringify({ email, senha }),
    credentials: 'include'
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao fazer login.');
      }
      window.location.href = './index.html';
    })
    .catch(err => alert(err.message));
}

// ________________________ CADASTRO/US _______________________
registerForm.addEventListener('submit', function (e) {
  e.preventDefault();
  cadastrar();
});

function cadastrar() {
  [
    registerUsername,
    registerEmail,
    registerPassword,
    confirmPassword,
    dob
  ].forEach(clearInputError);

  const username = registerUsername.value.trim();
  const dobValue = dob.value.trim();
  const email = registerEmail.value.trim();
  const senha = registerPassword.value.trim();
  const confirmSenha = confirmPassword.value.trim();
  var genero = genderSelect.value;

  if (!username) {
    showInputError(registerUsername, "Por favor, preencha o nome.");
    return;
  }
  if (username.length < 4) {
    showInputError(registerUsername, "O Username deve ter no mínimo 4 caracteres.");
    return;
  }
  if (!dobValue) {
    showInputError(dob, "Por favor, preencha a data de nascimento.");
    return;
  }
  if (!dobValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    showInputError(dob, "Por favor, insira a data de nascimento no formato DD/MM/AAAA.");
    return;
  }
  if (!validarDataNascimento(dobValue)) {
    showInputError(dob, "Por favor, insira uma data de nascimento válida. Sua idade deve ser entre 14 e 120 anos.");
    return;
  }
  if (!email) {
    showInputError(registerEmail, "Por favor, preencha o e-mail.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showInputError(registerEmail, "Por favor, insira um email válido.");
    return;
  }
  if (!senha) {
    showInputError(registerPassword, "Por favor, preencha a senha.");
    return;
  }
  if (senha.length < 8) {
    showInputError(registerPassword, "A senha deve ter no mínimo 8 caracteres.");
    return;
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(senha)) {
    showInputError(registerPassword, "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número.");
    return;
  }
  if (!confirmSenha) {
    showInputError(confirmPassword, "Por favor, confirme a senha.");
    return;
  }
  if (confirmSenha.length < 8) {
    showInputError(confirmPassword, "A confirmação de senha deve ter no mínimo 8 caracteres.");
    return;
  }
  if (senha !== confirmSenha) {
    showInputError(confirmPassword, "As senhas não coincidem.");
    return;
  }
  if (!genero) {
    showInputError(genderSelect, "Por favor, selecione um gênero.");
    return;
  }
  if (genero === 'Outro') {
    const outroGenero = outroGeneroInput.value.trim();
    if (!outroGenero) {
      showInputError(outroGeneroInput, "Por favor, preencha o campo de gênero personalizado.");
      return;
    }
    genero = outroGenero;
  }

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
          body: JSON.stringify({ email, senha }),
          credentials: 'include'
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
    .then(() => {
      alert("Cadastro realizado com sucesso!");
      window.location.href = './index.html';
    })
    .catch((err) => {
      alert(`Erro do sistema ${err.message}`);
    });
}