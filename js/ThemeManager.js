class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themeToggle = document.getElementById('themeToggle');
        this.themeText = document.querySelector('.theme-text');
        this.themeIcon = document.getElementById('themeIcon'); // добавили ссылку на <img>

        this.init();
    }

    init() {
        this.loadTheme();

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        this.applyTheme();
        this.updateButton(); // сразу обновляем иконку и текст
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                this.currentTheme = 'light';
            }
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveTheme();
        this.updateButton();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThreeJSBackground();
    }

    updateThreeJSBackground() {
        const backgroundColor = this.currentTheme === 'dark' ? 0x22333B : 0xC6AC8F;

        if (window.sceneManager && window.sceneManager.sceneHandlers) {
            window.sceneManager.sceneHandlers.forEach(handler => {
                if (handler && handler.scene) {
                    handler.scene.background = new THREE.Color(backgroundColor);

                    if (handler.isActive && handler.renderer) {
                        handler.renderer.render(handler.scene, handler.camera);
                    }
                }
            });
        }
    }

    saveTheme() {
        localStorage.setItem('theme', this.currentTheme);
    }

    updateButton() {
        if (this.themeText) {
            this.themeText.textContent = this.currentTheme === 'dark'
                ? 'Темная тема'
                : 'Светлая тема';
        }
        if (this.themeIcon) {
            this.themeIcon.src = this.currentTheme === 'dark'
                ? '/images/header/moon.svg'
                : '/images/header/sun.svg';
            this.themeIcon.alt = this.currentTheme === 'dark'
                ? 'Солнце'
                : 'Луна';
        }
    }


    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.currentTheme = theme;
            this.applyTheme();
            this.saveTheme();
            this.updateButton();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});
