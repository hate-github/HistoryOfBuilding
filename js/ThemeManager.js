class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themeToggle = document.getElementById('themeToggle');
        this.themeText = document.querySelector('.theme-text');
        this.themeIcon = document.getElementById('themeIcon');

        // Кэш для загруженных текстур
        this.skyboxCache = {
            dark: null,
            light: null
        };

        // Пути к текстурам skybox
        this.skyboxPaths = {
            dark: '/images/skybox/dark-skybox.png',
            light: '/images/skybox/light-skybox.png'
        };

        this.init();
    }

    init() {
        this.loadTheme();

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        this.applyTheme();
        this.updateButton();

        // Предзагрузка текстур
        this.preloadSkyboxes();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // Определяем тему по системным настройкам
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
        // Применяем тему к HTML документу
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Обновляем фон Three.js сцен
        this.updateThreeJSBackground();

        // Обновляем CSS переменные если нужно
        this.updateCSSVariables();
    }

    async preloadSkyboxes() {
        // Предзагрузка обеих текстур для быстрого переключения
        try {
            console.log('Preloading skybox textures...');
            await Promise.all([
                this.loadSkyboxTexture('dark'),
                this.loadSkyboxTexture('light')
            ]);
            console.log('Skybox textures preloaded successfully');
        } catch (error) {
            console.warn('Skybox preloading failed:', error);
        }
    }

    loadSkyboxTexture(theme) {
        return new Promise((resolve, reject) => {
            // Если текстура уже загружена, возвращаем её
            if (this.skyboxCache[theme]) {
                resolve(this.skyboxCache[theme]);
                return;
            }

            const texturePath = this.skyboxPaths[theme];

            // Проверяем существование пути
            if (!texturePath) {
                reject(new Error(`No skybox path defined for theme: ${theme}`));
                return;
            }

            const loader = new THREE.TextureLoader();
            loader.load(
                texturePath,
                (texture) => {
                    // Настройки текстуры для лучшего качества
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.encoding = THREE.sRGBEncoding;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;

                    // Кэшируем текстуру
                    this.skyboxCache[theme] = texture;
                    console.log(`Skybox texture loaded for ${theme} theme`);
                    resolve(texture);
                },
                // Прогресс загрузки
                (progress) => {
                    console.log(`Loading ${theme} skybox: ${Math.round((progress.loaded / progress.total) * 100)}%`);
                },
                // Ошибка загрузки
                (error) => {
                    console.error(`Failed to load ${theme} skybox:`, error);
                    reject(error);
                }
            );
        });
    }

    async updateThreeJSBackground() {
        try {
            const skyboxTexture = await this.loadSkyboxTexture(this.currentTheme);

            // Применяем текстуру ко всем сценам
            this.applySkyboxToAllScenes(skyboxTexture);

        } catch (error) {
            console.warn('Skybox texture loading failed, using fallback background color');
            // Fallback на цвет если текстура не загрузилась
            this.applyFallbackBackground();
        }
    }

    applySkyboxToAllScenes(skyboxTexture) {
        if (window.sceneManager && window.sceneManager.sceneHandlers) {
            window.sceneManager.sceneHandlers.forEach(handler => {
                if (handler && handler.scene) {
                    // Устанавливаем текстуру в skybox сцены
                    if (typeof handler.loadSkyboxTexture === 'function') {
                        handler.loadSkyboxTexture(skyboxTexture);
                    } else {
                        // Fallback для старых версий SceneHandler
                        handler.scene.background = skyboxTexture;
                    }

                    // Обновляем рендер если сцена активна
                    if (handler.isActive && handler.renderer) {
                        handler.renderer.render(handler.scene, handler.camera);
                    }
                }
            });
        }
    }

    applyFallbackBackground() {
        const fallbackColor = this.currentTheme === 'dark' ? 0x22333B : 0xC6AC8F;

        if (window.sceneManager && window.sceneManager.sceneHandlers) {
            window.sceneManager.sceneHandlers.forEach(handler => {
                if (handler && handler.scene) {
                    // Скрываем skybox и используем цветной фон
                    if (typeof handler.setSkyboxVisibility === 'function') {
                        handler.setSkyboxVisibility(false);
                    }
                    handler.scene.background = new THREE.Color(fallbackColor);

                    // Обновляем рендер если сцена активна
                    if (handler.isActive && handler.renderer) {
                        handler.renderer.render(handler.scene, handler.camera);
                    }
                }
            });
        }
    }

    updateCSSVariables() {
        // Обновляем CSS переменные если они используются
        const root = document.documentElement;

        if (this.currentTheme === 'dark') {
            root.style.setProperty('--bg-color', '#1a1a1a');
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--accent-color', '#4a90e2');
        } else {
            root.style.setProperty('--bg-color', '#ffffff');
            root.style.setProperty('--text-color', '#333333');
            root.style.setProperty('--accent-color', '#007acc');
        }
    }

    saveTheme() {
        localStorage.setItem('theme', this.currentTheme);
    }

    updateButton() {
        // Обновляем текст кнопки
        if (this.themeText) {
            this.themeText.textContent = this.currentTheme === 'dark'
                ? 'Темная тема'
                : 'Светлая тема';
        }

        // Обновляем иконку кнопки
        if (this.themeIcon) {
            this.themeIcon.src = this.currentTheme === 'dark'
                ? '/images/header/moon.svg'
                : '/images/header/sun.svg';
            this.themeIcon.alt = this.currentTheme === 'dark'
                ? 'Иконка луны'
                : 'Иконка солнца';

            // Добавляем атрибут для доступности
            this.themeIcon.setAttribute('aria-hidden', 'true');
        }

        // Обновляем aria-label для доступности
        if (this.themeToggle) {
            this.themeToggle.setAttribute('aria-label',
                this.currentTheme === 'dark'
                    ? 'Переключить на светлую тему'
                    : 'Переключить на темную тему'
            );
        }
    }

    // Публичные методы для внешнего использования
    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.currentTheme = theme;
            this.applyTheme();
            this.saveTheme();
            this.updateButton();
        } else {
            console.warn('Invalid theme specified. Use "dark" or "light".');
        }
    }

    // Метод для принудительной перезагрузки текстур
    async reloadSkyboxTextures() {
        console.log('Reloading skybox textures...');

        // Очищаем кэш
        this.skyboxCache.dark = null;
        this.skyboxCache.light = null;

        // Перезагружаем текстуры
        try {
            await this.preloadSkyboxes();
            // Применяем текущую тему с новыми текстурами
            await this.updateThreeJSBackground();
            console.log('Skybox textures reloaded successfully');
        } catch (error) {
            console.error('Failed to reload skybox textures:', error);
        }
    }

    // Метод для установки пользовательских путей к текстурам
    setSkyboxPaths(darkPath, lightPath) {
        if (darkPath) this.skyboxPaths.dark = darkPath;
        if (lightPath) this.skyboxPaths.light = lightPath;

        // Перезагружаем текстуры с новыми путями
        this.reloadSkyboxTextures();
    }

    // Метод для проверки поддержки тем браузером
    supportsThemes() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme)').matches;
    }

    // Подписка на изменения системной темы
    watchSystemTheme() {
        if (this.supportsThemes()) {
            window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    // Если пользователь не выбирал тему вручную, следуем системной
                    this.currentTheme = e.matches ? 'light' : 'dark';
                    this.applyTheme();
                    this.updateButton();
                }
            });
        }
    }

    // Деструктор для очистки ресурсов
    dispose() {
        // Очищаем текстуры из памяти
        if (this.skyboxCache.dark) {
            this.skyboxCache.dark.dispose();
            this.skyboxCache.dark = null;
        }
        if (this.skyboxCache.light) {
            this.skyboxCache.light.dispose();
            this.skyboxCache.light = null;
        }

        // Удаляем обработчики событий
        if (this.themeToggle) {
            this.themeToggle.removeEventListener('click', this.toggleTheme);
        }

        console.log('ThemeManager disposed');
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем наличие Three.js
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded. ThemeManager requires Three.js.');
        return;
    }

    // Создаем глобальный экземпляр ThemeManager
    window.themeManager = new ThemeManager();

    // Начинаем следить за изменениями системной темы
    window.themeManager.watchSystemTheme();

    // Добавляем обработчик ошибок для загрузки текстур
    window.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG' && e.target.src.includes('skybox')) {
            console.warn('Skybox image failed to load:', e.target.src);
        }
    });
});

// Экспорт для использования в модульных системах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}