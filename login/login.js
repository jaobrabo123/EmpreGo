//ainda não tive tempo de mexer


/*function esqueceu(){
    let email = prompt('Digite o seu email e iremos te mandar uma mensagem para você alterar sua senha!')

    if (email !== null) {
        console.log("Você digitou: " + email)
      } else {
        console.log("Você cancelou o prompt.")
      }
}

function botao(){
    window.location.href = "index.html"
}
*/
function mostrarsenha(){
    var senhaInput = document.getElementById("pswd");
    if (senhaInput.type === "password") {
      senhaInput.type = "text" // Torna o campo visível
      document.getElementById("olho").className =  "fas fa-eye"
    } else {
      senhaInput.type = "password"; // Torna o campo invisível
      document.getElementById("olho").className =  "fas fa-eye-slash"
    }
}

function validarSenha() {
  const senha = document.getElementById("senha").value;
  const confirmaSenha = document.getElementById("confirmaSenha").value;
  const mensagemErro = document.getElementById("mensagemErro");

  if (senha !== confirmaSenha) {
      mensagemErro.style.display = "block"; // Exibe a mensagem de erro
      return false; // Impede o envio do formulário
  } else {
      mensagemErro.style.display = "none"; // Esconde a mensagem de erro
      return true; // Permite o envio do formulário
  }
}