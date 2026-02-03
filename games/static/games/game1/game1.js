const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Переменные игры
let game;
let score = 0;
let shots = 0;
let hits = 0;
let timeLeft = 30;
let gameActive = false;
let target;
let crosshair;
let timerEvent;
let difficulty = 'medium';

// Настройки сложности
const difficultySettings = {
    easy: {
        targetSize: 35,
        targetSpeed: 100,
        spawnRate: 1500
    },
    medium: {
        targetSize: 25,
        targetSpeed: 180,
        spawnRate: 1000
    },
    hard: {
        targetSize: 18,
        targetSpeed: 250,
        spawnRate: 700
    }
};

// Загрузка ресурсов
function preload() {
    this.load.image('target', 'games/staticfiles/images/aim/target');
}

// Создание игровых объектов
function create() {
    // Создаем группу для целей
    this.targets = this.physics.add.group();
    
    // Настраиваем курсор
    this.input.setDefaultCursor('none');
    
    // Создаем прицел
    crosshair = this.add.graphics();
    drawCrosshair();
    
    // Следим за движением мыши
    this.input.on('pointermove', function (pointer) {
        crosshair.x = pointer.x;
        crosshair.y = pointer.y;
    }, this);
    
    // Обработка кликов
    this.input.on('pointerdown', function (pointer) {
        if (!gameActive) return;
        
        shots++;
        updateStats();
        
        // Проверяем попадание
        let hit = false;
        this.targets.getChildren().forEach(function(target) {
            if (Phaser.Geom.Rectangle.ContainsPoint(target.getBounds(), pointer)) {
                hitTarget.call(this, target);
                hit = true;
            }
        }, this);
        
        // Анимация клика
        if (!hit) {
            const circle = this.add.circle(pointer.x, pointer.y, 10, 0xff0000, 0.3);
            this.tweens.add({
                targets: circle,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: function() {
                    circle.destroy();
                }
            });
        }
    }, this);
    
    // Кнопки управления
    document.getElementById('start-btn').addEventListener('click', startGame.bind(this));
    document.getElementById('reset-btn').addEventListener('click', resetGame.bind(this));
    document.getElementById('difficulty').addEventListener('change', function(e) {
        difficulty = e.target.value;
    });
    
    // Стартовый экран
    showStartScreen.call(this);
}

// Функция отрисовки прицела
function drawCrosshair() {
    crosshair.clear();
    crosshair.lineStyle(2, 0xffffff, 1);
    crosshair.fillStyle(0x000000, 0.5);
    
    // Центральная точка
    crosshair.fillCircle(0, 0, 3);
    
    // Линии прицела
    crosshair.strokeLineShape(new Phaser.Geom.Line(-15, 0, -5, 0));
    crosshair.strokeLineShape(new Phaser.Geom.Line(5, 0, 15, 0));
    crosshair.strokeLineShape(new Phaser.Geom.Line(0, -15, 0, -5));
    crosshair.strokeLineShape(new Phaser.Geom.Line(0, 5, 0, 15));
}

// Создание новой цели
function createTarget() {
    if (!gameActive) return;
    
    const settings = difficultySettings[difficulty];
    const x = Phaser.Math.Between(50, config.width - 50);
    const y = Phaser.Math.Between(50, config.height - 50);
    
    target = this.add.circle(x, y, settings.targetSize, 0x808080);
    target.setInteractive();
    
    // Добавляем физику
    this.physics.add.existing(target);
    target.body.setVelocity(
        Phaser.Math.Between(-settings.targetSpeed, settings.targetSpeed),
        Phaser.Math.Between(-settings.targetSpeed, settings.targetSpeed)
    );
    
    // Отскок от границ
    target.body.setBounce(1, 1);
    target.body.setCollideWorldBounds(true);
    
    // Анимация появления
    this.tweens.add({
        targets: target,
        scale: { from: 0, to: 1 },
        alpha: { from: 0, to: 1 },
        duration: 300,
        ease: 'Back.out'
    });
    
    this.targets.add(target);
}

// Попадание по цели
function hitTarget(target) {
    hits++;
    score += 10;
    
    // Анимация попадания
    this.tweens.add({
        targets: target,
        scale: 0,
        alpha: 0,
        duration: 150,
        ease: 'Power2',
        onComplete: function() {
            target.destroy();
            createTarget.call(this);
        }.bind(this)
    });
    
    // Эффект частиц
    const particles = this.add.particles(target.x, target.y, 'target', {
        speed: { min: 50, max: 150 },
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        lifespan: 500,
        quantity: 10
    });
    
    this.time.delayedCall(500, function() {
        particles.destroy();
    });
    
    updateStats();
}

