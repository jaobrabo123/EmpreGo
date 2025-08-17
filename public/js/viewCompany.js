window.addEventListener('DOMContentLoaded', function () {
  // -------------- Menu Lateral --------------
  const menuBtn = document.getElementById('menu-toggle');
  const aside = document.querySelector('aside');
  const menuBack = document.getElementById('menu-back');

  function toggleSidebar(show) {
    if (show === undefined) {
      aside.classList.toggle('open');
    } else if (show) {
      aside.classList.add('open');
    } else {
      aside.classList.remove('open');
    }
    
    // Acessibilidade - atualiza o aria-expanded
    menuBtn.setAttribute('aria-expanded', aside.classList.contains('open'));
  }

  if (menuBtn && aside) {
    menuBtn.style.display = 'flex';
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleSidebar();
    });

    // Fecha o aside ao clicar fora dele
    document.addEventListener('click', function (e) {
      if (aside.classList.contains('open')) {
        if (!aside.contains(e.target) && e.target !== menuBtn && e.target !== menuBack) {
          toggleSidebar(false);
        }
      }
    });
    
    // Fecha o menu com a tecla ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && aside.classList.contains('open')) {
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

  // -------------- Perfil Dropdown --------------
  const profileToggle = document.querySelector('#profile-toggle');
  const profileDropdown = document.querySelector('#profile-dropdown');

  function toggleProfileDropdown(show) {
    if (show === undefined) {
      profileDropdown.classList.toggle('show');
    } else if (show) {
      profileDropdown.classList.add('show');
    } else {
      profileDropdown.classList.remove('show');
    }
    
    // Acessibilidade
    profileToggle.setAttribute('aria-expanded', profileDropdown.classList.contains('show'));
  }

  if (profileToggle && profileDropdown) {
    profileToggle.setAttribute('aria-haspopup', 'true');
    profileToggle.setAttribute('aria-expanded', 'false');
    
    profileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProfileDropdown();
    });

    profileDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', () => {
      toggleProfileDropdown(false);
    });
    
    // Fecha o menu ao clicar Esc
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && profileDropdown.classList.contains('show')) {
        toggleProfileDropdown(false);
      }
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
      if (e.key === 'Escape' && filterChipsContainer.classList.contains('open')) {
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
        
        // automaticamente clica no botão de confirmar após um breve delay (da para tirar o delay)
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

document.addEventListener('DOMContentLoaded', function() {
  setupCompanyChips();
});

  // -------------- Favoritos nos cartões de empresas --------------
  function setupFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Alterna a classe active
        this.classList.toggle('active');
        
        // Alterna o ícone
        const icon = this.querySelector('i');
        if (this.classList.contains('active')) {
          icon.className = 'bx bxs-star';
          this.setAttribute('aria-label', 'Desmarcar favorito');
        } else {
          icon.className = 'bx bx-star';
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

  // Adicione este script no final do body
    document.addEventListener('DOMContentLoaded', function() {
      // Swiper (código existente)
      const swiper = new Swiper('.recomendacoes-swiper', {
        // ... configurações existentes do swiper ...
      });

      // Novo código para os filtros com seta
      document.querySelectorAll('.filter-group legend').forEach(legend => {
        legend.addEventListener('click', (e) => {
          // Evita que o clique na setinha propague para o fieldset
          if (e.target.classList.contains('filter-toggle') || e.target.closest('.filter-toggle')) {
            return;
          }
          
          const fieldset = legend.closest('.filter-group');
          fieldset.classList.toggle('active');
          
          // Fecha os outros grupos quando um é aberto (opcional)
          if (fieldset.classList.contains('active')) {
            document.querySelectorAll('.filter-group').forEach(group => {
              if (group !== fieldset) {
                group.classList.remove('active');
              }
            });
          }
        });
      });

      // Adiciona evento de clique para a setinha
      document.querySelectorAll('.filter-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const fieldset = toggle.closest('.filter-group');
          fieldset.classList.toggle('active');
          
          if (fieldset.classList.contains('active')) {
            document.querySelectorAll('.filter-group').forEach(group => {
              if (group !== fieldset) {
                group.classList.remove('active');
              }
            });
          }
        });
      });
    });
  
  setupAnimations();
});