const cards = ['fa-diamond', 'fa-paper-plane-o', 'fa-anchor', 'fa-bolt',
  'fa-cube', 'fa-anchor', 'fa-leaf', 'fa-bicycle', 'fa-diamond', 'fa-bomb',
  'fa-leaf', 'fa-bomb', 'fa-bolt', 'fa-bicycle', 'fa-paper-plane-o',
  'fa-cube'
];
const cardClassShow = 'open show';
const cardClassMatch = 'match';
const cardClassBase = 'card';
const starRatingMoves = 10;
const starRatingMin = 1;
const starRatingMax = 3;
const pageCards = document.querySelectorAll('.deck .card');
let openedCards = []; // Uses for comparing 2 opened cards
let correctOpenedCards = []; // Saves all correct opened cards
let startingTime = 0;
let endingTime = 0;
let gameStarted = false;
let movesCount = 0;
let cardAnimationFinished = true;

document.addEventListener('DOMContentLoaded', function() {
  resetGame();
});

$('.restart').on('click', function() {
  resetGame();
});

/**  Resets the game to the start state*/
function resetGame() {
  setMovesCount(0);
  cardAnimationFinished = true;
  startingTime = 0;
  gameStarted = false;
  endingTime = 0;
  resetCards();
}

/**  Resets cards to the start state*/
function resetCards() {
  openedCards = [];
  correctOpenedCards = [];
  const shuffledCards = shuffle(cards);
  for (let i = 0; i < pageCards.length; i++) {
    pageCards[i].className = 'card';
    pageCards[i].firstElementChild.className = 'fa ' + shuffledCards[i];
  }
}

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

$('.deck .card').on('click', cardClick);
$('.deck .card').on(
  'webkitAnimationEnd oanimationend msAnimationEnd animationend',
  animationEnd);

function cardClick(event) {
  const curCard = event.target;

  // Do not allowed to click on card if it's already opened or
  // already guessed right or previous click function is not finished yet
  if ((curCard !== this) || (!cardAnimationFinished) || (correctOpenedCards.indexOf(
      curCard) != -1) || ((openedCards.indexOf(curCard) != -1)))
    return;
  // Game starts with first opened card
  if (gameStarted === false) {
    gameStart();
  }
  saveOpenedCard(event.target);
  openCard(curCard);
}

function openCard(target) {
  cardAnimationFinished = false;
  changeCardState([target], cardClassShow);
}

/** Starts to compare cards after open card animation is finished.*/
function animationEnd(event) {
  if ($(event.target).hasClass(cardClassShow) && (openedCards.length === 2)) {
    compareCards(event.target);
  } else {
    cardAnimationFinished = true;
  }
}

function gameStart() {
  gameStarted = true;
  startingTime = performance.now();
}

function changeCardState(targets, newClass) {
  for (let i = 0; i < targets.length; i++) {
    $(targets[i]).attr('class', cardClassBase).addClass(newClass);
  }
}

function saveOpenedCard(target) {
  if (openedCards.indexOf(target) === -1) {
    openedCards.push(target);
  }
}

/** Uses when 2 cards are matching */
function cardsMatches() {
  let continueGame = true;
  changeCardState(openedCards, cardClassMatch);
  correctOpenedCards = correctOpenedCards.concat(openedCards);
  if (correctOpenedCards.length === cards.length) {
    continueGame = false;
    gameEnd();
  }
  return continueGame;
}

function compareCards() {
  if (openedCards.length === 2) {
    const card1 = openedCards[0].firstElementChild;
    const card2 = openedCards[1].firstElementChild;
    if ($(card1).hasClass($(card2).attr('class'))) {
      if (!cardsMatches()) {
        return
      }
    } else {
      changeCardState(openedCards, 'incorrectGuess');
    }
    openedCards = [];
    setMovesCount(movesCount + 1);
  }
}

/** Updates moves count and calculates star rating */
function setMovesCount(cnt) {
  movesCount = cnt;
  $('.moves')[0].innerText = cnt;
  setStarRating(starRatingMax - Math.floor(cnt / starRatingMoves));
}

/** Sets star rating */
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

function gameEnd() {
  endingTime = performance.now();
  $('#gameEndModal').modal('show');
}

/** Fills modal form with duration and star number */
$('#gameEndModal').on('show.bs.modal', function(event) {
  const modal = $(this);
  modal.find('#game-time').text('Game time: ' + msToTime(endingTime -
    startingTime));
  const stars = document.querySelector('.score-panel .stars').getElementsByTagName(
    'li');
  const modalStars = document.querySelector('.stars-result').getElementsByTagName(
    'li');
  for (let i = 0; i < stars.length; i++) {
    modalStars[i].className = stars[i].className;
  }
})

/** Converts duration to normal time */
function msToTime(duration) {
  let milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}