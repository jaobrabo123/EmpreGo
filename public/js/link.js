import { carregarLinks, logout } from "/js/globalFunctions.js";

document.addEventListener('DOMContentLoaded', async () => {
  await carregarLinks();
});

document.querySelector('#logout').addEventListener('click', () => logout());
document.querySelector('#mobileLogout')?.addEventListener('click', () => logout());