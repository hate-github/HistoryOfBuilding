// Управление пользовательским интерфейсом
class UIManager {
    static init() {
        this.setupNavigation();
        this.setupGlobalCloseHandlers();
        this.currentTypingAnimation = null; // Для хранения текущей анимации
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

        // Анимируем текст загрузки
        this.typeText(loadingText, randomFact, 30, () => {
            // После завершения печати можно добавить дополнительную логику
        });

        loadingScreen.classList.add('active');
    }

    static hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            // Останавливаем текущую анимацию если есть
            if (this.currentTypingAnimation) {
                clearTimeout(this.currentTypingAnimation);
                this.currentTypingAnimation = null;
            }
            loadingScreen.classList.remove('active');
        }
    }

    // Метод для анимации печатающегося текста
    static typeText(element, text, speed = 50, callback = null) {
        // Останавливаем предыдущую анимацию
        if (this.currentTypingAnimation) {
            clearTimeout(this.currentTypingAnimation);
            this.currentTypingAnimation = null;
        }

        let index = 0;
        element.textContent = ''; // Очищаем элемент

        // Функция для добавления следующего символа
        const typeNextChar = () => {
            if (index < text.length) {
                // Добавляем следующий символ
                element.textContent += text.charAt(index);
                index++;

                // Продолжаем анимацию
                this.currentTypingAnimation = setTimeout(typeNextChar, speed);
            } else {
                // Анимация завершена
                this.currentTypingAnimation = null;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        };

        // Запускаем анимацию
        typeNextChar();
    }

    // Метод для быстрого завершения текущей анимации
    static completeTyping() {
        if (this.currentTypingAnimation) {
            clearTimeout(this.currentTypingAnimation);
            this.currentTypingAnimation = null;
        }
    }

    // Метод для анимации текста в информационной панели
    static animateInfoPanelText(panelElement, title, content) {
        const titleElement = panelElement.querySelector('h3');
        const contentElement = panelElement.querySelector('p');

        if (!titleElement || !contentElement) return;

        // Очищаем содержимое
        titleElement.textContent = '';
        contentElement.textContent = '';

        // Анимируем заголовок быстро
        this.typeText(titleElement, title, 30, () => {
            // После завершения заголовка анимируем контент
            this.typeText(contentElement, content, 20);
        });
    }

    // Альтернативный метод с эффектом курсора
    static typeTextWithCursor(element, text, speed = 50, callback = null) {
        if (this.currentTypingAnimation) {
            clearTimeout(this.currentTypingAnimation);
            this.currentTypingAnimation = null;
        }

        let index = 0;
        element.textContent = '';
        element.classList.add('typing-cursor'); // Добавляем класс для курсора

        const typeNextChar = () => {
            if (index < text.length) {
                element.textContent = text.substring(0, index + 1);
                index++;

                this.currentTypingAnimation = setTimeout(typeNextChar, speed);
            } else {
                element.classList.remove('typing-cursor'); // Убираем курсор
                this.currentTypingAnimation = null;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        };

        typeNextChar();
    }
}

// Добавьте этот CSS в ваш файл стилей для эффекта курсора:
/*
.typing-cursor::after {
    content: '|';
    animation: blink 1s infinite;
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}
*/