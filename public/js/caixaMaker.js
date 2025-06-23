var liberar = true

function adicionarExp() {
    if(!liberar){
        return;
    }
    liberar = false
    const titulo_exp = document.querySelector("#inputTitulo").value
    const img_exp = document.querySelector("#imgPlaceholder").files[0];
    const descricao_exp = document.querySelector("#caixaText").value
    const token = localStorage.getItem('token');

    
    if (token && titulo_exp && img_exp && descricao_exp) {
        const formData = new FormData();
        formData.append('titulo_exp', titulo_exp);
        formData.append('descricao_exp', descricao_exp);
        formData.append('img_exp', img_exp);

        fetch('/exps', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Experiência adicionada com sucesso!');
            window.location.href = './profile.html';
        })
        .catch(error => {
            console.error('Erro ao adicionar experiência:', error);
            alert('Erro ao adicionar experiência');
            liberar = true
        });
    } else {
        alert("Você precisa digitar todas as informações na caixa");
    }


}