const cards = ['fa-diamond', 'fa-paper-plane-o', 'fa-anchor', 'fa-bolt',
  'fa-cube', 'fa-anchor', 'fa-leaf', 'fa-bicycle', 'fa-diamond', 'fa-bomb',
  'fa-leaf', 'fa-bomb', 'fa-bolt', 'fa-bicycle', 'fa-paper-plane-o', 'fa-cube'
];
const cardClassShow = 'open show';
const cardClassMatch = 'match';
const cardClassBase = 'card';
const starRatingMoves = 10;
const starRatingMin = 1;
const starRatingMax = 3;
const pageCards = document.querySelectorAll('.deck .card');
let openedCards = [];
let correctOpenedCards = [];
let startingTime = 0;
let endingTime = 0;
let gameStarted = false;
let movesCount = 0;

/**  Resets cards to the start condition*/
function resetCards() {
  openedCards = [];
  correctOpenedCards = [];
  const shuffledCards = shuffle(cards);
  for (let i = 0; i < pageCards.length; i++) {
    pageCards[i].className = 'card';
    pageCards[i].firstElementChild.className = 'fa ' + shuffledCards[i];
  }
}

/**  Resets the game to the start condition*/
function resetGame() {
  setMovesCount(0);
  startingTime = 0;
  gameStarted = false;
  endingTime = 0;
  resetCards();
}


document.addEventListener('DOMContentLoaded', function() {
  resetGame();
});

$('.restart').on('click', function() {
  resetGame();
});

$('.deck .card').on('click', cardClick);

/** Fills modal form with duration and star number */
$('#gameEndModal').on('show.bs.modal', function(event) {
  const modal = $(this);
  modal.find('#game-time').text('Game time: ' + msToTime(endingTime - startingTime));
  const stars = document.querySelector('.score-panel .stars').getElementsByTagName('li');
  const modalStars = document.querySelector('.stars-result').getElementsByTagName('li');
  for (let i = 0; i < stars.length; i++) {
    modalStars[i].className = stars[i].className;
  }
})

/** Shuffle function from http://stackoverflow.com/a/2450976 */
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/** Adds input class to a basic card class */
function changeCardState(target, newClass) {
  $(target).attr('class', cardClassBase).addClass(newClass);
}

/** Updates moves count and calculates star rating */
function setMovesCount(cnt) {
  movesCount = cnt;
  $('.moves')[0].innerText = cnt;
  setStarRating(starRatingMax - Math.floor(cnt / starRatingMoves));
}

/** Uses when 2 cards are matching */
function cardsMatches(card1, card2) {
  changeCardState(card1, cardClassMatch);
  changeCardState(card2, cardClassMatch);
  correctOpenedCards = correctOpenedCards.concat(openedCards);
  openedCards = [];
}

function setStarRating(rating) {
  if (rating >= starRatingMin && rating <= starRatingMax) {
    const starsChildren = $('.stars').children();
    for (let i = 0; i < starsChildren.length; i++) {
      if (i < rating) {
        starsChildren[i].className = '';
      } else {
        starsChildren[i].className = 'stars-off';
      }
    }
  }
}

function compareCards() {
  if (openedCards.length === 2) {
    const card1 = openedCards[0].firstElementChild;
    const card2 = openedCards[1].firstElementChild;
    if ($(card1).hasClass($(card2).attr('class'))) {
      cardsMatches(openedCards[0], openedCards[1])
      if (correctOpenedCards.length === 16) {
        gameEnd();
        return;
      }
    } else {
      changeCardState(openedCards[0], 'incorrectGuess');
      changeCardState(openedCards[1], 'incorrectGuess');
      openedCards = [];
    }
    console.log('comparecards');
    setMovesCount(movesCount + 1);
  } else {

  }
}

function saveOpenedCard(event) {
  if (openedCards.indexOf(event.target) === -1) {
    console.log(openedCards);
    openedCards.push(event.target);
    compareCards();
  }
}

function gameStart() {
  gameStarted = true;
  startingTime = performance.now();
}

function gameEnd() {
  endingTime = performance.now();
  $('#gameEndModal').modal('show');
  console.log('This code took ' + (endingTime - startingTime) + ' milliseconds.');
}

function cardClick(event) {
  if (event.target !== this)
    return;
  // Game starts with first opened card
  if (gameStarted === false) {
    gameStart();
  }
  if (correctOpenedCards.indexOf(event.target) === -1) {
    changeCardState(event.target, cardClassShow);
    // setTimeout uses to show card opening animation
    setTimeout(function() {
      saveOpenedCard(event);
    }, 1000);
  }
}

/** Converts duration to normal time */
function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}
