// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';

async function carregarInit() {
  try {
    const response = await axiosWe('/empresas/public');
    const data = response.data;
    data.forEach(emp => {
    const html = `
      <article class="empresa-card bg-dark-800 rounded-lg overflow-hidden shadow-md transition-all relative border border-dark-700 h-full flex flex-col hover:-translate-y-1 hover:shadow-lg hover:border-primary-400">
        <div class="card-header relative h-32 bg-dark-700 flex items-center justify-center overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-br before:from-primary-800/30 before:to-transparent">
          <img src="${emp.foto}" alt="Logo da Empresa" class="empresa-logo w-20 h-20 rounded-full object-cover border-4 border-dark-800 bg-white shadow-md z-10 transition-transform">
          <button class="favorite-btn absolute top-3 right-3 bg-black/40 border-none w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-gray-300 transition-all z-20 backdrop-blur-sm hover:bg-black/60 hover:scale-110" aria-label="Marcar como favorito">
            <i class='bx bx-star text-xl'></i>
          </button>
        </div>
        <div class="card-body p-5 flex-1">
          <h3 class="empresa-nome text-xl font-semibold mb-2 text-white">${emp.nome_fant}</h3>
          <p class="empresa-descricao text-dark-400 text-sm mb-4 line-clamp-3 leading-relaxed">
            ${emp.descricao?emp.descricao:''}
          </p>
        </div>
        <div class="card-footer flex justify-between items-center p-4 border-t border-dark-700 bg-black/10 flex-wrap gap-2">
          <div class="card-meta flex items-center gap-2 flex-1 min-w-[150px]">
            <div class="tag-chips flex flex-wrap gap-1">
              <span class="tag-chip bg-primary-800 text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all hover:bg-primary-500">${emp.setor}</span>
              <span class="tag-chip bg-primary-800 text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all hover:bg-primary-500">${emp.porte}</span>
              <span class="tag-chip bg-primary-800 text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all hover:bg-primary-500">${emp.estado}</span>
            </div>
          </div>
          <button class="ver-mais-btn bg-primary-800 btn-primary text-white border-none px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-primary-500 hover:-translate-y-0.5 hover:shadow">Ver mais</button>
        </div>
      </article>
    `;
    document.querySelector('#divEmpresas').innerHTML += html;
  });
  } catch (erro) {
    console.error(erro)
  }
}

let pagina = 1;
let liberadoVerMais = true;
document.querySelector("#ver-pagina-btn").addEventListener("click", async() =>{
  if(!liberadoVerMais) return;
  try {
    pagina ++;
    liberadoVerMais = false;
    const response = await axiosWe(`/empresas/public?page=${pagina}`);
    const data = response.data;
    data.forEach(emp => {
      const html = `
        <article class="empresa-card bg-dark-800 rounded-lg overflow-hidden shadow-md transition-all relative border border-dark-700 h-full flex flex-col hover:-translate-y-1 hover:shadow-lg hover:border-primary-400">
          <div class="card-header relative h-32 bg-dark-700 flex items-center justify-center overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-br before:from-primary-800/30 before:to-transparent">
            <img src="${emp.foto}" alt="Logo da Empresa" class="empresa-logo w-20 h-20 rounded-full object-cover border-4 border-dark-800 bg-white shadow-md z-10 transition-transform">
            <button class="favorite-btn absolute top-3 right-3 bg-black/40 border-none w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-gray-300 transition-all z-20 backdrop-blur-sm hover:bg-black/60 hover:scale-110" aria-label="Marcar como favorito">
              <i class='bx bx-star text-xl'></i>
            </button>
          </div>
          <div class="card-body p-5 flex-1">
            <h3 class="empresa-nome text-xl font-semibold mb-2 text-white">${emp.nome_fant}</h3>
            <p class="empresa-descricao text-dark-400 text-sm mb-4 line-clamp-3 leading-relaxed">
              ${emp.descricao?emp.descricao:''}
            </p>
          </div>
          <div class="card-footer flex justify-between items-center p-4 border-t border-dark-700 bg-black/10 flex-wrap gap-2">
            <div class="card-meta flex items-center gap-2 flex-1 min-w-[150px]">
              <div class="tag-chips flex flex-wrap gap-1">
                <span class="tag-chip bg-primary-800 text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all hover:bg-primary-500">${emp.setor}</span>
                <span class="tag-chip bg-primary-800 text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all hover:bg-primary-500">${emp.porte}</span>
                <span class="tag-chip bg-primary-800 text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all hover:bg-primary-500">${emp.estado}</span>
              </div>
            </div>
            <button class="ver-mais-btn bg-primary-800 btn-primary text-white border-none px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-primary-500 hover:-translate-y-0.5 hover:shadow">Ver mais</button>
          </div>
        </article>
      `;
      document.querySelector('#divEmpresas').innerHTML += html;
    });
    if (data.length < 9){
      document.querySelector("#ver-pagina-btn").style.display = "none"
    }
    setupFavoriteButtons()
    setupCompanyChips()
  } catch (erro) {
    pagina--
    console.error(erro)
  } finally{
    liberadoVerMais = true;
  }
})
  
function setupFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  
  favoriteButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Alterna a classe active
      this.classList.toggle('active');
      
      // Alterna o ícone e a cor
      const icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.className = 'bx bxs-star';
        this.style.color = '#fbbf24'; // Amarelo
        this.setAttribute('aria-label', 'Desmarcar favorito');
      } else {
        icon.className = 'bx bx-star';
        this.style.color = ''; // Volta para a cor padrão
        this.setAttribute('aria-label', 'Marcar como favorito');
      }
      
      // para o futuro: adicionar a logica para favoritar
      const cardTitle = this.closest('.empresa-card').querySelector('.empresa-nome').textContent;
      console.log(`Empresa ${this.classList.contains('active') ? 'adicionada aos' : 'removida dos'} favoritos: ${cardTitle}`);
    });
  });
}

function setupCompanyChips() {
  // Seleciona todos os chips de empresa
  const companyChips = document.querySelectorAll('.empresa-card .tag-chip');
  
  companyChips.forEach(chip => {
    chip.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // adiciona efeito visual de clique
      this.classList.add('clicked');
      setTimeout(() => {
        this.classList.remove('clicked');
      }, 300);
      
      // obtém o valor do chip (texto dentro dele)
      const chipValue = this.innerText.trim();
      
      // Usa o valor do chip diretamente, sem processamento adicional
      const filterValue = chipValue;
      
      console.log(`Filtrando por: ${filterValue}`);
      
      // encontra o chip no painel de filtros
      const filterChips = document.querySelectorAll('.filter-chip');
      let matchingChip = null;
      
      filterChips.forEach(filterChip => {
        // compara o texto do chip ou o valor do atributo data-value
        const chipText = filterChip.innerText.trim();
        const chipDataValue = filterChip.getAttribute('data-value');
        
        if (chipText === filterValue || chipDataValue === filterValue.toLowerCase()) {
          matchingChip = filterChip;
        }
      });
      
      // se encontrou um chip correspondente, ele é selecionado
      if (matchingChip) {
        matchingChip.setAttribute('aria-pressed', 'true');
        matchingChip.classList.add('selected');
        
        // abre o painel de filtros
        const filterContainer = document.getElementById('filter-chips-container');
        if (filterContainer) {
          filterContainer.classList.add('open');
        }
        
        // Rola até o chip selecionado
        matchingChip.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // destaque do chip
        matchingChip.style.transform = 'scale(1.1)';
        setTimeout(() => {
          matchingChip.style.transform = '';
        }, 300);
        
        // automaticamente clica no botão de confirmar após um breve delay
        setTimeout(() => {
          const confirmBtn = document.querySelector('.filter-confirm');
          if (confirmBtn) {
            confirmBtn.click();
          }
        }, 800);
      } else {
        // Se não encontrou no filtro, podemos adicionar uma busca direta
        const searchBar = document.querySelector('.search-bar input');
        if (searchBar) {
          searchBar.value = filterValue;
          searchBar.dispatchEvent(new Event('input'));
          
          searchBar.focus();
          
          // efeito visual na barra de pesquisa
          searchBar.parentElement.classList.add('highlight');
          setTimeout(() => {
            searchBar.parentElement.classList.remove('highlight');
          }, 800);
        }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async function() {
      await carregarInit();
      // Inicialização do Swiper (mantido conforme original)
      const swiper = new Swiper('.recomendacoes-swiper', {
        loop: true,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        
        // Configurações de acessibilidade
        a11y: {
          prevSlideMessage: 'Slide anterior',
          nextSlideMessage: 'Próximo slide',
          paginationBulletMessage: 'Ir para slide {{index}}',
        },
        
        // Eventos
        on: {
          // Pausa o autoplay quando o mouse está sobre o slider
          mouseenter: function() {
            swiper.autoplay.stop();
          },
          // Retoma o autoplay quando o mouse sai do slider
          mouseleave: function() {
            swiper.autoplay.start();
          },
        }
      });

      // -------------- Menu Lateral --------------
      const menuBtn = document.getElementById('menu-toggle');
      const aside = document.getElementById('sidebar');
      const menuBack = document.getElementById('menu-back');

      function toggleSidebar(show) {
        if (show === undefined) {
          aside.classList.toggle('sidebar-open');
        } else if (show) {
          aside.classList.add('sidebar-open');
        } else {
          aside.classList.remove('sidebar-open');
        }
        
        // Acessibilidade - atualiza o aria-expanded
        menuBtn.setAttribute('aria-expanded', aside.classList.contains('sidebar-open'));
      }

      if (menuBtn && aside) {
        menuBtn.style.display = 'flex';
        menuBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleSidebar();
        });

        // Fecha o aside ao clicar fora dele
        document.addEventListener('click', function (e) {
          if (aside.classList.contains('sidebar-open')) {
            if (!aside.contains(e.target) && e.target !== menuBtn && e.target !== menuBack) {
              toggleSidebar(false);
            }
          }
        });
        
        // Fecha o menu com a tecla ESC
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && aside.classList.contains('sidebar-open')) {
            toggleSidebar(false);
          }
        });
      }

      // Botão de fechar menu na sidebar
      if (menuBack && aside) {
        menuBack.addEventListener('click', function (e) {
          toggleSidebar(false);
        });
      }

      
      // -------------- Filtro de Chips --------------
      const filterToggle = document.getElementById('filter-toggle');
      const filterChipsContainer = document.getElementById('filter-chips-container');

      function toggleFilterPanel(show) {
        if (show === undefined) {
          filterChipsContainer.classList.toggle('open');
        } else if (show) {
          filterChipsContainer.classList.add('open');
        } else {
          filterChipsContainer.classList.remove('open');
        }
        
        // Acessibilidade
        filterToggle.setAttribute('aria-expanded', filterChipsContainer.classList.contains('open'));
      }

      // Abre/fecha o painel de filtros
      if (filterToggle && filterChipsContainer) {
        filterToggle.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleFilterPanel();
        });

        // Fecha o painel ao clicar fora
        document.addEventListener('click', function (e) {
          if (filterChipsContainer.classList.contains('open')) {
            if (!filterChipsContainer.contains(e.target) && e.target !== filterToggle) {
              toggleFilterPanel(false);
            }
          }
        });
        
        // Fecha o menu ao clicar Esc
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Eescape' && filterChipsContainer.classList.contains('open')) {
            toggleFilterPanel(false);
          }
        });
      }

      // Configuração dos chips 
      function setupFilterChips() {
        const chips = document.querySelectorAll('.filter-chip');
        const confirmBtn = document.querySelector('.filter-confirm');
        const clearBtn = document.querySelector('.filter-clear');
        
        // Adiciona evento de clique para cada chip
        chips.forEach(chip => {
          chip.addEventListener('click', function() {
            // Alterna o estado aria-pressed
            const isPressed = this.getAttribute('aria-pressed') === 'true';
            this.setAttribute('aria-pressed', !isPressed);
            
            // Adiciona/remove classe visual
            this.classList.toggle('selected', !isPressed);
          });
          
          // Adiciona suporte a teclado
          chip.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.click();
            }
          });
        });
        
        // Botão Confirmar - aplica os filtros selecionados
        if (confirmBtn) {
          confirmBtn.addEventListener('click', function() {
            const selectedChips = document.querySelectorAll('.filter-chip[aria-pressed="true"]');
            const selectedFilters = Array.from(selectedChips).map(chip => chip.dataset.value);
            
            // Mostra feedback visual dos filtros aplicados
            const filterCount = selectedFilters.length;
            const filterLabel = document.querySelector('.filter-label');
            if (filterLabel) {
              filterLabel.textContent = filterCount > 0 ? `Filtros (${filterCount})` : 'Filtragem';
            }
            
            console.log('Filtros selecionados:', selectedFilters);
            // Aqui você pode adicionar a lógica para aplicar os filtros
            // Por exemplo: filtrarVagas(selectedFilters);
            
            // Fecha o painel de filtros
            toggleFilterPanel(false);
          });
        }
        
        // Botão Limpar - desmarca todos os chips
        if (clearBtn) {
          clearBtn.addEventListener('click', function() {
            chips.forEach(chip => {
              chip.setAttribute('aria-pressed', 'false');
              chip.classList.remove('selected');
            });
            
            // Atualiza o contador de filtros
            const filterLabel = document.querySelector('.filter-label');
            if (filterLabel) {
              filterLabel.textContent = 'Filtragem';
            }
            
            console.log('Filtros limpos');
          });
        }
      }

      setupFilterChips();
      
      // -------------- Filtro de Chips/tags/empresa --------------
      setupCompanyChips();

      // -------------- Favoritos nos cartões de empresas --------------      
      setupFavoriteButtons();
      
      // -------------- Animações de entrada --------------
      function setupAnimations() {
        // Anima os cartões de empresas com efeito de entrada
        const empresaCards = document.querySelectorAll('.empresa-card');
        
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
              }
            });
          }, {
            threshold: 0.1
          });
          
          empresaCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.transitionDelay = `${index * 0.1}s`;
            
            observer.observe(card);
          });
        } else {
          // Fallback para navegadores que não suportam IntersectionObserver
          empresaCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        }
      }
      
      setupAnimations();

      // -------------- JavaScript para o perfil dropdown --------------
      const profileToggleElement = document.getElementById('profile-toggle');
      const profileDropdownElement = document.getElementById('profile-dropdown');

      if (profileToggleElement && profileDropdownElement) {
        // Remove a classe 'hidden' inicial e usa display: none via CSS
        profileDropdownElement.classList.remove('hidden');
        
        profileToggleElement.addEventListener('click', (e) => {
          e.stopPropagation();
          if (profileDropdownElement.style.display === 'flex') {
            profileDropdownElement.style.display = 'none';
          } else {
            profileDropdownElement.style.display = 'flex';
          }
        });

        // Fecha o dropdown ao clicar fora
        document.addEventListener('click', (e) => {
          if (!profileToggleElement.contains(e.target) && !profileDropdownElement.contains(e.target)) {
            profileDropdownElement.style.display = 'none';
          }
        });

        // Fecha o dropdown com a tecla ESC
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && profileDropdownElement.style.display === 'flex') {
            profileDropdownElement.style.display = 'none';
          }
        });
      }
    });