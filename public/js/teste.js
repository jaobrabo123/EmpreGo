import axiosWe from './axiosConfig.js';

document.querySelector('#sendFile').addEventListener('click', async()=>{
    const imagem = document.querySelector("#inputFile").files[0];
    const formData = new FormData();
    formData.append('file', imagem);
    formData.append('autor', "João Pedro Azevedo Freire");
    formData.append('chat', 39);
    formData.append('de', 'candidato');
    const response = await axiosWe.post('/mensagens/upload', formData);
    alert(`${response.data.newFile}`)
})

document.querySelector('#recieveFile').addEventListener('click', async()=>{
    const imagem = document.querySelector("#urlLink").value;
    axiosWe.download(imagem);
})