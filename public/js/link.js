import { carregarLinks, logout } from "./globalFunctions.js";

document.addEventListener('DOMContentLoaded', () => {
  carregarLinks();
});

document.querySelector('#logout').addEventListener('click', logout)