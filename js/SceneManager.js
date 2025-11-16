// Менеджер сцен и навигации
class SceneManager {
    constructor() {
        this.scenes = [];
        this.currentSceneIndex = 0;
        this.sceneHandlers = [];
        this.animationId = null;
        this.clickCleanupFunctions = [];

        this.init();
    }

    init() {
        this.createSceneHandlers();
        this.setupEventListeners();

        // Scroll to first scene
        setTimeout(() => {
            this.navigateToScene(0);
        }, 100);
    }

    createSceneHandlers() {
        Config.scenes.forEach((sceneConfig, index) => {
            const container = document.getElementById(sceneConfig.container);
            if (!container) {
                console.error(`Container ${sceneConfig.container} not found`);
                return;
            }

            const sceneHandler = new SceneHandler(sceneConfig, index);
            sceneHandler.init(container);

            // Setup interaction for this scene
            const infoPanel = document.getElementById(sceneConfig.infoPanel);
            if (infoPanel) {
                const cleanup = InteractionHandler.setupPointClickHandler(
                    sceneHandler,
                    container,
                    infoPanel
                );
                this.clickCleanupFunctions[index] = cleanup;
            }

            this.sceneHandlers[index] = sceneHandler;
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.sceneHandlers.forEach(handler => {
            if (handler && handler.isInitialized) {
                handler.onResize();
            }
        });
    }

    async navigateToScene(index) {
        if (index < 0 || index >= this.sceneHandlers.length) return;

        console.log(`Navigating to scene ${index}`);

        // Деактивируем предыдущую сцену
        if (this.sceneHandlers[this.currentSceneIndex]) {
            this.sceneHandlers[this.currentSceneIndex].setActive(false);
        }

        // Закрываем все информационные панели при переходе
        InteractionHandler.closeAllPanels();

        // Show loading screen
        UIManager.showLoadingScreen();

        // Update navigation
        this.updateNavigation(index);

        this.currentSceneIndex = index;

        // Scroll to target section
        const targetSection = document.getElementById(Config.scenes[index].id);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Load model if not already loaded
        const currentHandler = this.sceneHandlers[index];
        if (currentHandler && !currentHandler.model) {
            await currentHandler.loadModel();
        }

        // Update zoom constraints
        if (currentHandler) {
            currentHandler.updateZoomConstraints();
        }

        // Активируем новую сцену
        if (currentHandler) {
            currentHandler.setActive(true);
        }

        // Log points information for debugging
        this.logScenePointsInfo(index);

        // Hide loading screen
        setTimeout(() => {
            UIManager.hideLoadingScreen();
        }, 1500);
    }

    updateNavigation(index) {
        document.querySelectorAll('.nav-button').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    }

    logScenePointsInfo(sceneIndex) {
        const handler = this.sceneHandlers[sceneIndex];
        if (handler) {
            const points = handler.getInteractivePoints();
            console.log(`Scene ${sceneIndex} has ${points.length} interactive points`);
        }
    }

    // Method to get current scene handler
    getCurrentSceneHandler() {
        return this.sceneHandlers[this.currentSceneIndex];
    }

    // Method to get specific scene handler
    getSceneHandler(index) {
        return this.sceneHandlers[index];
    }

    // Method to activate/deactivate all scenes (for performance)
    setAllScenesActive(active) {
        this.sceneHandlers.forEach(handler => {
            if (handler) {
                handler.setActive(active);
            }
        });
    }

    dispose() {
        // Деактивируем все сцены перед удалением
        this.setAllScenesActive(false);

        // Cleanup click listeners
        this.clickCleanupFunctions.forEach(cleanup => {
            if (cleanup) cleanup();
        });

        // Dispose scene handlers
        this.sceneHandlers.forEach(handler => {
            if (handler) {
                handler.dispose();
            }
        });
    }
}