// Кастомный компонент: лёгкое покачивание вверх-вниз, имитация плавания.
// Применяется к игроку (entity с id="player").
AFRAME.registerComponent('swim-bob', {
    schema: {
        amplitude: { type: 'number', default: 0.06 }, // насколько колеблется (метры)
        frequency: { type: 'number', default: 0.4 }   // как часто (циклов в секунду)
    },

    init: function () {
        // запоминаем стартовую Y-координату — от неё считаем колебания
        this.startY = this.el.object3D.position.y;
        this.time = 0;
    },

    tick: function (time, delta) {
        // delta — миллисекунды с прошлого кадра. Накапливаем общее время.
        this.time += delta / 1000;
        // синусоида: плавное колебание вверх-вниз
        const offset = Math.sin(this.time * Math.PI * 2 * this.data.frequency) * this.data.amplitude;
        this.el.object3D.position.y = this.startY + offset;
    }
});

// Marine snow — дрейфующие частицы вокруг игрока.
// Использует Three.js Points: одна геометрия с N точками вместо N entity =>
// быстро даже на мобиле.
AFRAME.registerComponent('marine-snow', {
    schema: {
        count: { type: 'number', default: 200 },   // сколько частиц
        range: { type: 'number', default: 20 },    // радиус облака вокруг игрока (метры)
        size: { type: 'number', default: 0.05 },  // размер частицы
        speed: { type: 'number', default: 0.15 }   // скорость падения (м/сек)
    },

    init: function () {
        const { count, range, size, speed } = this.data;

        // Буферы для позиций (x,y,z на каждую точку) и скоростей
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        // Случайно раскидываем частицы внутри куба ±range вокруг (0,0,0)
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * range * 2;
            positions[i * 3 + 1] = Math.random() * range;
            positions[i * 3 + 2] = (Math.random() - 0.5) * range * 2;

            // Чуть-чуть бокового дрейфа, в основном падают вниз
            velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.05;
            velocities[i * 3 + 1] = -speed * (0.5 + Math.random() * 0.5); // 50-100% базовой скорости
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Создаём круглую текстуру для частиц прямо в коде (без PNG-файла).
// Рисуем на canvas радиальный градиент: белый центр → прозрачные края.
const canvas = document.createElement('canvas');
canvas.width = 64;
canvas.height = 64;
const ctx = canvas.getContext('2d');
const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
gradient.addColorStop(0,   'rgba(255, 255, 255, 1)');   // ярко в центре
gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)'); // мягкое затухание
gradient.addColorStop(1,   'rgba(255, 255, 255, 0)');   // прозрачно по краям
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 64, 64);
const particleTexture = new THREE.CanvasTexture(canvas);

const material = new THREE.PointsMaterial({
  color: 0xeaf6ff,
  size: size,
  map: particleTexture,      // ← новое: натягиваем круглую текстуру
  transparent: true,
  opacity: 0.7,
  depthWrite: false,
  alphaTest: 0.01,           // ← отсекаем совсем прозрачные пиксели (чище отрисовка)
  sizeAttenuation: true
});


        this.points = new THREE.Points(geometry, material);
        this.el.setObject3D('mesh', this.points);

        // Запоминаем буферы для tick()
        this.positions = positions;
        this.velocities = velocities;
    },

    tick: function (time, delta) {
        const dt = delta / 1000; // секунды с прошлого кадра
        const { count, range } = this.data;
        const positions = this.positions;
        const velocities = this.velocities;

        // Узнаём, где сейчас игрок — чтобы облако следовало за ним
        const player = document.querySelector('#player');
        const camX = player ? player.object3D.position.x : 0;
        const camZ = player ? player.object3D.position.z : 0;

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            positions[ix + 0] += velocities[ix + 0] * dt;
            positions[ix + 1] += velocities[ix + 1] * dt;
            positions[ix + 2] += velocities[ix + 2] * dt;

            // Расстояние от частицы до игрока по горизонтали
            const dx = positions[ix + 0] - camX;
            const dz = positions[ix + 2] - camZ;
            const tooFar = dx * dx + dz * dz > range * range;

            // Если упала на дно ИЛИ ушла далеко от игрока — респавним сверху около него
            if (positions[ix + 1] < 0 || tooFar) {
                positions[ix + 0] = camX + (Math.random() - 0.5) * range * 2;
                positions[ix + 1] = range; // сверху облака
                positions[ix + 2] = camZ + (Math.random() - 0.5) * range * 2;
            }
        }

        // Говорим Three.js, что позиции обновились — нужно перерисовать
        this.points.geometry.attributes.position.needsUpdate = true;
    }
});

