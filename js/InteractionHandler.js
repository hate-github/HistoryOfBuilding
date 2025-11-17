// Обработчик взаимодействий с 3D-сценой
class InteractionHandler {
    static setupPointClickHandler(sceneHandler, container, infoPanel) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onClick = (event) => {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, sceneHandler.camera);

            // Get all interactive points from the scene
            const points = sceneHandler.getInteractivePoints();

            const intersects = raycaster.intersectObjects(points, true);

            if (intersects.length > 0) {
                const point = intersects[0].object;
                this.handlePointClick(point, sceneHandler, infoPanel, container);
            }
        };

        container.addEventListener('click', onClick);

        // Return cleanup function
        return () => {
            container.removeEventListener('click', onClick);
        };
    }

    static handlePointClick(point, sceneHandler, infoPanel, container) {
        if (!infoPanel || !container) return;

        const sceneConfig = Config.scenes[sceneHandler.index];

        // Создаем всю структуру панели динамически
        infoPanel.innerHTML = `
            <div class="panel-header">
                <h3 class="panel-title"></h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="info-content">
                <p class="panel-description"></p>
                <div class="point-details">
                    <p><strong>Архитектурный стиль:</strong> ${sceneConfig.architecturalStyle}</p>
                    <p><strong>Период постройки:</strong> ${sceneConfig.constructionPeriod}</p>
                    <!--<p><strong>Координаты точки:</strong> x: ${point.position.x.toFixed(2)}, y: ${point.position.y.toFixed(2)}, z: ${point.position.z.toFixed(2)}</p>-->
                </div>
            </div>
        `;

        // Показываем панель и добавляем эффект затемнения сцены
        infoPanel.classList.add('active');
        container.classList.add('panel-active');

        // Анимируем текст в панели
        this.animatePanelText(infoPanel, point.userData.label, point.userData.info);

        // Назначаем обработчик для кнопки закрытия
        const closeBtn = infoPanel.querySelector('.close-btn');
        if (closeBtn) {
            const closeHandler = () => {
                this.closePanel(infoPanel, container);
            };
            closeBtn.addEventListener('click', closeHandler);
        }

        // Визуальная обратная связь - подсвечиваем точку
        sceneHandler.highlightPoint(point.userData.pointIndex, true);
        setTimeout(() => {
            sceneHandler.highlightPoint(point.userData.pointIndex, false);
        }, 1000);
    }

    static animatePanelText(panelElement, title, content) {
        const titleElement = panelElement.querySelector('.panel-title');
        const contentElement = panelElement.querySelector('.panel-description');

        if (!titleElement || !contentElement) return;

        // Очищаем содержимое
        titleElement.textContent = '';
        contentElement.textContent = '';

        // Анимируем заголовок быстро
        this.typeText(titleElement, title, 40, () => {
            // После завершения заголовка анимируем контент
            this.typeText(contentElement, content, 20);
        });
    }

    // Метод для анимации печатающегося текста
    static typeText(element, text, speed = 50, callback = null) {
        // Останавливаем предыдущую анимацию если есть
        if (this.currentTypingAnimation) {
            clearTimeout(this.currentTypingAnimation);
            this.currentTypingAnimation = null;
        }

        let index = 0;
        element.textContent = ''; // Очищаем элемент
        element.classList.add('typing-animation'); // Добавляем класс для стилизации

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
                element.classList.remove('typing-animation');
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

        // Убираем классы анимации со всех элементов
        document.querySelectorAll('.typing-animation').forEach(element => {
            element.classList.remove('typing-animation');
        });
    }

    // Альтернативный метод с эффектом курсора
    static typeTextWithCursor(element, text, speed = 50, callback = null) {
        // Останавливаем предыдущую анимацию
        if (this.currentTypingAnimation) {
            clearTimeout(this.currentTypingAnimation);
            this.currentTypingAnimation = null;
        }

        let index = 0;
        element.textContent = '';
        element.classList.add('typing-animation', 'typing-cursor');

        const typeNextChar = () => {
            if (index < text.length) {
                element.textContent = text.substring(0, index + 1);
                index++;

                this.currentTypingAnimation = setTimeout(typeNextChar, speed);
            } else {
                element.classList.remove('typing-animation', 'typing-cursor');
                this.currentTypingAnimation = null;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        };

        typeNextChar();
    }

    static closePanel(infoPanel, container) {
        // Останавливаем все анимации текста
        this.completeTyping();

        if (infoPanel) {
            infoPanel.classList.remove('active');
        }
        if (container) {
            container.classList.remove('panel-active');
        }
    }

    // Method to programmatically trigger point click (for testing)
    static simulatePointClick(sceneHandler, pointIndex, infoPanel, container) {
        const points = sceneHandler.getInteractivePoints();
        if (pointIndex >= 0 && pointIndex < points.length) {
            this.handlePointClick(points[pointIndex], sceneHandler, infoPanel, container);
        }
    }

    // Закрыть все открытые панели
    static closeAllPanels() {
        // Останавливаем все анимации текста
        this.completeTyping();

        document.querySelectorAll('.model-info-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelectorAll('.model-container').forEach(container => {
            container.classList.remove('panel-active');
        });
    }

    // Показать информационную панель с анимацией текста
    static showInfoPanel(pointData, sceneIndex) {
        const infoPanel = document.getElementById(`info-panel${sceneIndex + 1}`);
        const container = document.getElementById(`container${sceneIndex + 1}`);

        if (!infoPanel || !container) return;

        // Закрываем другие панели
        this.closeOtherPanels(sceneIndex);

        // Создаем структуру панели
        const sceneConfig = Config.scenes[sceneIndex];
        infoPanel.innerHTML = `
            <div class="panel-header">
                <h3 class="panel-title"></h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="info-content">
                <p class="panel-description"></p>
                <div class="point-details">
                    <p><strong>Архитектурный стиль:</strong> ${sceneConfig.architecturalStyle}</p>
                    <p><strong>Период постройки:</strong> ${sceneConfig.constructionPeriod}</p>
                </div>
            </div>
        `;

        // Показываем панель
        infoPanel.classList.add('active');
        container.classList.add('panel-active');

        // Анимируем текст
        this.animatePanelText(infoPanel, pointData.label, pointData.info);

        // Назначаем обработчик для кнопки закрытия
        const closeBtn = infoPanel.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePanel(infoPanel, container);
            });
        }

        // Подсвечиваем точку
        if (window.sceneManager && window.sceneManager.currentSceneHandler) {
            window.sceneManager.currentSceneHandler.highlightPoint(pointData.pointIndex, true);
        }

        console.log(`Showing info for point ${pointData.pointIndex} in scene ${sceneIndex}`);
    }

    // Закрыть другие панели (кроме указанной сцены)
    static closeOtherPanels(currentSceneIndex) {
        document.querySelectorAll('.model-info-panel').forEach((panel, index) => {
            if (index !== currentSceneIndex) {
                panel.classList.remove('active');
            }
        });

        document.querySelectorAll('.model-container').forEach((container, index) => {
            if (index !== currentSceneIndex) {
                container.classList.remove('panel-active');
            }
        });
    }

    // Переменная для хранения текущей анимации
    static currentTypingAnimation = null;
}

// Добавьте этот CSS в ваш файл стилей для эффектов анимации:
/*
.typing-animation {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    border-right: 2px solid transparent;
    animation: typing 0.5s step-end infinite;
}

.typing-cursor::after {
    content: '|';
    animation: blink 1s infinite;
    margin-left: 2px;
    color: currentColor;
}

@keyframes typing {
    from { border-right-color: currentColor; }
    to { border-right-color: transparent; }
}

@keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
}

.panel-title.typing-animation,
.panel-description.typing-animation {
    white-space: normal;
    word-wrap: break-word;
}

.panel-description.typing-animation {
    white-space: pre-wrap;
}
*/