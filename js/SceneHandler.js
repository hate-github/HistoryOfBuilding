// Обработчик отдельной 3D-сцены
class SceneHandler {
    constructor(sceneConfig, index) {
        this.sceneConfig = sceneConfig;
        this.index = index;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.pointsGroup = null;
        this.interactivePoints = [];

        this.initialCameraPosition = null;
        this.isInitialized = false;
        this.modelInfo = null;
        this.isActive = false;
        this.animationId = null;
    }

    init(containerElement) {
        if (this.isInitialized) return;

        this.container = containerElement;
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.setupLighting();

        this.initialCameraPosition = {
            position: this.camera.position.clone(),
            target: this.controls.target.clone()
        };

        this.isInitialized = true;
        return this;
    }

    createScene() {
        this.scene = new THREE.Scene();
        // Используем цвет из конфигурации, который потом обновится через ThemeManager
        this.scene.background = new THREE.Color(Config.threeJS.backgroundColor);
    }

    createCamera() {
        const { fov, near, far, initialPosition } = Config.threeJS.camera;

        // Проверяем существование initialPosition и используем значения по умолчанию если нужно
        const posX = initialPosition && initialPosition.x !== undefined ? initialPosition.x : 15;
        const posY = initialPosition && initialPosition.y !== undefined ? initialPosition.y : 15;
        const posZ = initialPosition && initialPosition.z !== undefined ? initialPosition.z : 15;

        this.camera = new THREE.PerspectiveCamera(
            fov,
            this.container.clientWidth / this.container.clientHeight,
            near,
            far
        );

        this.camera.position.set(posX, posY, posZ);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            precision: 'highp',
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.container.appendChild(this.renderer.domElement);
    }

    createControls() {
        const { damping, minDistance, maxDistance, zoomSpeed } = Config.threeJS.controls;
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = damping;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = minDistance;
        this.controls.maxDistance = maxDistance;
        this.controls.zoomSpeed = zoomSpeed;
        this.controls.maxPolarAngle = Math.PI;

        // Отключаем управление когда сцена неактивна
        this.controls.enabled = false;
    }

