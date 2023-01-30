// https://doka.guide/js/modules/

// 4
// импорт данных из json файлика
import data from './data.json' assert { type: 'json' } 

// 7
// импорт всяких вспомогашек из файла helper.js
import { defaultNavBarOption, getFuelData, getUniqueFuels, heightReservoirSquare, maxVolume, validation } from './helper.js'

// просто переменная, где лежит массив резервуаров
let reservoirData = []

let navBarOptions = []
let currentFuel = ''
let minFuelValue = 200
let maxFuelValue = 800

// ищем в объекте document (DOM-дерево) элемент с id 'upload-data' - наша кнопка
const uploadBtn = document.getElementById('upload-data') // 1

const minInput = document.getElementById('min')
const maxInput = document.getElementById('max')

let navLinks = undefined

// 3
// обработчик нажатия кнопки
const onBtnClick = () => { 
  if (data.length) {
    // если данные были загружены, то заблокируем кнопку
    // см html и css для кнопки
    uploadBtn.disabled = true

    // просто кладем данные из json файла (массив) в переменную, к которой будет доступ всем функциям в этом файле
    reservoirData = data

    // отрисовка меню навигации
    renderNavBar()

    // отрисовка резервуаров
    // закомментила, потому что этот метод вызывается внутри renderNavBar -> goToDefaultNavLink -> onNavClick -> renderFilteredReservoirs
    renderMain(reservoirData) // 5
  }
}

const onInputChange = (input) => {
  const id = input?.target?.id
  switch (id) {
    case 'min':
      minFuelValue = input?.target?.value
      break
    case 'max':
      maxFuelValue = input?.target?.value
      break
    default:
      break
  }

  renderFilteredReservoirs()
  renderFooter()
}

const goToDefaultNavLink = () => {
  const currentMenuItem = document.getElementById(defaultNavBarOption.fuel)
  onNavClick(currentMenuItem)
}

// https://developer.mozilla.org/ru/docs/Web/API/Node/childNodes
const onNavClick = (menuItem) => {
  const id = menuItem?.getAttribute('id')
  if (id !== currentFuel) {
    const currentMenuItem = document.getElementById(currentFuel)
    currentMenuItem?.classList?.remove('navigation-item_current')
    currentMenuItem?.childNodes[1]?.classList?.remove('navigation-link_current')
    currentFuel = id
    
    menuItem?.classList.add('navigation-item_current')
    menuItem?.childNodes[1]?.classList?.add('navigation-link_current')
    
    renderFilteredReservoirs()
  }
}

const listenToNavBar = () => {
  navLinks = document.querySelectorAll('.navigation-item')
  navLinks?.forEach(item => {
    item.addEventListener('click', () => onNavClick(item))
  })
}

const renderNavBar = () => {
  navBarOptions = [defaultNavBarOption.fuel, ...getUniqueFuels(reservoirData)]

  const container = document.querySelector('.fuel-navigation-list')
  container.innerHTML = ''

  navBarOptions.forEach((item) => {
    const fuelData = item === defaultNavBarOption.fuel ? defaultNavBarOption : getFuelData(item)
    const template = renderNavItem(fuelData)
    container.appendChild(template);
  })

  listenToNavBar()
  goToDefaultNavLink()
}

const renderNavItem = (item) => {
  const menuItem = `
    <li class="navigation-item" id="${item?.fuel}">
      <a class="navigation-link" href="#"">${item?.name?.toUpperCase()}</a>
    </li>
  `
  const template = document.createElement('template');
  template.innerHTML = menuItem
  return template.content
}

const renderFilteredReservoirs = () => {
  if (!currentFuel || currentFuel === defaultNavBarOption.fuel) {
    renderMain(reservoirData)
  } else {
    const filtered = reservoirData?.filter(elem => elem?.fuel === currentFuel)
    renderMain(filtered)
  }
}

