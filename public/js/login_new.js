// Main Form Controller
class FormManager {
  constructor() {
    this.forms = {
      'user-login': document.getElementById('user-login'),
      'user-register': document.getElementById('user-register'),
      'company-login': document.getElementById('company-login'),
      'company-register': document.getElementById('company-register')
    };
    
    this.currentForm = 'user-login';
    this.init();
  }

  init() {
    // Setup tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        this.switchTab(tabId);
      });
    });

    // Setup form links
    document.querySelectorAll('[data-show-form]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const formId = e.currentTarget.dataset.showForm;
        this.showForm(formId);
      });
    });

    // Setup password toggles
    this.setupPasswordToggles();

    // Initialize form validation
    this.setupValidation();

    // Initialize masks and other utilities
    this.setupUtilities();

    // Show initial form
    this.showForm(this.currentForm);

    // Initialize field checks
    this.setupFieldChecks();
  }

  switchTab(tabId) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Show corresponding form
    this.showForm(tabId);
  }

  showForm(formId) {
    // Hide all forms
    Object.values(this.forms).forEach(form => {
      if (form) form.classList.remove('active');
    });

    // Show selected form
    if (this.forms[formId]) {
      this.forms[formId].classList.add('active');
      this.currentForm = formId;

      // Add animation class
      this.forms[formId].classList.add('animate-in');
      setTimeout(() => {
        this.forms[formId].classList.remove('animate-in');
      }, 300);
    }
  }

  setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const container = e.currentTarget.closest('.password-container');
        const input = container.querySelector('input');
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
      });
    });
  }

  setupValidation() {
    // User Login Form
    const userLoginForm = document.getElementById('loginForm');
    if (userLoginForm) {
      userLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserLogin();
      });
    }

    // User Register Form
    const userRegisterForm = document.getElementById('registerForm');
    if (userRegisterForm) {
      userRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleUserRegister();
      });
    }

    // Company Login Form
    const companyLoginForm = document.getElementById('loginEmpresaForm');
    if (companyLoginForm) {
      companyLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCompanyLogin();
      });
    }

    // Company Register Form
    const companyRegisterForm = document.getElementById('registerEmpresaForm');
    if (companyRegisterForm) {
      companyRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCompanyRegister();
      });
    }
  }

  setupUtilities() {
    // Date of birth mask
    const dobInput = document.getElementById("dob");
    if (dobInput) {
      dobInput.addEventListener("input", function () {
        let value = this.value.replace(/\D/g, "");
        value = value.slice(0, 8);

        if (value.length >= 5) {
          value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
        } else if (value.length >= 3) {
          value = value.slice(0, 2) + "/" + value.slice(2);
        }

        this.value = value;
      });

      dobInput.addEventListener("keydown", function (e) {
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      });
    }

    // Gender dropdown handler
    const genderSelect = document.getElementById("genderSelect");
    if (genderSelect) {
      genderSelect.addEventListener("change", () => this.handleGenderChange());
    }

    // CEP handling for company
    const empresaCepInput = document.getElementById("empresaCep");
    if (empresaCepInput) {
      empresaCepInput.addEventListener("input", function () {
        let value = this.value.replace(/\D/g, "").slice(0, 8); // Limit to 8 digits
        if (value.length > 5) {
          value = value.slice(0, 5) + "-" + value.slice(5);
        }
        this.value = value;
      });

      empresaCepInput.addEventListener("keydown", function (e) {
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
          e.preventDefault();
        }
      });

      empresaCepInput.addEventListener("blur", () => this.preencherEnderecoPorCep());
    }

    // Phone number mask for company
    const empresaTelefoneInput = document.getElementById("empresaTelefone");
    if (empresaTelefoneInput) {
      empresaTelefoneInput.addEventListener("input", function () {
        let raw = this.value.replace(/\D/g, "");
        if (raw.startsWith("55")) {
          raw = raw.slice(2);
        }
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

    // CNPJ masks
    const cnpjRegisterInput = document.getElementById("empresaCNPJRegister");
    if (cnpjRegisterInput) this.aplicarMascaraCNPJ(cnpjRegisterInput);

    const cnpjLoginInput = document.getElementById("empresaCNPJ");
    if (cnpjLoginInput) this.aplicarMascaraCNPJ(cnpjLoginInput);
  }

  setupFieldChecks() {
    // User login fields
    const loginUsername = document.getElementById("username");
    const loginPassword = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");

    if (loginUsername && loginPassword && loginBtn) {
      const checkLoginFields = () => {
        loginBtn.disabled = !(loginUsername.value && loginPassword.value);
      };

      [loginUsername, loginPassword].forEach(input => {
        input.addEventListener("input", checkLoginFields);
      });
      checkLoginFields();
    }

    // User register fields
    const registerUsername = document.getElementById("regUsername");
    const registerSobrenome = document.getElementById("regUsernameSobre");
    const registerEmail = document.getElementById("email");
    const registerPassword = document.getElementById("registerPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const dob = document.getElementById("dob");
    const genderSelect = document.getElementById("genderSelect");
    const outroGeneroInput = document.getElementById("outroGeneroInput");

    if (registerUsername && registerEmail && registerPassword && confirmPassword && dob && genderSelect) {
      const checkRegisterFields = () => {
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
      };

      [registerUsername, registerEmail, registerPassword, confirmPassword, dob, genderSelect].forEach(input => {
        if (input) input.addEventListener("input", checkRegisterFields);
      });
      if (outroGeneroInput) outroGeneroInput.addEventListener("input", checkRegisterFields);
      checkRegisterFields();
    }
  }

  // Utility methods
  handleGenderChange() {
    const select = document.getElementById("genderSelect");
    const otherInputContainer = document.querySelector(".other-gender-input-container");

    if (!select || !otherInputContainer) return;

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
  }

  async preencherEnderecoPorCep() {
    const cepInput = document.getElementById("empresaCep");
    if (!cepInput) return;

    const cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      document.getElementById("empresaRua").value = "";
      document.getElementById("empresaBairro").value = "";
      document.getElementById("empresaCidade").value = "";
      document.getElementById("empresaEstado").value = "";
      return;
    }

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (!response.ok) throw new Error("CEP não encontrado");
      const data = await response.json();

      document.getElementById("empresaRua").value = data.street || "";
      document.getElementById("empresaBairro").value = data.neighborhood || "";
      document.getElementById("empresaCidade").value = data.city || "";
      document.getElementById("empresaEstado").value = data.state || "";
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      document.getElementById("empresaRua").value = "";
      document.getElementById("empresaBairro").value = "";
      document.getElementById("empresaCidade").value = "";
      document.getElementById("empresaEstado").value = "";
    }
  }

  aplicarMascaraCNPJ(input) {
    input.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "").slice(0, 14);

      if (value.length >= 3) value = value.replace(/^(\d{2})(\d)/, "$1.$2");
      if (value.length >= 6) value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      if (value.length >= 9) value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
      if (value.length >= 13) value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");

      this.value = value;
    });
  }

  validarDataNascimento(dobStr) {
    const partes = dobStr.split("/");
    if (partes.length !== 3) return false;

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);

    const data = new Date(ano, mes, dia);

    if (data.getFullYear() !== ano || data.getMonth() !== mes || data.getDate() !== dia) {
      return false;
    }

    const hoje = new Date();
    let idade = hoje.getFullYear() - ano;

    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
      idade--;
    }

    return idade >= 14 && idade <= 120;
  }

  // Error handling
  showInputError(input, message) {
    this.clearInputError(input);

    input.classList.add("erro-input");
    const errorDiv = document.createElement("div");
    errorDiv.className = "erro-mensagem";
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.style.display = "block";

    input.parentNode.appendChild(errorDiv);
  }

  clearInputError(input) {
    input.classList.remove("erro-input");
    const error = input.parentNode.querySelector(".erro-mensagem");
    if (error) error.remove();
  }

  mostrarErroTopo(mensagem) {
    const old = document.querySelector('.erro-mensagem-geral');
    if (old) old.remove();

    const erroDiv = document.createElement('div');
    erroDiv.className = 'erro-mensagem-geral';

    const contrasteDiv = document.createElement('div');
    contrasteDiv.className = 'erro-mensagem-contraste';
    contrasteDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagem}`;

    erroDiv.appendChild(contrasteDiv);
    document.body.prepend(erroDiv);

    setTimeout(() => {
      if (erroDiv.parentNode) erroDiv.remove();
    }, 5000);
  }

  // Form Handlers
  async handleUserLogin() {
    const form = document.getElementById('loginForm');
    const email = form.querySelector('input[type="email"]').value.trim();
    const senha = form.querySelector('input[type="password"]').value.trim();

    // Validate inputs
    if (!email) {
      this.showInputError(form.querySelector('input[type="email"]'), 'Por favor, preencha o e-mail.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showInputError(form.querySelector('input[type="email"]'), 'Por favor, insira um email válido.');
      return;
    }

    if (!senha) {
      this.showInputError(form.querySelector('input[type="password"]'), 'Por favor, preencha a senha.');
      return;
    }

    if (senha.length < 8) {
      this.showInputError(form.querySelector('input[type="password"]'), 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
        credentials: "include",
      });

      if (!response.ok) {
        const erro = await response.json();
        throw { status: response.status, message: erro.error || "Erro ao fazer login." };
      }

      window.location.href = "./index.html";
    } catch (erro) {
      if (erro.status === 500) {
        this.mostrarErroTopo('Erro ao fazer login. (A culpa não foi sua, tente novamente)');
      } else {
        this.mostrarErroTopo(erro.message || 'Erro ao fazer login.');
      }
    }
  }

  async handleUserRegister() {
    const form = document.getElementById('registerForm');
    const name = form.querySelector('#regUsername').value.trim();
    const sobrenome = form.querySelector('#regUsernameSobre').value.trim();
    const dobValue = form.querySelector('#dob').value.trim();
    const email = form.querySelector('#email').value.trim();
    const senha = form.querySelector('#registerPassword').value.trim();
    const confirmSenha = form.querySelector('#confirmPassword').value.trim();
    const genderSelect = form.querySelector('#genderSelect');
    const outroGeneroInput = form.querySelector('#outroGeneroInput');
    let genero = genderSelect.value;

    // Clear previous errors
    [
      form.querySelector('#regUsername'),
      form.querySelector('#regUsernameSobre'),
      form.querySelector('#email'),
      form.querySelector('#registerPassword'),
      form.querySelector('#confirmPassword'),
      form.querySelector('#dob'),
      genderSelect,
      outroGeneroInput
    ].forEach(input => this.clearInputError(input));

    // Validate inputs
    if (!name) {
      this.showInputError(form.querySelector('#regUsername'), 'Por favor, preencha o nome.');
      return;
    }

    if (!sobrenome) {
      this.showInputError(form.querySelector('#regUsernameSobre'), 'Por favor, preencha o sobrenome.');
      return;
    }

    if (name.length < 4) {
      this.showInputError(form.querySelector('#regUsername'), 'Nome deve ter pelo menos 4 caracteres.');
      return;
    }

    if (!dobValue) {
      this.showInputError(form.querySelector('#dob'), 'Por favor, preencha a data de nascimento.');
      return;
    }

    if (!dobValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      this.showInputError(form.querySelector('#dob'), 'Formato de data inválido (use DD/MM/AAAA).');
      return;
    }

    if (!this.validarDataNascimento(dobValue)) {
      this.showInputError(form.querySelector('#dob'), 'Data inválida (idade: 14 a 120 anos).');
      return;
    }

    if (!email) {
      this.showInputError(form.querySelector('#email'), 'Por favor, preencha o e-mail.');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showInputError(form.querySelector('#email'), 'Por favor, insira um email válido.');
      return;
    }

    if (!senha) {
      this.showInputError(form.querySelector('#registerPassword'), 'Por favor, preencha a senha.');
      return;
    }

    if (senha.length < 8) {
      this.showInputError(form.querySelector('#registerPassword'), 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(senha)) {
      this.showInputError(
        form.querySelector('#registerPassword'),
        'Senha deve ter maiúscula, minúscula, número e caractere especial.'
      );
      return;
    }

    if (!confirmSenha) {
      this.showInputError(form.querySelector('#confirmPassword'), 'Por favor, confirme a senha.');
      return;
    }

    if (senha !== confirmSenha) {
      this.showInputError(form.querySelector('#confirmPassword'), 'As senhas não coincidem.');
      return;
    }

    if (!genero) {
      this.showInputError(genderSelect, 'Por favor, selecione um gênero.');
      return;
    }

    if (genero === "Outro") {
      const outroGenero = outroGeneroInput.value.trim();
      if (!outroGenero) {
        this.showInputError(outroGeneroInput, 'Por favor, preencha o campo de gênero personalizado.');
        return;
      }
      genero = outroGenero;
    }

    const nome = `${name} ${sobrenome}`;
    const [dia, mes, ano] = dobValue.split("/");
    const data_nasc = `${ano}-${mes}-${dia}`;

    try {
      const response = await fetch("/candidatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, genero, data_nasc }),
      });

      if (response.ok) {
        const loginResponse = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
          credentials: "include",
        });

        if (!loginResponse.ok) {
          throw { status: loginResponse.status, message: "Login automático falhou." };
        }

        alert("Cadastro realizado com sucesso!");
        window.location.href = "./index.html";
      } else {
        const erro = await response.json();
        throw { status: response.status, message: erro.error || "Erro ao cadastrar o usuário." };
      }
    } catch (erro) {
      if (erro.message.includes("Email já cadastrado.")) {
        this.mostrarErroTopo("E-mail já cadastrado. Por favor, use outro e-mail.");
      } else if (erro.status === 500) {
        this.mostrarErroTopo("Erro ao cadastrar usuário. (A culpa não foi sua, tente novamente)");
      } else {
        this.mostrarErroTopo(`Erro do sistema: ${erro.message}`);
      }
    }
  }

  async handleCompanyLogin() {
    const form = document.getElementById('loginEmpresaForm');
    const cnpjInput = form.querySelector('input[type="text"]');
    const senhaInput = form.querySelector('input[type="password"]');

    const cnpj1 = cnpjInput.value.trim();
    const senha = senhaInput.value.trim();

    // Clear previous errors
    [cnpjInput, senhaInput].forEach(input => this.clearInputError(input));

    // Validate inputs
    if (cnpj1.length !== 18 || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj1)) {
      this.showInputError(cnpjInput, "CNPJ inválido. formato 00.000.000/0000-00.");
      return;
    }

    if (senha.length < 8) {
      this.showInputError(senhaInput, "mínimo 8 caracteres.");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(senha)) {
      this.showInputError(
        senhaInput,
        "Senha deve ter maiúscula, minúscula, número e caractere especial."
      );
      return;
    }

    const cnpj = cnpj1.replace(/[^\d]/g, "");

    try {
      const response = await fetch("/login-empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnpj, senha }),
        credentials: "include",
      });

      if (!response.ok) {
        const erro = await response.json();
        throw { status: response.status, message: erro.error || "Erro ao fazer login." };
      }

      window.location.href = "./index.html";
    } catch (erro) {
      if (erro.status === 500) {
        this.mostrarErroTopo('Erro ao fazer login. (A culpa não foi sua, tente novamente)');
      } else {
        this.mostrarErroTopo(erro.message);
      }
    }
  }

  async handleCompanyRegister() {
    const form = document.getElementById('registerEmpresaForm');
    const emailInput = form.querySelector('#empresaEmail');
    const razaoInput = form.querySelector('#empresaRazao');
    const cnpjInput = form.querySelector('#empresaCNPJRegister');
    const senhaInput = form.querySelector('#empresaRegisterPassword');
    const confirmSenhaInput = form.querySelector('#empresaConfirmPassword');
    const telefoneInput = form.querySelector('#empresaTelefone');
    const cepInput = form.querySelector('#empresaCep');
    const numeroInput = form.querySelector('#empresaNumero');
    const complementoInput = form.querySelector('#empresaComplemento');
    const empresaFantasiaInput = form.querySelector('#empresaFantasia');

    // Clear previous errors
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
    ].forEach(input => this.clearInputError(input));

    // Get values
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

    // Validate inputs
    if (!email) {
      this.showInputError(emailInput, "preencha o e-mail.");
      return;
    }

    if (!this.validateEmail(email)) {
      this.showInputError(emailInput, "insira um email válido.");
      return;
    }

    if (!telefone) {
      this.showInputError(telefoneInput, "preencha o telefone.");
      return;
    }

    if (!/^\+55 \d{2} \d{4,5}-\d{4}$/.test(telefone)) {
      this.showInputError(telefoneInput, "Telefone inválido (use +55 XX XXXXX-XXXX)");
      return;
    }

    if (!razao_soci) {
      this.showInputError(razaoInput, "preencha a razão social.");
      return;
    }

    if (!nome_fant) {
      this.showInputError(empresaFantasiaInput, "preencha o nome fantasia.");
      return;
    }

    if (!cnpj1) {
      this.showInputError(cnpjInput, "preencha o CNPJ.");
      return;
    }

    if (cnpj1.length !== 18 || !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj1)) {
      this.showInputError(cnpjInput, "insira um CNPJ válido.");
      return;
    }

    if (!cep) {
      this.showInputError(cepInput, "preencha o CEP.");
      return;
    }

    if (!/^\d{5}-\d{3}$/.test(cep)) {
      this.showInputError(cepInput, "CEP inválido (use XXXXX-XXX).");
      return;
    }

    if (!numero) {
      this.showInputError(numeroInput, "Por favor, preencha o número.");
      return;
    }

    if (!/[a-zA-Z0-9]/.test(numero)) {
      this.showInputError(numeroInput, "use letras ou números.");
      return;
    }

    if (!senha) {
      this.showInputError(senhaInput, "Por favor, preencha a senha.");
      return;
    }

    if (senha.length < 8) {
      this.showInputError(senhaInput, "mínimo 8 caracteres.");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(senha)) {
      this.showInputError(
        senhaInput,
        "Senha deve ter maiúscula, minúscula, número e caractere especial."
      );
      return;
    }

    if (!confirmSenha) {
      this.showInputError(confirmSenhaInput, "confirme a senha.");
      return;
    }

    if (senha !== confirmSenha) {
      this.showInputError(confirmSenhaInput, "As senhas não coincidem.");
      return;
    }

    if (document.getElementById("empresaRua").value === "") {
      this.showInputError(cepInput, "CEP inválido");
      return;
    }

    const cnpj = cnpj1.replace(/[^\d]/g, "");

    try {
      const response = await fetch("/empresas", {
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
      });

      if (response.ok) {
        const loginResponse = await fetch("/login-empresa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cnpj, senha }),
          credentials: "include",
        });

        if (!loginResponse.ok) {
          const erro = await loginResponse.json();
          throw { status: loginResponse.status, message: erro.error || "Erro ao fazer login automático." };
        }

        alert("Empresa cadastrada com SUCESSO!");
        window.location.href = "./index.html";
      } else {
        const erro = await response.json();
        throw { status: response.status, message: erro.error || "Erro ao cadastrar a empresa." };
      }
    } catch (erro) {
      if (erro.status === 409) {
        this.mostrarErroTopo("Empresa já cadastrada.");
      } else if (erro.status === 500) {
        this.mostrarErroTopo('Erro ao cadastrar empresa (A culpa não foi sua, tente novamente).');
      } else {
        this.mostrarErroTopo(erro.message || 'Erro desconhecido, tente novamente.');
      }
    }
  }

  // Helper Methods
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validateCNPJ(cnpj) {
    const re = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return re.test(cnpj);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const formManager = new FormManager();
  
  // Add global click handler to clear errors
  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
      document.querySelectorAll('.erro-input').forEach(el => {
        formManager.clearInputError(el);
      });
    }
  });
});

// Navigation functions for HTML links
function showUserLogin() {
  const formManager = new FormManager();
  formManager.showForm('user-login');
}

function showUserRegister() {
  const formManager = new FormManager();
  formManager.showForm('user-register');
}

function showCompanyLogin() {
  const formManager = new FormManager();
  formManager.showForm('company-login');
}

function showCompanyRegister() {
  const formManager = new FormManager();
  formManager.showForm('company-register');
}