
var swiper = new Swiper(".home-slider", {
    loop: true, // Faz o slider girar continuamente
    spaceBetween: 30, // Espaçamento entre slides
    centeredSlides: true, // Centraliza os slides
    autoplay: {
        delay: 3000, // Tempo de troca entre imagens (3 segundos)
        disableOnInteraction: false, // Continua mesmo após interação do usuário
    },
    pagination: {
        el: ".swiper-pagination", // Ativa os bullets de navegação
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-next", // Botão próximo
        prevEl: ".swiper-prev", // Botão anterior
    },
  });
