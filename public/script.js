
// _________________________SWEPER/SLIDER_______________________
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
        clickable: true, // Torna a navegação por paginacao clicável
    },
    // Removido a navegação, pois você não quer as setas
});

// _________________________PERFIS AMOSTRA_______________________
document.querySelectorAll(".testperfis-item").forEach(item => { 
    item.addEventListener("click", function () {
        // Verifica se o item clicado já tem a classe "active"
        if (this.classList.contains("active")) {
            // Se já tem a classe "active", remove
            this.classList.remove("active");
        } else {
            // Caso contrário, adiciona a classe "active" ao item clicado
            document.querySelectorAll(".testperfis-item").forEach(el => el.classList.remove("active"));
            this.classList.add("active");
        }
    });
});

// _________________________MENU CELULAR_______________________
let menuIcon = document.querySelector('#menu-icon');
let links = document.querySelector('.links');
let sections = document.querySelectorAll('section');
let headerLinks = document.querySelectorAll('header .links a'); 

window.onscroll = () => {
    let top = window.scrollY;

    sections.forEach(sec => {
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id'); 

        if (top >= offset && top < offset + height) {
            headerLinks.forEach(link => {
                link.classList.remove('active');
                if (document.querySelector('header .links a[href*=' + id + ']')) {
                    document.querySelector('header .links a[href*=' + id + ']').classList.add('active');
                }
            });
        }
    });
};

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    links.classList.toggle('active');
};