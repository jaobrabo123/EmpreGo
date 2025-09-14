import { carregarLinks, logout, finalizarLoader } from "/js/globalFunctions.js";

document.addEventListener('DOMContentLoaded', async () => {
  await carregarLinks();
  finalizarLoader();
});

document.querySelector('#logout').addEventListener('click', () => logout());
document.querySelector('#mobileLogout')?.addEventListener('click', () => logout());