// Обновление статистики
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;
    
    const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 100;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

// Старт игры
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    score = 0;
    shots = 0;
    hits = 0;
    timeLeft = 30;
    
    // Очищаем старые цели
    this.targets.clear(true, true);
    
    // Запускаем таймер
    timerEvent = this.time.addEvent({
        delay: 1000,
        callback: function() {
            timeLeft--;
            updateStats();
            
            if (timeLeft <= 0) {
                endGame.call(this);
            }
        },
        callbackScope: this,
        loop: true
    });
    
    // Создаем первую цель
    createTarget.call(this);
    
    // Скрываем стартовый экран
    if (this.startScreen) {
        this.startScreen.destroy();
        this.startScreen = null;
    }
    
    // Меняем кнопку
    document.getElementById('start-btn').textContent = 'Игра идет...';
    document.getElementById('start-btn').disabled = true;
}

// Конец игры
function endGame() {
    gameActive = false;
    timerEvent.remove();
    
    // Останавливаем все цели
    this.targets.getChildren().forEach(function(target) {
        target.body.setVelocity(0, 0);
    });
    
    // Показываем результаты
    const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;
    
    const resultText = this.add.text(config.width / 2, config.height / 2, 
        `Игра окончена!\n\nОчки: ${score}\nТочность: ${accuracy}%\n\nНажми Сброс для новой игры`,
        {
            font: '24px Arial',
            fill: '#4cc9f0',
            align: 'center',
            lineSpacing: 10
        }
    );
    resultText.setOrigin(0.5);
    resultText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 5);
    
    // Анимация появления
    this.tweens.add({
        targets: resultText,
        scale: { from: 0, to: 1 },
        duration: 500,
        ease: 'Back.out'
    });
    
    // Активируем кнопку
    document.getElementById('start-btn').textContent = 'Старт';
    document.getElementById('start-btn').disabled = false;
}

// Сброс игры
function resetGame() {
    if (gameActive) {
        timerEvent.remove();
        gameActive = false;
    }
    
    // Очищаем сцену
    this.targets.clear(true, true);
    this.children.removeAll();
    
    // Сбрасываем переменные
    score = 0;
    shots = 0;
    hits = 0;
    timeLeft = 30;
    
    // Обновляем статистику
    updateStats();
    
    // Показываем стартовый экран
    showStartScreen.call(this);
    
    // Восстанавливаем кнопку
    document.getElementById('start-btn').textContent = 'Старт';
    document.getElementById('start-btn').disabled = false;
}

// Стартовый экран
function showStartScreen() {
    this.startScreen = this.add.container(config.width / 2, config.height / 2);
    
    const bg = this.add.rectangle(0, 0, 500, 300, 0x000000, 0.8);
    bg.setStrokeStyle(2, 0x4cc9f0);
    
    const title = this.add.text(0, -80, '🎯 AIM TRAINER', {
        font: '32px Arial',
        fill: '#4cc9f0',
        fontWeight: 'bold'
    }).setOrigin(0.5);
    
    const instructions = this.add.text(0, -20, 
        'Наводи прицел на серые цели\nКликай по ним как можно быстрее\n\nВыбери сложность и нажми Старт',
        {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }
    ).setOrigin(0.5);
    
    const controls = this.add.text(0, 80, 
        'Управление:\n• Мышь - наведение прицела\n• ЛКМ - выстрел\n• Старт/Сброс - кнопки ниже',
        {
            font: '16px Arial',
            fill: '#aaaaaa',
            align: 'center',
            lineSpacing: 8
        }
    ).setOrigin(0.5);
    
    this.startScreen.add([bg, title, instructions, controls]);
    
    // Анимация
    this.tweens.add({
        targets: this.startScreen,
        scale: { from: 0, to: 1 },
        duration: 500,
        ease: 'Back.out'
    });
}

// Обновление каждый кадр
function update() {
    if (!crosshair) return;
    
    // Обновляем прицел
    drawCrosshair();
    
    // Автоматическое создание целей
    if (gameActive && !this.nextSpawn) {
        const settings = difficultySettings[difficulty];
        this.nextSpawn = this.time.delayedCall(settings.spawnRate, function() {
            if (gameActive && this.targets.getLength() < 5) {
                createTarget.call(this);
            }
            this.nextSpawn = null;
        }, [], this);
    }
}

// Запуск игры
game = new Phaser.Game(config);