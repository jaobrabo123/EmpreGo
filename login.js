function esqueceu(){
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

function mostrarsenha(){
    var senhaInput = document.getElementById("senha");
    if (senhaInput.type === "password") {
      senhaInput.type = "text" // Torna o campo visível
      document.getElementById("olho").src =  "imagens/olhoaberto.png"
    } else {
      senhaInput.type = "password"; // Torna o campo invisível
      document.getElementById("olho").src =  "imagens/olhofechado.png"
    }
}