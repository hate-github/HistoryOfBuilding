// Конфигурация приложения с индивидуальными точками для каждой сцены
const Config = {
    scenes: [
        {
            id: 'model1',
            container: 'container1',
            infoPanel: 'info-panel1',
            modelPath: '/models/model1.fbx',
            architecturalStyle: "Неолит",
            constructionPeriod: "3000 г. до н.э",
            // Индивидуальные точки для сцены 1
            points: [
                {
                    position: { x: 333, y: 280, z: 70 },
                    label: 'Возраст и этапы строительства',
                    info: 'Первые земляные сооружения на месте Стоунхенджа появились около 3000 г. до н.э., а каменный круг был возведён примерно в 2500 г. до н.э.. Таким образом, памятнику более 5000 лет, и он строился в несколько этапов.'
                },
                {
                    position: { x: -300, y: 270, z: -70 },
                    label: 'Возможное назначение',
                    info: 'Стоунхендж ориентирован по солнцу: во время летнего солнцестояния лучи восходящего солнца проходят прямо через ось памятника. Это говорит о том, что он мог использоваться как древняя обсерватория или календарь для отслеживания сезонов.'
                },
                {
                    position: { x: 150, y: 70, z: 150 },
                    label: 'Всемирное наследие ЮНЕСКО',
                    info: 'В 1986 году Стоунхендж вместе с Авебери и другими близлежащими памятниками был включён в список объектов Всемирного наследия ЮНЕСКО, как уникальный центр доисторических сооружений.'
                },
                {
                    position: { x: 3, y: 40, z: 3 },
                    label: 'Погребальные обряды',
                    info: 'В окрестностях Стоунхенджа археологи нашли множество курганов и захоронений, относящихся к раннему бронзовому веку. Это подтверждает, что памятник был связан не только с астрономией, но и с ритуалами смерти и погребениями.'
                }
            ]
        },
        {
            id: 'model2',
            container: 'container2',
            infoPanel: 'info-panel2',
            modelPath: '/models/model2.fbx',
            architecturalStyle: "Бронзовый век",
            constructionPeriod: "2580 г. до н.э.",
            // Индивидуальные точки для сцены 2
            points: [
                {
                    position: { x: -10, y: 210, z: 35 },
                    label: 'Идеальная ориентация по сторонам света',
                    info: 'Пирамида Хеопса ориентирована по сторонам света с невероятной точностью. Её грани отклоняются от направлений на север, юг, восток и запад менее чем на 0,06 градуса (погрешность около 3-х угловых минут). Как древние египтяне добились такой точности без современных инструментов — до сих пор загадка.'
                },
                {
                    position: { x: 70, y: 130, z: 0 },
                    label: 'Изначально она была покрыта полированным белым известняком',
                    info: 'Сейчас мы видим пирамиду ступенчатой и желтоватой, но изначально она была облицована отполированными блоками белого турского известняка. Эта блестящая оболочка, отражавшая солнечные лучи, была снята в средние века для строительства Каира. На вершине пирамиды до сих пор сохранилась часть оригинальной облицовки.'
                },
                {
                    position: { x: -10, y: 0, z: 180 },
                    label: 'Температура внутри пирамиды постоянна и равна средней температуре Земли',
                    info: 'Независимо от времени года, температура внутри пирамиды держится на отметке +20°C. Это не случайность, а результат точных инженерных расчётов. Удивительно, но эта цифра ровно совпадает со средней температурой на поверхности Земли.'
                }
            ]
        },
        {
            id: 'model3',
            container: 'container3',
            infoPanel: 'info-panel3',
            modelPath: '/models/model3.fbx',
            architecturalStyle: "Барокко",
            constructionPeriod: "XVII-XVIII века",
            // Индивидуальные точки для сцены 3
            points: [
                {
                    position: { x: 0, y: 3, z: 0 },
                    label: 'Фасадный фронтон',
                    info: 'Изогнутый фронтон с волютами...'
                },
                {
                    position: { x: -1.5, y: 1, z: -1.5 },
                    label: 'Боковой павильон',
                    info: 'Боковой павильон с богатым декором...'
                },
                {
                    position: { x: 1.5, y: 0.8, z: 1.5 },
                    label: 'Парадная лестница',
                    info: 'Монументальная парадная лестница...'
                },
                {
                    position: { x: 0, y: 0.5, z: -2 },
                    label: 'Цокольный этаж',
                    info: 'Рустованный цокольный этаж...'
                }
            ]
        },
        {
            id: 'model4',
            container: 'container4',
            infoPanel: 'info-panel4',
            modelPath: '/models/model4.fbx',
            architecturalStyle: "Модерн",
            constructionPeriod: "Конец XIX - начало XX века",
            // Индивидуальные точки для сцены 4
            points: [
                {
                    position: { x: -2, y: 2.5, z: 0 },
                    label: 'Асимметричная башня',
                    info: 'Башня с асимметричными формами...'
                },
                {
                    position: { x: 1.8, y: 1.2, z: -1 },
                    label: 'Эркер',
                    info: 'Эркер с витражным остеклением...'
                },
                {
                    position: { x: 0, y: 0.3, z: 1.5 },
                    label: 'Главный вход',
                    info: 'Вход с коваными элементами...'
                }
            ]
        },
        {
            id: 'model5',
            container: 'container5',
            infoPanel: 'info-panel5',
            modelPath: '/models/model5.fbx',
            architecturalStyle: "Современная архитектура",
            constructionPeriod: "XX-XXI века",
            // Индивидуальные точки для сцены 5
            points: [
                {
                    position: { x: 0, y: 4, z: 0 },
                    label: 'Верхний уровень',
                    info: 'Консольный верхний уровень...'
                },
                {
                    position: { x: -3, y: 1.5, z: 0 },
                    label: 'Западный фасад',
                    info: 'Стеклянный фасад с солнцезащитой...'
                },
                {
                    position: { x: 2.5, y: 0.8, z: -2 },
                    label: 'Терраса',
                    info: 'Открытая терраса на верхнем этаже...'
                },
                {
                    position: { x: 0, y: 0, z: 2.8 },
                    label: 'Входная группа',
                    info: 'Модернистская входная группа...'
                },
                {
                    position: { x: 1.2, y: 2.1, z: 1.2 },
                    label: 'Балкон',
                    info: 'Консольный балкон с ограждением...'
                }
            ]
        }
    ],

    historicalFacts: [
        "Готическая архитектура зародилась во Франции в XII веке...",
        "Ренессансная архитектура возродила классические принципы...",
        "Барокко, возникшее в Италии в XVII веке...",
        "Архитектура модерна конца XIX - начала XX века...",
        "Современная архитектура XX века..."
    ],

    threeJS: {
        backgroundColor: 0x22333B, // Фон по умолчанию для темной темы
        camera: {
            fov: 75,
            near: 0.1,
            far: 5000,
            initialPosition: { x: 5, y: 5, z: 5 } // ДОБАВЛЕНО: начальная позиция камеры
        },
        controls: {
            damping: 0.05,
            minDistance: 1,
            maxDistance: 3000,
            zoomSpeed: 1.0
        },
        lighting: {
            ambient: { color: 0x404040, intensity: 5 },
            directional: {
                color: 0xffffff,
                intensity: 2,
                position: { x: 50, y: 50, z: 25 },
                shadowCameraFar: 5000
            }
        },
        // ДОБАВЛЕНО: Конфигурация skybox
        skybox: {
            radius: 3000, // Радиус сферы skybox
            segments: 16, // Количество сегментов для сглаживания
            maxDistanceMultiplier: 0.95 // Множитель для ограничения максимального расстояния камеры (95% от радиуса)
        },

        cameraBounds: {
            radius: 800,
            segments: 16,
            maxDistanceMultiplier: 0.90
        }
    },

    interaction: {
        scrollThreshold: 3,
        pointSize: 6,
        pointColor: 0x00ff00,
        highlightColor: 0x00ff00
    }
};

// Fallback colors for models
Config.getFallbackColor = (index) => {
    const colors = [0x8B4513, 0xCD853F, 0xD2691E, 0xA0522D, 0xDEB887];
    return colors[index] || 0x8B4513;
};

// Получение точек для конкретной сцены
Config.getPointsForScene = (sceneIndex) => {
    if (Config.scenes[sceneIndex] && Config.scenes[sceneIndex].points) {
        return Config.scenes[sceneIndex].points;
    }
    return [];
};

// Получение конфигурации skybox
Config.getSkyboxConfig = () => {
    return Config.threeJS.skybox || { radius: 500, segments: 32, maxDistanceMultiplier: 0.95 };
};


// Получение конфигурации cameraBounds
Config.getCameraBounds = () => {
    return Config.threeJS.cameraBounds || { radius: 800, segments: 24,  maxDistanceMultiplier: 0.90 };
};