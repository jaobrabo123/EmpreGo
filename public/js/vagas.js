 document.addEventListener('DOMContentLoaded', function() {
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

      setupCompanyChips();

      // -------------- Favoritos nos cartões de empresas --------------
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