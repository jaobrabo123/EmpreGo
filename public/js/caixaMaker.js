var liberar = true

function adicionarExp() {
    if(!liberar){
        return;
    }
    liberar = false
    const titulo = document.querySelector("#inputTitulo").value
    const imagem = document.querySelector("#imgPlaceholder").files[0];
    const descricao = document.querySelector("#caixaText").value

    
    if (titulo && descricao) {
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descricao', descricao);
        formData.append('imagem', imagem);

        fetch('/exps', {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao adicionar experiência');
            }

            alert('Experiência adicionada com sucesso!');
            window.location.href = './profile.html';
        })
        .catch(error => {
            console.error('Erro ao adicionar experiência:', error);
            alert(error.message);
            liberar = true;
        });
    } else {
        alert("A experiencia deve ter um título e uma descrição.");
    }


}