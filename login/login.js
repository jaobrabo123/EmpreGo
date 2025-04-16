const sign_in_btn = document.querySelector("#login-in-btn");
const sign_up_btn = document.querySelector("#login-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// _________________________OLHO_______________________
function handlePasswordToggle(inputId, eyeIconId, toggleBtnId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(eyeIconId);
  const togglePasswordBtn = document.getElementById(toggleBtnId);

  passwordInput.addEventListener("input", function () {
    if (passwordInput.value.length > 0) {
      eyeIcon.style.display = "block"; 
      togglePasswordBtn.style.display = "block";
    } else {
      eyeIcon.style.display = "none"; 
      togglePasswordBtn.style.display = "none"; 
    }
  });

  // Evento para alternar entre mostrar/ocultar a senha
  togglePasswordBtn.addEventListener("click", function () {
    if (passwordInput.value.length > 0) {
      if (passwordInput.type === "password") {
        passwordInput.type = "text"; 
        eyeIcon.src = "/imagens/olho.png";
      } else {
        passwordInput.type = "password"; 
        eyeIcon.src = "/imagens/escondido.png"; 
      }
    }
  });

  passwordInput.addEventListener("focus", function () {
    if (passwordInput.value.length > 0 && passwordInput.type !== "password") {
      passwordInput.type = "password"; 
      eyeIcon.src = "/imagens/escondido.png"; 
    }
  });
}

handlePasswordToggle("password", "eyeIcon", "togglePassword");
handlePasswordToggle("registerPassword", "eyeIconRegister", "toggleRegisterPassword");
handlePasswordToggle("confirmPassword", "eyeIconConfirm", "toggleConfirmPassword");

document.querySelector("form.transição-log-cadast").addEventListener("submit", function (event) {
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("As senhas não coincidem. Por favor, tente novamente.");
    event.preventDefault(); 
  }
});

// _________________________CAMPOS OBRIGATORIOS_______________________
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
const registerBtn = document.getElementById('registerBtn');

function checkLoginFields() {
  if (loginUsername.value && loginPassword.value) {
    loginBtn.disabled = false; 
  } else {
    loginBtn.disabled = true;
  }
}

function checkRegisterFields() {
  if (
    registerUsername.value &&
    registerEmail.value &&
    registerPassword.value &&
    confirmPassword.value &&
    dob.value &&
    genderSelect.value
  ) {
    registerBtn.disabled = false;
  } else {
    registerBtn.disabled = true; 
  }
}

loginUsername.addEventListener('input', checkLoginFields);
loginPassword.addEventListener('input', checkLoginFields);

registerUsername.addEventListener('input', checkRegisterFields);
registerEmail.addEventListener('input', checkRegisterFields);
registerPassword.addEventListener('input', checkRegisterFields);
confirmPassword.addEventListener('input', checkRegisterFields);
dob.addEventListener('input', checkRegisterFields);
genderSelect.addEventListener('change', checkRegisterFields);

// ________________________DATA_______________________
 function calcularLimitesIdade() {
  const hoje = new Date();
  

  const minDate = new Date(hoje.setFullYear(hoje.getFullYear() - 16));
  const minDateString = minDate.toISOString().split('T')[0]; 
  
  const maxDate = new Date(hoje.setFullYear(hoje.getFullYear() - 100));
  const maxDateString = maxDate.toISOString().split('T')[0];

  return { minDateString, maxDateString };
}

const { minDateString, maxDateString } = calcularLimitesIdade();
const dobField = document.getElementById('dob');

dobField.min = maxDateString; 
dobField.max = minDateString;

dobField.addEventListener('focus', function () {
  dobField.showPicker(); 
});

document.querySelector("form").addEventListener("submit", function (event) {
  const dob = new Date(dobField.value);
  const idade = new Date().getFullYear() - dob.getFullYear();
  
  if (idade < 16 || idade > 100) {
    alert("Você precisa ter entre 16 e 100 anos para se cadastrar.");
    event.preventDefault();
  }
});

function calcularLimitesIdade() {
  const hoje = new Date();

  const minDate = new Date(hoje.setFullYear(hoje.getFullYear() - 16));
  const minDateString = minDate.toISOString().split('T')[0]; 
  
  const maxDate = new Date(hoje.setFullYear(hoje.getFullYear() - 100));
  const maxDateString = maxDate.toISOString().split('T')[0]; 

  return { minDateString, maxDateString };
}

// ________________________SENHA_______________________