// boundary-clamp — невидимая круговая граница со "скольжением вдоль стенки".
// Логика: если игрок пересёк радиус — берём только тангенциальную (вдоль стенки)
// составляющую движения за этот кадр. Радиальную (в стенку) выкидываем.
AFRAME.registerComponent('boundary-clamp', {
  schema: {
    radius: { type: 'number', default: 47 }
  },

  init: function () {
    // Запоминаем X/Z прошлого кадра, чтобы знать, куда игрок двигался
    this.prevX = this.el.object3D.position.x;
    this.prevZ = this.el.object3D.position.z;
  },

  tick: function () {
    const pos = this.el.object3D.position;
    const r = this.data.radius;

    // Игрок вышел за круг?
    if (pos.x * pos.x + pos.z * pos.z > r * r) {
      // Вектор движения за этот кадр
      const dx = pos.x - this.prevX;
      const dz = pos.z - this.prevZ;

      // Нормаль к стенке в точке прошлого кадра (направление "от центра наружу")
      const prevLen = Math.sqrt(this.prevX * this.prevX + this.prevZ * this.prevZ);
      if (prevLen > 0.001) {
        const nx = this.prevX / prevLen;
        const nz = this.prevZ / prevLen;

        // Касательная (перпендикуляр к нормали) — направление "вдоль стенки"
        const tx = -nz;
        const tz = nx;

        // Проецируем движение на касательную: длина проекции = (dx,dz) ⋅ (tx,tz)
        const tangential = dx * tx + dz * tz;

        // Новая позиция = старая + только касательная часть движения
        pos.x = this.prevX + tx * tangential;
        pos.z = this.prevZ + tz * tangential;

        // Финальная страховка: если касательное движение всё равно за радиусом —
        // снэпим обратно (может случиться из-за floating point)
        const newDistSq = pos.x * pos.x + pos.z * pos.z;
        if (newDistSq > r * r) {
          const scale = r / Math.sqrt(newDistSq);
          pos.x *= scale;
          pos.z *= scale;
        }
      }
    }

    // Сохраняем позицию для следующего кадра
    this.prevX = pos.x;
    this.prevZ = pos.z;
  }
});

// follow-player — копирует позицию игрока на эту entity каждый кадр.
// Нужно для videosphere: чтобы сфера всегда оборачивалась вокруг игрока,
// даже когда он ходит. Только position, не rotation — иначе мир крутился бы
// вслед за камерой.
AFRAME.registerComponent('follow-player', {
  schema: {
    target: { type: 'selector', default: '#player' },
    y:      { type: 'number',   default: 0 }   // фиксированная Y-координата сферы
  },
  tick: function () {
    if (!this.data.target) return;
    const t = this.data.target.object3D.position;
    // X,Z берём от игрока; Y фиксируем — чтобы можно было "поднять" сферу
    // над полом (например, чтобы низ сферы совпал с уровнем песка).
    this.el.object3D.position.set(t.x, this.data.y, t.z);
  }
});

// Workaround для политики автоплея браузеров: даже с muted+playsinline
// некоторые браузеры (особенно Safari) ставят видео на паузу до первого
// взаимодействия. Запускаем видео руками на любом click / key / touch.
window.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('#underwater-video');
  if (!video) return;

  // Скорость воспроизведения: 1 = нормально, 0.5 = в 2 раза медленнее,
  // 0.25 = в 4 раза медленнее. Для медитативного темпа удобно 0.4–0.6.
  video.playbackRate = 0.4;

  const tryPlay = () => {
    if (video.paused) {
      video.play().catch(err => console.warn('video play blocked:', err));
    }
  };

  // Пробуем сразу (вдруг браузер разрешит)
  tryPlay();

  // И на любом взаимодействии — пока не запустится
  ['click', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, tryPlay);
  });
});
