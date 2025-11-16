// Загрузчик и менеджер 3D-моделей
class ModelLoader {
    static async loadModel(modelPath) {
        const alternativePaths = [
            modelPath,
            `models/model${modelPath.split('model')[1]}`,
            `./models/model${modelPath.split('model')[1]}`
        ];

        for (const path of alternativePaths) {
            try {
                const model = await this.loadModelFromPath(path);
                if (model) return model;
            } catch (error) {
                console.warn(`Failed to load from ${path}:`, error);
                continue;
            }
        }

        throw new Error(`All loading attempts failed for ${modelPath}`);
    }

    static loadModelFromPath(path) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.FBXLoader();

            loader.load(
                path,
                (object) => {
                    console.log(`Successfully loaded model from: ${path}`);
                    resolve(object);
                },
                (xhr) => {
                    console.log(`Loading ${path}: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    static centerAndScaleModel(model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model
        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        // Calculate appropriate scale
        const maxDim = Math.max(size.x, size.y, size.z);

        let scaleFactor;
        if (maxDim > 1000) {
            scaleFactor = 1;
        } else if (maxDim > 500) {
            scaleFactor = 1.0;
        } else if (maxDim > 100) {
            scaleFactor = 2.0;
        } else if (maxDim > 50) {
            scaleFactor = 3.0;
        } else if (maxDim > 10) {
            scaleFactor = 5.0;
        } else if (maxDim > 5) {
            scaleFactor = 8.0;
        } else if (maxDim > 1) {
            scaleFactor = 12.0;
        } else {
            scaleFactor = 15.0;
        }

        console.log(`Model scaling - Original size:`, size, `Max dimension: ${maxDim}, Scale factor: ${scaleFactor}`);

        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        return {
            scaledSize: size.multiplyScalar(scaleFactor),
            originalSize: size,
            scaleFactor: scaleFactor
        };
    }

    // ДОБАВЛЕНА ФУНКЦИЯ normalizeModelSize
    static normalizeModelSize(model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model
        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        // Calculate scale to normalize size
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 15;
        let scaleFactor = targetSize / maxDim;
        if (maxDim > 1000) {
            scaleFactor = 1;
        } else if (maxDim > 500) {
            scaleFactor = 1.0;
        } else if (maxDim > 100) {
            scaleFactor = 2.0;
        } else if (maxDim > 50) {
            scaleFactor = 3.0;
        } else if (maxDim > 10) {
            scaleFactor = 5.0;
        } else if (maxDim > 5) {
            scaleFactor = 8.0;
        } else if (maxDim > 1) {
            scaleFactor = 12.0;
        } else {
            scaleFactor = 15.0;
        }

        // Apply reasonable limits
        scaleFactor = Math.max(0.5, Math.min(scaleFactor, 20));

        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        console.log(`Normalized model - Original: ${maxDim.toFixed(2)}, Scale: ${scaleFactor.toFixed(2)}, New size: ${(maxDim * scaleFactor).toFixed(2)}`);

        return {
            scaledSize: size.multiplyScalar(scaleFactor),
            originalSize: size.clone(),
            scaleFactor: scaleFactor
        };
    }

    static calculateOptimalScale(model) {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Целевой размер для модели в единицах Three.js
        const targetSize = 10;
        let scaleFactor = targetSize / maxDim;

        // Ограничиваем масштаб разумными пределами
        scaleFactor = Math.max(0.1, Math.min(scaleFactor, 50));

        console.log(`Optimal scaling - Original max dimension: ${maxDim}, Scale factor: ${scaleFactor}`);

        return scaleFactor;
    }

    static cleanupModel(model) {
        if (!model.traverse) return;

        model.traverse(child => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }
}