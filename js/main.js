// Основной файл инициализации
document.addEventListener('DOMContentLoaded', function () {
    // Инициализация менеджеров в правильном порядке
    window.themeManager = new ThemeManager();
    window.sceneManager = new SceneManager(); // Сначала создаем SceneManager
    UIManager.init(); // Затем инициализируем UI

    // Инициализация обработчиков прокрутки и клавиатуры
    //initScrollHandlers();
    initKeyboardHandlers();

    // Оптимизация: приостанавливаем рендеринг когда страница не видна
    setupVisibilityHandler();
});

//function initScrollHandlers() {
//    let scrollCount = 0;
//    const scrollThreshold = Config.interaction.scrollThreshold;
//    let scrollTimeout;
//    let isScrolling = false;

//    window.addEventListener('wheel', function (e) {
//        if (isScrolling) return;
//        e.preventDefault();

//        scrollCount += Math.abs(e.deltaY) > 0 ? 1 : 0;
//        UIManager.updateScrollProgress((scrollCount / scrollThreshold) * 100);

//        clearTimeout(scrollTimeout);
//        scrollTimeout = setTimeout(() => {
//            scrollCount = 0;
//            UIManager.updateScrollProgress(0);
//        }, 2000);

//        if (scrollCount >= scrollThreshold) {
//            isScrolling = true;

//            let newIndex = window.sceneManager.currentSceneIndex;
//            if (e.deltaY > 0) {
//                newIndex = Math.min(newIndex + 1, Config.scenes.length - 1);
//            } else {
//                newIndex = Math.max(newIndex - 1, 0);
//            }

//            if (newIndex !== window.sceneManager.currentSceneIndex) {
//                window.sceneManager.navigateToScene(newIndex);
//            }

//            scrollCount = 0;
//            UIManager.updateScrollProgress(0);

//            setTimeout(() => {
//                isScrolling = false;
//            }, 800);
//        }
//    }, { passive: false });
//}

function initKeyboardHandlers() {
    window.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const newIndex = Math.min(window.sceneManager.currentSceneIndex + 1, Config.scenes.length - 1);
            window.sceneManager.navigateToScene(newIndex);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const newIndex = Math.max(window.sceneManager.currentSceneIndex - 1, 0);
            window.sceneManager.navigateToScene(newIndex);
        } else if (e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const index = parseInt(e.key) - 1;
            if (index < Config.scenes.length) {
                window.sceneManager.navigateToScene(index);
            }
        } else if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            window.themeManager.toggleTheme();
        }
    });
}

// Дополнительная оптимизация: приостанавливаем рендеринг когда страница не видна
function setupVisibilityHandler() {
    document.addEventListener('visibilitychange', function () {
        if (window.sceneManager) {
            if (document.hidden) {
                // Страница скрыта - приостанавливаем все сцены
                window.sceneManager.setAllScenesActive(false);
            } else {
                // Страница снова видна - активируем только текущую сцену
                const currentHandler = window.sceneManager.getCurrentSceneHandler();
                if (currentHandler) {
                    currentHandler.setActive(true);
                }
            }
        }
    });
}