    setupLighting() {
        const { ambient, directional } = Config.threeJS.lighting;

        // Ambient light
        const ambientLight = new THREE.AmbientLight(ambient.color, ambient.intensity);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(
            directional.color,
            directional.intensity
        );
        directionalLight.position.set(
            directional.position.x,
            directional.position.y,
            directional.position.z
        );
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;

        // Увеличиваем дальность теней
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = directional.shadowCameraFar;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;

        this.scene.add(directionalLight);

        // Дополнительный свет для заполнения
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-20, 10, -10);
        this.scene.add(fillLight);
    }

    async loadModel() {
        try {
            const model = await ModelLoader.loadModel(this.sceneConfig.modelPath);
            this.setupModel(model);
            return model;
        } catch (error) {
            console.error(`Failed to load model for scene ${this.index}:`, error);
            return this.createFallbackModel();
        }
    }

    setupModel(model) {
        if (this.model) {
            this.scene.remove(this.model);
            ModelLoader.cleanupModel(this.model);
        }

        this.model = model;
        this.scene.add(model);

        // Setup materials and shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (!child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x888888,
                        roughness: 0.7,
                        metalness: 0.2
                    });
                }

                // Увеличиваем дальность прорисовки для каждого меша
                if (child.geometry) {
                    child.frustumCulled = false;
                }
            }
        });

        // Center and scale model - используем centerAndScaleModel как fallback
        try {
            // Пытаемся использовать normalizeModelSize
            if (ModelLoader.normalizeModelSize) {
                this.modelInfo = ModelLoader.normalizeModelSize(model);
            } else {
                // Fallback на centerAndScaleModel
                this.modelInfo = ModelLoader.centerAndScaleModel(model);
            }
        } catch (error) {
            console.error('Error scaling model, using fallback:', error);
            // Fallback на базовое масштабирование
            this.modelInfo = {
                scaledSize: new THREE.Vector3(10, 10, 10),
                originalSize: new THREE.Vector3(10, 10, 10),
                scaleFactor: 1
            };
        }

        // Update camera based on model size
        this.updateCameraForModel();

        // Add interactive points specific to this scene
        this.addInteractivePoints();

        console.log(`Model ${this.index + 1} setup complete:`, this.modelInfo);

        return model;
    }

    updateCameraForModel() {
        if (!this.model) return;

        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Автоматическая настройка камеры в зависимости от размера модели
        const cameraDistance = Math.max((maxDim -300) * 0.5, 10);

        // Плавное перемещение камеры к новой позиции
        if (this.initialCameraPosition) {
            const adaptivePosition = this.initialCameraPosition.position.clone().normalize().multiplyScalar(cameraDistance);
            this.camera.position.copy(adaptivePosition);
        } else {
            this.camera.position.set(cameraDistance, cameraDistance * 0.3, cameraDistance);
        }

        // Настраиваем контролы с учетом размера модели
        this.controls.minDistance = Math.max(maxDim * 0.2, 1);
        this.controls.maxDistance = Math.max(maxDim * 8, 100);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        // Update initial camera position
        this.initialCameraPosition = {
            position: this.camera.position.clone(),
            target: this.controls.target.clone()
        };
    }

    createFallbackModel() {
        const geometry = new THREE.BoxGeometry(8, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: Config.getFallbackColor(this.index),
            transparent: true,
            opacity: 0.8
        });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
        this.model = cube;

        this.modelInfo = {
            scaledSize: new THREE.Vector3(8, 8, 8),
            originalSize: new THREE.Vector3(8, 8, 8),
            scaleFactor: 1
        };

        return cube;
    }

    addInteractivePoints() {
        // Remove existing points group if it exists
        if (this.pointsGroup) {
            this.scene.remove(this.pointsGroup);
            this.pointsGroup = null;
        }

        // Clear interactive points array
        this.interactivePoints = [];

        // Get points configuration for this specific scene
        const scenePoints = Config.getPointsForScene(this.index);

        if (!scenePoints || scenePoints.length === 0) {
            console.warn(`No points configured for scene ${this.index}`);
            return;
        }

        console.log(`Creating ${scenePoints.length} interactive points for scene ${this.index}`);

        // Create new points group
        this.pointsGroup = new THREE.Group();
        this.scene.add(this.pointsGroup);

        // Create each interactive point
        scenePoints.forEach((pointConfig, index) => {
            const point = this.createInteractivePoint(pointConfig, index);
            if (point) {
                this.pointsGroup.add(point);
                this.interactivePoints.push(point);
            }
        });

        this.updatePointsPosition();
    }

    createInteractivePoint(pointConfig, pointIndex) {
        try {
            const { position, label, info } = pointConfig;

            const geometry = new THREE.SphereGeometry(Config.interaction.pointSize, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: Config.interaction.pointColor,
                transparent: true,
                opacity: 0.9,
                depthTest: false
            });

            const pointMesh = new THREE.Mesh(geometry, material);

            pointMesh.position.set(
                position.x,
                position.y,
                position.z
            );

            pointMesh.userData = {
                label: label,
                info: info,
                isPoint: true,
                pointIndex: pointIndex,
                sceneIndex: this.index,
                originalColor: Config.interaction.pointColor
            };

            pointMesh.frustumCulled = false;

            return pointMesh;
        } catch (error) {
            console.error(`Error creating interactive point ${pointIndex} for scene ${this.index}:`, error);
            return null;
        }
    }

    updatePointsPosition() {
        if (this.pointsGroup && this.model) {
            this.pointsGroup.position.copy(this.model.position);
            this.pointsGroup.rotation.copy(this.model.rotation);
            this.pointsGroup.scale.copy(this.model.scale);
        }
    }

    getInteractivePoints() {
        return this.interactivePoints;
    }

    highlightPoint(pointIndex, highlight = true) {
        if (pointIndex >= 0 && pointIndex < this.interactivePoints.length) {
            const point = this.interactivePoints[pointIndex];
            if (point && point.material) {
                point.material.color.setHex(
                    highlight ? Config.interaction.highlightColor : point.userData.originalColor
                );
            }
        }
    }

    resetCamera() {
        if (!this.initialCameraPosition) return;

        this.camera.position.copy(this.initialCameraPosition.position);
        this.controls.target.copy(this.initialCameraPosition.target);
        this.controls.update();
    }

    updateZoomConstraints() {
        if (!this.model || !this.controls) return;

        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        this.controls.minDistance = Math.max(maxDim * 0.1, 0.5);
        this.controls.maxDistance = Math.max(maxDim * 10, 50);
    }

    // Активация/деактивация сцены
    setActive(active) {
        if (this.isActive === active) return;

        this.isActive = active;

        if (active) {
            // Активируем сцену
            this.controls.enabled = true;
            this.startRendering();
            console.log(`Scene ${this.index} activated`);
        } else {
            // Деактивируем сцену
            this.controls.enabled = false;
            this.stopRendering();
            console.log(`Scene ${this.index} deactivated`);
        }
    }

    startRendering() {
        if (!this.isActive || !this.isInitialized) return;

        const animate = () => {
            if (!this.isActive) return;

            this.updatePointsPosition();
            this.controls.update();
            this.renderer.render(this.scene, this.camera);

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    stopRendering() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        // Deprecated - используем startRendering вместо этого
        if (this.isActive) {
            this.updatePointsPosition();
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }
    }

    onResize() {
        if (!this.isInitialized || !this.container) return;

        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        // Перерисовываем если сцена активна
        if (this.isActive) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    dispose() {
        // Останавливаем рендеринг
        this.stopRendering();
        this.setActive(false);

        if (this.model) {
            ModelLoader.cleanupModel(this.model);
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }

        if (this.controls) {
            this.controls.dispose();
        }

        this.interactivePoints = [];
        this.isInitialized = false;
        this.isActive = false;
    }
}