// 5 
// ищем в document контейнер для отрисовки резервуаров (наш ul тег) по имени класса
// на всякий случай очищаем контент внутри него (если вдруг там что-то было) с помощью innerHTML = ''
// после этого для массива резервуаров для каждого элемента нужно отрисовать свой резервуар
// и каждый резервуар как DOM Node (ноду) мы должна добавить к контейнеру с помощью метода appendChild
// appendChild добавляет узел (нашу ноду - резервуар) в конец списка дочерних элементов указанного родительского узла (контейнера в теге ul)
// https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
// https://developer.mozilla.org/ru/docs/Web/API/Node/appendChild
const renderMain = (reservoirs) => {
  const container = document.querySelector('.reservoir-container')
  container.innerHTML = ''
  reservoirs.forEach((item, index) => {
    // в массиве для каждого резервуара вызываем метод renderReservoir, который возвращает НОДУ, не строку как innerHTML
    const reservoir = renderReservoir(item, index) // 6
    container.appendChild(reservoir);
  })
}

// 6
// по сути этот метод является КОМПОНЕНТОМ - он просто рисует разметку с теми данными, которые в него пришли, и больше ничего не знает
const renderReservoir = (item, index) => {
  // имя резервуара
  const name = item?.name || `№${index + 1}`
  // объем резервуара
  const volume = item?.volume || 0
  // топливо в резервуаре
  const fuel = getFuelData(item?.fuel)?.name

  // определение уровня в резервуаре по сути в px, но сами px мы тут не пишем, просто число пикселей
  const reservoirHeight = heightReservoirSquare * volume / maxVolume // (7)

  const reservoir = `
    <li class="reservoir-item">
      <div class="reservoir-title">
          <span>Масса</span>
          <span class="weight-reservoir">${volume}</span>
      </div>
      <div class="reservoir-content">
          <div class="reservoir-mass ${validation(volume, minFuelValue, maxFuelValue) ? 'reservoir-mass_green' : 'reservoir-mass_red'}"></div>
          <div class="reservoir-flask">
              <div class="flask-basement"></div>
              <div class="flask-content">
                  <div class="flask-mesure">
                      <span class="mesure-line"></span>
                      <span class="mesure-line"></span>
                      <span class="mesure-line"></span>
                  </div>
                  <div
                    class="flask-fuel-level"
                    style="height: ${reservoirHeight}px; margin-top: ${heightReservoirSquare - reservoirHeight}px"
                  ></div>
              </div>
              <div class="flask-basement"></div>
          </div>
      </div>
      <div class="reservoir-info">
          <div class="percent-square"><span class="percent-reservoir">${volume * 100 / maxVolume}%</span></div>
          <span>Уровень топлива<br>"${fuel}"<br>в резервуаре "${name}" </span>
      </div>
    </li>
  `

  // https://doka.guide/html/template/
  const template = document.createElement('template');
  template.innerHTML = reservoir
  return template.content
}

const renderFooter = () => {
  const validation = `
    <li class="footer-info-container">
      <div class="footer-info-square footer-info-square_green"></div>
      <span>${minFuelValue} < МАССА < ${maxFuelValue}</span>
    </li>
    <li class="footer-info-container">
      <div class="footer-info-square footer-info-square_red"></div>
      <span>МАССА < ${minFuelValue} <br> МАССА > ${maxFuelValue} </span>
    </li>
  `
  const container = document.querySelector('.footer-info-list')
  container.innerHTML = ''
  const template = document.createElement('template');
  template.innerHTML = validation
  container.appendChild(template.content);
}

// слушаем пользовательское событие клик по кнопке
// если клик (именно КЛИК, а не что-то иное) случилось, то вызываем функцию onBtnClick
uploadBtn.addEventListener('click', () => onBtnClick()) // 2

minInput.addEventListener('input', (event) => onInputChange(event))
maxInput.addEventListener('input', (event) => onInputChange(event))

renderFooter()