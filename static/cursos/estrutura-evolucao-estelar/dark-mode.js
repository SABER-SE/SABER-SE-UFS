(function () {
  var STORAGE_KEY = 'saberse-course-theme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    var btn = document.getElementById('saberse-theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️ Modo claro'
                                         : '🌙 Modo escuro';
    }
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // ignora se localStorage estiver indisponível
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.createElement('button');
    btn.id = 'saberse-theme-toggle';
    btn.setAttribute('aria-label', 'Alternar tema claro/escuro');
    document.body.appendChild(btn);

    var current = getStoredTheme() || 'light';
    applyTheme(current);

    btn.addEventListener('click', function () {
      current = document.body.classList.contains('dark-mode')
                ? 'light' : 'dark';
      applyTheme(current);
      storeTheme(current);
    });
  });
})();
