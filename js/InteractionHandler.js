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
                <h3>${point.userData.label}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="info-content">
                <p>${point.userData.info}</p>
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

    static closePanel(infoPanel, container) {
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
        document.querySelectorAll('.model-info-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelectorAll('.model-container').forEach(container => {
            container.classList.remove('panel-active');
        });
    }
}