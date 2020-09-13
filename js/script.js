'use strict';

const
	audio = new Audio('./sounds/audio.mp3'), // добавляем аудио
	MAX_ENEMY = 8, // количество машинок соперников
	HEIGHT_LINE = 100, // высота элементов
	car = document.createElement('div'), // создаем машинку
	road = document.querySelector('.gameArea'), // игровое поле
	start = document.querySelector('.start'), // поле для старта
	record = document.querySelector('.record'), // поле рекорд
	score = document.querySelector('.score'); // поле с очками

audio.volume = 0.09; // начальные установки аудио

car.classList.add('car'); // добавляем элементу car класс car

const countLines = Math.floor(document.documentElement.clientHeight / HEIGHT_LINE); // получаем количество линий помещающихся в высоту экрана
road.style.height =  countLines * HEIGHT_LINE; // делаем высоту дороги кратной количеству линий

// начальные значения клавиш
const keys = {
	ArrowUp: false,
	ArrowDown: false,
	ArrowRight: false,
	ArrowLeft: false,
};

// начальные настройки игры
const setting = {
	start: false,
	score: 0,
	speed: 0,
	traffic: 0,
	level: 1,
	quality: ''
};

let results;
const getLocalStorage = (quality) => {
	results = localStorage.getItem(quality);
};

// let results = parseInt(localStorage.getItem(setting.quality)); // получаем текущий рекорд из localStorage
score.textContent = 'Очки: 0'; // начальное количество очков
record.textContent = results ? 'Рекорд: ' + results : 'Рекорд: ' + 0; // если рекорд есть, показываем его на странице, иначе false

// сохраняем рекорд в localStorage
const addLocalStorage = () => {
	if (!results || results < setting.score) { // если текущий рекорд меньше набранных очков
		localStorage.setItem(setting.quality, Math.floor(setting.score)); // перезаписываем рекорд
		record.textContent = 'Рекорд: ' + Math.floor(setting.score); // показываем на странице
	}
};

// расчитываем количество линий влезащих на дорогу
const getQuantityElements = (heightLine) => { // принимаем высоту линии
	return (road.offsetHeight / heightLine); // возвращаем количество элементов
};

// подготовка игры
const startGame = (event) => {
	road.innerHTML = ''; // очищаем дорогу
	const target = event.target; // определяем куда кликнули
	if (target === start) return; // если кликнули мимо кнопок, ничего не делаем
	switch (target.id) { // если кникнули по какой то кнопке
		case 'easy':
			setting.speed = 5;
			setting.traffic = 3;
			setting.quality = 'easy';
			getLocalStorage(setting.quality);
			break;
		case 'medium':
			setting.speed = 7;
			setting.traffic = 2.5;
			setting.quality = 'medium';
			getLocalStorage(setting.quality);
			break;
		case 'hard':
			setting.speed = 10;
			setting.traffic = 2;
			setting.quality = 'hard';
			getLocalStorage(setting.quality);
			break;
	}
	start.classList.add('hide');
	for (let i = 0; i <= (getQuantityElements(HEIGHT_LINE)); i++) { // рисуем разметку на дороге
		const line = document.createElement('div'); // создаем линию разметки
		line.classList.add('line'); // добавляем класс
		line.y = i * HEIGHT_LINE; // в свойство y записываем начальное положение от верха
		line.style.top = line.y +'px'; // добавляем свойство top (расстояние каждой черточки от верхней границы)
		line.style.height = (HEIGHT_LINE / 2) + 'px'; // устанавливаем высоту линий
		road.append(line); // вставляем элемент на игровое поле
	}
	for (let i = 1; i <= getQuantityElements(HEIGHT_LINE * setting.traffic); i++) { // создаем машинки врагов, количество определяется трафиком
		const enemy = document.createElement('div'); // создаем элемент машинку
		enemy.classList.add('enemy'); // добавляем класс
		const randomEnemy = Math.floor(Math.random() * MAX_ENEMY + 1); // вычисляем рандомное число
		const periodEnemy = -HEIGHT_LINE * setting.traffic * i * 1.5; // расчитываем дистанцию между авто
		enemy.y = periodEnemy; // задаем начальное расстояние автомобилей
		enemy.style.top = enemy.y + 'px'; // и устанавливаем это расстояние
		enemy.style.background = `transparent url(\'./cars/enemy${randomEnemy}.png\') center / cover no-repeat`; // задаем стиль машины для соперников
		road.append(enemy); // вставляем машину на игровое поле
		enemy.style.left = Math.floor(Math.random()* (road.offsetWidth - enemy.offsetWidth)) + 'px'; // устанавливаем случайное положение машинки по горизонтали
	}
	setting.score = 0; // обнуляем очки
	setting.start = true; // устанавливаем значение start
	road.append(car); // вставляем нашу машинку на дорогу
	car.style.left = road.offsetWidth / 2 - car.offsetWidth / 2; // устанавливаем ее по центру дороги
	car.style.top = 'auto';
	car.style.bottom = '10px';
	audio.play(); // включаем музыку
	setting.x = car.offsetLeft; // добавляем х как свойство и присваиваем положение на котором находится по горизонтали
	setting.y = car.offsetTop; // добавляем y как свойство и присваиваем положение на котором находится по вертикали
	requestAnimationFrame(playGame); // запускаем анимацию игры
};

