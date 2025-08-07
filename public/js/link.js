import { carregarLinks, logout } from "/js/globalFunctions.js";

document.addEventListener('DOMContentLoaded', async () => {
  await carregarLinks(axios);
});

document.querySelector('#logout').addEventListener('click', () => logout(axios));