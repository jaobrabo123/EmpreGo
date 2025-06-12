function adicionarExp() {
    const titulo_exp = document.querySelector("#inputTitulo").value
    const img_exp = document.querySelector("#imgPlaceholder").value
    const descricao_exp = document.querySelector("#caixaText").value
    const token = localStorage.getItem('token');

    
    if (token && titulo_exp && img_exp && descricao_exp) {
        fetch('/exps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({titulo_exp: titulo_exp, img_exp: img_exp, descricao_exp: descricao_exp})
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Experiência adicionada com sucesso!');
            // você pode limpar o campo ou atualizar a lista de tags aqui
        })
        .catch(error => {
            console.error('Erro ao adicionar experiência:', error);
            alert('Erro ao adicionar tag');
        });
    } else {
        alert("Você precisa digitar todas as informações na caixa");
    }


}