let level = setting.level; // начальный уровень игры

// запускаем игру
const playGame = () => {
	setting.level = Math.floor(setting.score / 10) + 1;
	if (setting.level !== level) {
		level = setting.level;
		setting.speed += 1;
	}
	if (setting.start) { // пока значение start===true, выполняем анимацию игры
		setting.score += setting.speed * 0.001;
		score.textContent = 'Очки: ' + Math.floor(setting.score) + ' Уровень: ' + level;
		record.textContent = 'Рекорд: ' + results;
		moveRoad(); // движение разметки
		moveEnemy(); // движение соперников
		if (keys.ArrowLeft && setting.x > 0) { // если клавиша влево зажата и машина не за пределами дороги слева
			setting.x -= setting.speed / 2; // убавляем х на единицу скорости, сдвигаем машину влево
		}
		if (keys.ArrowRight && setting.x < (road.offsetWidth - car.offsetWidth)) { // если клавиша вправо зажата и машина не за пределами дороги справа
			setting.x += setting.speed / 2; // увеличиваем х на единицу скорости, сдвигаем машину вправо
		}
		if (keys.ArrowDown && setting.y < (road.offsetHeight - car.offsetHeight)) { // если клавиша вправо зажата и машина не за пределами дороги сзади
			setting.y += setting.speed; // увеличиваем y на единицу скорости, сдвигаем машину назад
		}
		if (keys.ArrowUp && setting.y > 0) { // если клавиша вверх зажата и машина не за пределами дороги спереди
			setting.y -= setting.speed; // убавляем y на единицу скорости, сдвигаем машину вперед
		}
		car.style.left = setting.x + 'px'; // прописываем в стили новое положение машинки
		car.style.top = setting.y + 'px'; // прописываем в стили новое положение машинки
		requestAnimationFrame(playGame); //
	}
};

// движение машины
const startRun = (event) => {
	if (keys.hasOwnProperty(event.key)) { // если нажатая клавиша присутствует в объекте keys
		event.preventDefault(); // откл. стандартное поведение браузера
		keys[event.key] = true; // присваиваем значение
	}
};

// остановка машины
const stopRun = (event) => {
	if (keys.hasOwnProperty(event.key)) { // если нажатая клавиша присутствует в объекте keys
		event.preventDefault(); // откл. стандартное поведение браузера
		keys[event.key] = false; // присваиваем значение
	}
};

// движение разметки
const moveRoad = () => {
	let lines = document.querySelectorAll('.line'); // получаем все линии разметки
	lines.forEach(function (item) { // перебираем каждую
		item.y += setting.speed; // у увеличиваем отступ сверху на единицу скорости
		item.style.top = item.y + 'px'; // и меняем положение линии на этот отступ в стилях
		if (item.y > road.offsetHeight) { // когда линия уехала за границу документа
			item.y = -HEIGHT_LINE; // устанавливаем отступ в -100, что бы линия выезжала сверху
		}
	});
};

// движение соперников
const moveEnemy = () => {
	let enemies = document.querySelectorAll('.enemy'); // получаем все машинки соперников
	enemies.forEach(function (enemy) { // перебираем их
		let carRect = car.getBoundingClientRect(); // определяем параметры машины (ширина, высота, положение)
		let enemyRect = enemy.getBoundingClientRect(); // определяем параметры машин соперников (ширина, высота, положение)
		if (carRect.top +5 <= enemyRect.bottom && // если зоны машин пересекаются
			carRect.right -5 >= enemyRect.left &&
			carRect.left +5 <= enemyRect.right &&
			carRect.bottom -5 >= enemyRect.top) {
			setting.start = false; // останавливаем игру
			audio.pause(); // останавливаем музыку
			start.classList.remove('hide'); // показываем кнопки
			addLocalStorage(); // сохраняем рекорд
		}
		enemy.y = enemy.y + setting.speed / 2; // сдвигаем каждую от верха экрана на единицу скорости
		enemy.style.top = enemy.y + 'px'; // и задаем это расстояние в стилях
		if (enemy.y >= road.offsetHeight) { // если машина уехала за нижнюю границу экрана
			enemy.y = -HEIGHT_LINE * setting.traffic * setting.speed * 0.1; // ставим машину в начало
			enemy.style.left = Math.floor(Math.random() * (road.offsetWidth - enemy.offsetWidth)) + 'px'; // и меняем положение по горизонтали
		}
	});
};

start.addEventListener('click', startGame); // клик по полю старт
document.addEventListener('keydown', startRun); // нажатие клавиши
document.addEventListener('keyup', stopRun); // отжатие клавиши

