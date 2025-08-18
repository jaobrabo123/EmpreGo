        document.addEventListener('DOMContentLoaded', function() {
            if (document.getElementById('particles-js')) {
                particlesJS('particles-js', {
                    "particles": {
                        "number": {
                            "value": 80,
                            "density": {
                                "enable": true,
                                "value_area": 800
                            }
                        },
                        "color": {
                            "value": "#8B5CF6"
                        },
                        "shape": {
                            "type": "circle",
                            "stroke": {
                                "width": 0,
                                "color": "#000000"
                            },
                            "polygon": {
                                "nb_sides": 5
                            }
                        },
                        "opacity": {
                            "value": 0.3,
                            "random": true,
                            "anim": {
                                "enable": true,
                                "speed": 1,
                                "opacity_min": 0.1,
                                "sync": false
                            }
                        },
                        "size": {
                            "value": 3,
                            "random": true,
                            "anim": {
                                "enable": false,
                                "speed": 40,
                                "size_min": 0.1,
                                "sync": false
                            }
                        },
                        "line_linked": {
                            "enable": true,
                            "distance": 150,
                            "color": "#8B5CF6",
                            "opacity": 0.2,
                            "width": 1
                        },
                        "move": {
                            "enable": true,
                            "speed": 1,
                            "direction": "none",
                            "random": true,
                            "straight": false,
                            "out_mode": "out",
                            "bounce": false,
                            "attract": {
                                "enable": false,
                                "rotateX": 600,
                                "rotateY": 1200
                            }
                        }
                    },
                    "interactivity": {
                        "detect_on": "canvas",
                        "events": {
                            "onhover": {
                                "enable": true,
                                "mode": "grab"
                            },
                            "onclick": {
                                "enable": true,
                                "mode": "push"
                            },
                            "resize": true
                        },
                        "modes": {
                            "grab": {
                                "distance": 140,
                                "line_linked": {
                                    "opacity": 0.5
                                }
                            },
                            "bubble": {
                                "distance": 400,
                                "size": 40,
                                "duration": 2,
                                "opacity": 8,
                                "speed": 3
                            },
                            "repulse": {
                                "distance": 200,
                                "duration": 0.4
                            },
                            "push": {
                                "particles_nb": 4
                            },
                            "remove": {
                                "particles_nb": 2
                            }
                        }
                    },
                    "retina_detect": true
                });
            }
        });

        // Menu do celular
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // botão de sair do menu
        const backToTopButton = document.getElementById('back-to-top');
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // sair e abrir menu celular
                    if (!mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            });
        });
        
        // Efeito de glitch 
        const logoContainer = document.getElementById('logo-container');
        let isGlitching = false;
        
        logoContainer.addEventListener('mouseenter', () => {
            if (isGlitching) return;
            isGlitching = true;
            
            // animação
            logoContainer.classList.add('animate-text-glitch');
            
            setTimeout(() => {
                logoContainer.classList.add('text-glitch-active');
            }, 100);
            
            setTimeout(() => {
                logoContainer.classList.remove('animate-text-glitch', 'text-glitch-active');
                isGlitching = false;
            }, 1000);
        });
        
        // inicio da animação
        document.addEventListener('DOMContentLoaded', () => {
            anime({
                targets: '#hero-content',
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 1000,
                easing: 'easeOutExpo'
            });
            
            anime({
                targets: '#hero-image',
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 1000,
                delay: 300,
                easing: 'easeOutExpo'
            });
            
            anime({
                targets: '#hero-title span',
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                delay: 500,
                easing: 'easeOutExpo'
            });
            
            const servicesObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: '#services-header',
                            opacity: [0, 1],
                            translateY: [40, 0],
                            duration: 800,
                            easing: 'easeOutExpo'
                        });
                        
                        anime({
                            targets: '#timeline-container',
                            opacity: [0, 1],
                            duration: 800,
                            delay: 300,
                            easing: 'easeOutExpo'
                        });
                        
                        anime({
                            targets: '.timeline-item',
                            opacity: [0, 1],
                            translateX: (el, i) => (i % 2 === 0 ? [-50, 0] : [50, 0]),
                            duration: 800,
                            delay: (el, i) => 500 + (i * 200),
                            easing: 'easeOutExpo'
                        });
                        
                        servicesObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            servicesObserver.observe(document.querySelector('#servicos'));
            
            const profilesObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: '#profiles-header',
                            opacity: [0, 1],
                            translateY: [40, 0],
                            duration: 800,
                            easing: 'easeOutExpo'
                        });
                        
                        anime({
                            targets: '.profile-card',
                            opacity: [0, 1],
                            translateY: [40, 0],
                            duration: 800,
                            delay: (el) => parseInt(el.dataset.delay),
                            easing: 'easeOutExpo'
                        });
                        
                        anime({
                            targets: '#profiles-cta',
                            opacity: [0, 1],
                            translateY: [40, 0],
                            duration: 800,
                            delay: 1000,
                            easing: 'easeOutExpo'
                        });
                        
                        profilesObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            profilesObserver.observe(document.querySelector('#testperfis'));
        });

        const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particlesArray;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Partícula
class Particle {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.baseX = x;
    this.baseY = y;
    this.density = Math.random() * 30 + 1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update(mouse) {
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 120) {
      this.x -= dx / this.density;
      this.y -= dy / this.density;
    } else {
      // volta ao lugar original
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
    }
    this.draw();
  }
}

// Cria partículas
function init() {
  particlesArray = [];
  let numberOfParticles = 150;
  for (let i = 0; i < numberOfParticles; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    let size = Math.random() * 3 + 1;
    let color = `rgba(168, 85, 247, 0.6)`; // roxo neon
    particlesArray.push(new Particle(x, y, size, color));
  }
}

// Mouse
const mouse = { x: null, y: null };
window.addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

// Animação
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update(mouse);
  }
  requestAnimationFrame(animate);
}

// Resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

init();
animate();

// Perfil de usuario (PC/CELL)

function setUserLoggedIn(user) {
    document.getElementById('loginOuCadas').style.display = 'none';
    document.getElementById('fotoPerfil').style.display = 'inline-block';
    document.getElementById('logout').style.display = 'inline-block';
    document.getElementById('fotoPerfilImg').src = user.avatarUrl || '/assets/imgs/genPfp.png';


    document.getElementById('mobileLoginOuCadas').style.display = 'none';
    document.getElementById('mobileFotoPerfil').style.display = 'block';
    document.getElementById('mobileLogout').style.display = 'block';
    document.getElementById('mobileFotoPerfilImg').src = user.avatarUrl || '/assets/imgs/genPfp.png';
}

function logout() {
    document.getElementById('loginOuCadas').style.display = 'inline-flex';
    document.getElementById('fotoPerfil').style.display = 'none';
    document.getElementById('logout').style.display = 'none';

    document.getElementById('mobileLoginOuCadas').style.display = 'block';
    document.getElementById('mobileFotoPerfil').style.display = 'none';
    document.getElementById('mobileLogout').style.display = 'none';
}


