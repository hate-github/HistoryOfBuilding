// Управление пользовательским интерфейсом
class UIManager {
    static init() {
        this.setupNavigation();
        this.setupGlobalCloseHandlers();
    }

    static setupNavigation() {
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', function () {
                const target = this.getAttribute('data-target');
                const index = Config.scenes.findIndex(scene => scene.id === target);
                if (index !== -1 && window.sceneManager) { // ДОБАВЛЕНА ПРОВЕРКА
                    // Закрываем все панели при переходе между сценами
                    InteractionHandler.closeAllPanels();
                    window.sceneManager.navigateToScene(index);
                }
            });
        });
    }

    static setupGlobalCloseHandlers() {
        // Закрытие панели по клику вне ее области
        document.addEventListener('click', (event) => {
            const infoPanel = document.querySelector('.model-info-panel.active');
            if (infoPanel && !infoPanel.contains(event.target)) {
                // Проверяем, что клик был не по контейнеру сцены (точки обрабатываются отдельно)
                const isPointClick = event.target.closest('.model-container') &&
                    !event.target.closest('.model-info-panel');
                if (!isPointClick) {
                    InteractionHandler.closeAllPanels();
                }
            }
        });

        // Закрытие панели по нажатию Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                InteractionHandler.closeAllPanels();
            }
        });
    }

    static showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingText = document.getElementById('loadingText');
        if (!loadingScreen || !loadingText) return;

        const randomFact = Config.historicalFacts[Math.floor(Math.random() * Config.historicalFacts.length)];
        loadingText.textContent = randomFact;
        loadingScreen.classList.add('active');
    }

    static hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
    }

    static updateScrollProgress(progress) {
        const progressBar = document.getElementById('scrollProgressBar');
        const progressContainer = document.getElementById('scrollProgress');
        const scrollHint = document.getElementById('scrollHint');

        if (progressBar && progressContainer) {
            progressBar.style.width = `${progress}%`;

            if (progress > 0) {
                progressContainer.classList.add('active');
                if (scrollHint) scrollHint.classList.add('active');
            } else {
                progressContainer.classList.remove('active');
                if (scrollHint) scrollHint.classList.remove('active');
            }
        }
    }
}