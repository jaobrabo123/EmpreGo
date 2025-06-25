var liberar = true

function adicionarExp() {
    if(!liberar){
        return;
    }
    liberar = false
    const titulo_exp = document.querySelector("#inputTitulo").value
    const img_exp = document.querySelector("#imgPlaceholder").files[0];
    const descricao_exp = document.querySelector("#caixaText").value

    
    if (titulo_exp && descricao_exp) {
        const formData = new FormData();
        formData.append('titulo_exp', titulo_exp);
        formData.append('descricao_exp', descricao_exp);
        formData.append('img_exp', img_exp);

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