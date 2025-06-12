function adicionarTag() {
    const tagUsuario = document.querySelector("#tagUsuario").value
    const token = localStorage.getItem('token');

    if (token && tagUsuario) {
        fetch('/tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome_tag: tagUsuario })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Tag adicionada com sucesso!');
            // você pode limpar o campo ou atualizar a lista de tags aqui
        })
        .catch(error => {
            console.error('Erro ao adicionar tag:', error);
            alert('Erro ao adicionar tag');
        });
    } else {
        alert("Você precisa digitar uma tag e estar logado.");
    }
}
