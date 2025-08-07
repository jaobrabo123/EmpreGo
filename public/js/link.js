import { carregarLinks, logout, axiosConfig } from "./globalFunctions.js";
axiosConfig(axios);

document.addEventListener('DOMContentLoaded', async () => {
  await carregarLinks(axios);
});

document.querySelector('#logout').addEventListener('click', () => logout(axios));