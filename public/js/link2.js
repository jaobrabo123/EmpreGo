import { carregarLinks2, logout } from "/js/globalFunctions.js";

document.addEventListener('DOMContentLoaded', async () => {
  await carregarLinks2();
});

document.querySelector('#logoutButton').addEventListener('click', () => logout());