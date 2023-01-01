//之後如果要更動API URL，可直些修改這裡，較易維護
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const displayModeSwitch = document.querySelector('#display-mode-switch')
let currentPage = 1

function renderMovieList(data) {
  if (dataPanel.dataset.displayMode === 'listMode') {
    let rawHTML = '<ul class="list-group">'
    data.forEach((item) => {
      rawHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>
            <h5 class="card-title">${item.title}</h5>
          </span>
          <span>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </span>
        </li>`
    })
    rawHTML += '</ul>'
    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.displayMode === 'cardMode') {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    })
    dataPanel.innerHTML = rawHTML
  }
}

function switchDisplayMode(mode) {
  if (dataPanel.dataset.displayMode === mode) return
  else {
    dataPanel.dataset.displayMode = mode
  }
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector
    ('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  //用邏輯運算子OR，取得已經有的資料或是給一個空陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
//利用slice把全部清單切成需要的頁數
function getMoviesByPage(page) {
  //三元運算子
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

displayModeSwitch.addEventListener('click', function onSwitchClicked(event) {
  if (event.target.matches('#card-mode-switch')) {
    switchDisplayMode('cardMode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode-switch')) {
    switchDisplayMode('listMode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //終止瀏覽器預設行為
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`); return
  }
  //重置分頁器
  currentPage = 1
  renderPaginator(filteredMovies.length)
  //重新輸出至畫面
  renderMovieList(getMoviesByPage(currentPage))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  currentPage = page
  renderMovieList(getMoviesByPage(currentPage))
})


//"..."為展開運算子，主要功用是「展開陣列元素」，取代跌代器寫法
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch((err) => console.log(err))