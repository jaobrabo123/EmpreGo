import { carregarLinks, logout } from "./globalFunctions.js";

document.addEventListener('DOMContentLoaded', async () => {
  await carregarLinks();
});

document.querySelector('#logout').addEventListener('click', logout);