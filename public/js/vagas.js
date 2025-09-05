// * Importando nossa instância do axios
import axiosWe from './axiosConfig.js';

let empresasJaFavoritadas = [];

async function carregarInit() {
  try {
    const [responseEmp, responseFav] = await Promise.all([
      axiosWe('/empresas/public'),
      axiosWe('/favoritos/empresa')
    ]);
    const dataEmp = responseEmp.data;
    const dataFav = responseFav.data;
    const favoritosContainer = document.getElementById('favoritos-container');
    console.log(dataFav)
    dataFav.forEach(fav => {
      empresasJaFavoritadas.push(fav.cnpj_empresa);
      const newItem = document.createElement('div');
      newItem.className = 'favorito-item flex items-center gap-3 p-2';
      newItem.innerHTML = `
        <img src="${fav.empresas.foto}" alt="Logo ${fav.empresas.nome_fant}" class="favorito-logo w-10 h-10 rounded-full object-cover border border-gray-600 bg-white shadow-sm">
        <div class="favorito-info">
        <div class="favorito-nome">${fav.empresas.nome_fant}</div>
        <div class="favorito-categoria text-sm text-gray-400">${fav.empresas.setor}</div>
        </div>
        <div class="favorito-actions ml-auto">
        <button class="chat-btn" aria-label="Abrir chat">
          <i class='bx bx-message-rounded'></i>
        </button>
        </div>
      `;

      // Insere no container de favoritos
      favoritosContainer.appendChild(newItem);

      // chat
      newItem.querySelector('.chat-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        alert(`Iniciar chat com ${empresaNome}`);
      });
    })
    dataEmp.forEach(emp => {
      const html = `
        <article
          class="empresa-card bg-twitch-gray rounded-lg overflow-hidden shadow-md transition-all relative border border-gray-700 h-full flex flex-col hover:-translate-y-1 hover:shadow-lg hover:border-twitch-purple">
          <div
            class="card-header relative h-32 bg-gray-800 flex items-center justify-center overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-br before:from-twitch-purple/30 before:to-transparent">
            <img src="${emp.foto}" alt="Logo Tech Solutions"
              class="empresa-logo w-20 h-20 rounded-full object-cover border-4 border-gray-800 bg-white shadow-md z-10 transition-transform">
            <button
              id="${emp.cnpj}"
              class="favorite-btn absolute top-3 right-3 bg-black/40 border-none w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-gray-300 transition-all z-20 backdrop-blur-sm hover:bg-black/60 hover:scale-110 ${empresasJaFavoritadas.includes(emp.cnpj)?' active':""}"
              aria-label="Marcar como favorito">
              <i class='bx bx-star text-xl'></i>
            </button>
          </div>
          <div class="card-body p-5 flex-1">
            <h3 class="empresa-nome text-xl font-semibold mb-2 text-white">${emp.nome_fant}</h3>
            <p class="empresa-descricao text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
              ${emp.descricao?emp.descricao:''}
            </p>
          </div>
          <div
            class="card-footer flex justify-between items-center p-4 border-t border-gray-700 bg-black/10 flex-wrap gap-2">
            <div class="card-meta flex items-center gap-2 flex-1 min-w-[150px]">
              <div class="tag-chips flex flex-wrap gap-1">
                <span
                  class="tag-chip text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all">${emp.setor}</span>
                <span
                  class="tag-chip text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all">${emp.porte}</span>
                <span
                  class="tag-chip text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all">${emp.estado}</span>
              </div>
            </div>
            <button
              class="ver-mais-btn bg-twitch-purple btn-primary text-white border-none px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-twitch-lightpurple hover:-translate-y-0.5 hover:shadow">Ver
              mais</button>
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
        <article
          class="empresa-card bg-twitch-gray rounded-lg overflow-hidden shadow-md transition-all relative border border-gray-700 h-full flex flex-col hover:-translate-y-1 hover:shadow-lg hover:border-twitch-purple">
          <div
            class="card-header relative h-32 bg-gray-800 flex items-center justify-center overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-br before:from-twitch-purple/30 before:to-transparent">
            <img src="${emp.foto}" alt="Logo Tech Solutions"
              class="empresa-logo w-20 h-20 rounded-full object-cover border-4 border-gray-800 bg-white shadow-md z-10 transition-transform">
            <button
              id="${emp.cnpj}"
              class="favorite-btn absolute top-3 right-3 bg-black/40 border-none w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-gray-300 transition-all z-20 backdrop-blur-sm hover:bg-black/60 hover:scale-110 ${empresasJaFavoritadas.includes(emp.cnpj)?' active':""}"
              aria-label="Marcar como favorito">
              <i class='bx bx-star text-xl'></i>
            </button>
          </div>
          <div class="card-body p-5 flex-1">
            <h3 class="empresa-nome text-xl font-semibold mb-2 text-white">${emp.nome_fant}</h3>
            <p class="empresa-descricao text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
              ${emp.descricao?emp.descricao:''}
            </p>
          </div>
          <div
            class="card-footer flex justify-between items-center p-4 border-t border-gray-700 bg-black/10 flex-wrap gap-2">
            <div class="card-meta flex items-center gap-2 flex-1 min-w-[150px]">
              <div class="tag-chips flex flex-wrap gap-1">
                <span
                  class="tag-chip text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all">${emp.setor}</span>
                <span
                  class="tag-chip text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all">${emp.porte}</span>
                <span
                  class="tag-chip text-white px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all">${emp.estado}</span>
              </div>
            </div>
            <button
              class="ver-mais-btn bg-twitch-purple btn-primary text-white border-none px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all hover:bg-twitch-lightpurple hover:-translate-y-0.5 hover:shadow">Ver
              mais</button>
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
    btn.addEventListener('click', async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const empresaId = this.id;

      // Verifica limite antes de favoritar
      if (!this.classList.contains('active') && empresasJaFavoritadas.length >= 10) {
        alert("Você só pode favoritar no maximo 10 empresas!");
        return;
      }

      // Alterna a classe active
      this.classList.toggle('active');

      // Alterna o ícone e a cor
      const icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.className = 'bx bxs-star';
        this.style.color = '#fbbf24';
        this.setAttribute('aria-label', 'Desmarcar favorito');

        // Adiciona ao array
        empresasJaFavoritadas.push(empresaId);

        // Adiciona a empresa aos favoritos na sidebar
        await addToFavorites(this.closest('.empresa-card'), empresaId);
      } else {
        icon.className = 'bx bx-star';
        this.style.color = '';
        this.setAttribute('aria-label', 'Marcar como favorito');
        
        //Remove do Array 
        empresasJaFavoritadas = empresasJaFavoritadas.filter(emp => emp != empresaId)

        // Remove a empresa dos favoritos na sidebar
        await removeFromFavorites(this.closest('.empresa-card'), empresaId);
        
      }

      console.log(`Empresa ${this.classList.contains('active') ? 'adicionada aos' : 'removida dos'} favoritos: ${this.closest('.empresa-card').querySelector('.empresa-nome').textContent}`);
    });
  });
}


function setupCompanyChips() {
  const companyChips = document.querySelectorAll('.empresa-card .tag-chip');

  companyChips.forEach(chip => {
    chip.addEventListener('click', function (e) {
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

// Função para adicionar empresa aos favoritos na sidebar
async function addToFavorites(card, cnpj) {
  const empresaNome = card.querySelector('.empresa-nome').textContent;
  const empresaCategoria = card.querySelector('.tag-chip').textContent;
  const empresaLogo = card.querySelector('.empresa-logo')?.getAttribute('src') || '/assets/imgs/default-logo.png';

  const favoritosContainer = document.getElementById('favoritos-container');
  const existingItems = favoritosContainer.querySelectorAll('.favorito-item');

  // Verifica se já existe
  let alreadyExists = false;
  existingItems.forEach(item => {
    if (item.querySelector('.favorito-nome').textContent === empresaNome) {
      alreadyExists = true;
    }
  });
  if (alreadyExists) return;

  // Cria o item na sidebar
  const newItem = document.createElement('div');
  newItem.className = 'favorito-item flex items-center gap-3 p-2';
  newItem.innerHTML = `
    <img src="${empresaLogo}" alt="Logo ${empresaNome}" class="favorito-logo w-10 h-10 rounded-full object-cover border border-gray-600 bg-white shadow-sm">
    <div class="favorito-info">
      <div class="favorito-nome">${empresaNome}</div>
        <div class="favorito-categoria text-sm text-gray-400">${empresaCategoria}</div>
      </div>
      <div class="favorito-actions ml-auto">
        <button class="chat-btn" aria-label="Abrir chat">
      <i class='bx bx-message-rounded'></i>
    </button>
    </div>
  `;

  // Insere no container de favoritos
  favoritosContainer.appendChild(newItem);

  // chat
  newItem.querySelector('.chat-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    alert(`Iniciar chat com ${empresaNome}`);
  });

  try {
    await axiosWe.post('/favoritos/empresa', {cnpj});
  } catch (erro) {
    console.error("Erro ao favoritar empresa: ", erro);
  }
}

// Função para remover empresa dos favoritos
async function removeFromFavorites(card, cnpj) {
  const empresaNome = card.querySelector('.empresa-nome').textContent;
  const favoritosContainer = document.getElementById('favoritos-container');
  const existingItems = favoritosContainer.querySelectorAll('.favorito-item');

  existingItems.forEach(item => {
    if (item.querySelector('.favorito-nome').textContent === empresaNome) {
      item.remove();
    }
  });
  try {
    await axiosWe.delete(`/favoritos/empresa/${cnpj}`);
  } catch (erro) {
    console.error("Erro ao desfavoritar empresa: ", erro);
  }
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

        a11y: {
          prevSlideMessage: 'Slide anterior',
          nextSlideMessage: 'Próximo slide',
          paginationBulletMessage: 'Ir para slide {{index}}',
        },

        on: {
          mouseenter: function () {
            swiper.autoplay.stop();
          },
          mouseleave: function () {
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

        // Adicionar/remover classe para controlar o layout das empresas
        if (aside.classList.contains('sidebar-open')) {
          document.body.classList.remove('sidebar-closed');
        } else {
          document.body.classList.add('sidebar-closed');
        }

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

        document.addEventListener('keydown', function (e) {
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

        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && filterChipsContainer.classList.contains('open')) {
            toggleFilterPanel(false);
          }
        });
      }

      // Configuração dos chips 
      function setupFilterChips() {
        const chips = document.querySelectorAll('.filter-chip, .tag-chip');
        const confirmBtn = document.querySelector('.filter-confirm');
        const clearBtn = document.querySelector('.filter-clear');

        // Adiciona evento de clique para cada chip
        chips.forEach(chip => {
          chip.addEventListener('click', function () {
            const isPressed = this.getAttribute('aria-pressed') === 'true';
            this.setAttribute('aria-pressed', !isPressed);

            // Adiciona/remove classe visual
            this.classList.toggle('selected', !isPressed);
          });

          chip.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.click();
            }
          });
        });

        // Botão Confirmar - aplica os filtros selecionados
        if (confirmBtn) {
          confirmBtn.addEventListener('click', function () {
            const selectedChips = document.querySelectorAll('.filter-chip[aria-pressed="true"]');
            const selectedFilters = Array.from(selectedChips).map(chip => chip.dataset.value);

            // Mostra feedback visual dos filtros aplicados
            const filterCount = selectedFilters.length;
            const filterLabel = document.querySelector('.filter-label');
            if (filterLabel) {
              filterLabel.textContent = filterCount > 0 ? `Filtros (${filterCount})` : 'Filtragem';
            }

            console.log('Filtros selecionados:', selectedFilters);
            //@azevedo back
            // Aqui você pode adicionar a lógica para aplicar os filtros
            // Por exemplo: filtrarVagas(selectedFilters);

            // Fecha o painel de filtros
            toggleFilterPanel(false);
          });
        }

        // Botão Limpar - desmarca todos os chips
        if (clearBtn) {
          clearBtn.addEventListener('click', function () {
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

      // -------------- Favoritos nos cartões de empresas --------------
      setupCompanyChips();

      // -------------- Favoritos nos cartões de empresas --------------
      setupFavoriteButtons();

      // -------------- Animações de entrada --------------
      function setupAnimations() {
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
          // Fallback simples
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

      // -------------- Categorias de Filtros Expansíveis --------------
      function setupFilterCategories() {
        const categoryHeaders = document.querySelectorAll('.filter-category-header');

        categoryHeaders.forEach(header => {
          header.addEventListener('click', function () {
            const category = this.getAttribute('data-category');
            const content = document.getElementById(`category-${category}`);

            // Alterna a classe 'open' no conteúdo
            content.classList.toggle('open');

            // Alterna o ícone de seta
            const icon = this.querySelector('i');
            if (content.classList.contains('open')) {
              icon.className = 'bx bx-chevron-up text-sm';
            } else {
              icon.className = 'bx bx-chevron-down text-sm';
            }
          });
        });
      }

      setupFilterCategories();

      // -------------- Toggle dos Favoritos na Sidebar --------------
      const favoritosToggle = document.getElementById('favoritos-toggle');
      const favoritosContainer = document.getElementById('favoritos-container');

      if (favoritosToggle && favoritosContainer) {
        favoritosToggle.addEventListener('click', function () {
          favoritosContainer.classList.toggle('hidden');

          // Alterna o ícone de seta
          const icon = this.querySelector('.bx-chevron-down');
          if (favoritosContainer.classList.contains('hidden')) {
            icon.className = 'bx bx-chevron-down ml-auto';
          } else {
            icon.className = 'bx bx-chevron-up ml-auto';
          }
        });
      }
    });