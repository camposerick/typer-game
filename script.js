const url = 'https://api.quotable.io/random'
let outText = $('#outText')
let outAuthor = $('#outAuthor')

let quote
let wordsNumber
let charNumber
let author

const countdown = $('#countdown')
const timer = $('#timer')
const inputText = $('#inputText')
const tableBody = $('#tbody')
const btnSaveToScoreboard = $('#btnSaveToScoreboard')
const outScoreboard = $('#outScoreboard')

let initialCountdown = 4
let initialMilliseconds = 0
let milliseconds = 0
let seconds = 0
let minutes = 0
let startTime
let timeStart
let scoreboard = []

const btnTryAgain = $('#btnTryAgain')
const btnStart = $('#btnStart')
const btnClearHistory = $('#btnClearHistory')

const modalInstructions = new bootstrap.Modal(
  document.getElementById('modalInstructions')
)
const myModal = new bootstrap.Modal(document.getElementById('myModal'))

const myCollapse = document.getElementById('myCollapse')
const bsCollapse = new bootstrap.Collapse(myCollapse, {
  toggle: false
})

const getText = async () => {
  const res = await axios.get(url)
  quote = res.data.content
  author = res.data.author
  outText.text(quote)
  outAuthor.text(author)

  wordsNumber = quote.split(' ').length
  charNumber = quote.length
}

function showInstructions() {
  if (localStorage.getItem('showInstructions') != null) {
    return
  }

  modalInstructions.show()
  const btnCloseInstructions = $('#btnCloseInstructions')
  const btnRadioInstructions = $('#flexSwitchCheckDefault')

  btnCloseInstructions.on('click', () => {
    if (btnRadioInstructions.is(':checked')) {
      localStorage.setItem('showInstructions', 'false')
    }
  })
}

function startCountdown() {
  btnStart.hide()
  bsCollapse.show()
  initialCountdown--
  if (initialCountdown > 0) {
    countdown.text(initialCountdown)
    setTimeout(startCountdown, 1000)
  } else {
    countdown.text('GO!')
    startTimer()
    inputText.prop('disabled', false)
    inputText.focus()
    return
  }
}

function startTimer() {
  startTime = setInterval(() => {
    initialMilliseconds += 10

    let dateTimer = new Date(initialMilliseconds)

    milliseconds = ('0' + dateTimer.getUTCMilliseconds()).slice(-3, -1)
    seconds = ('0' + dateTimer.getUTCSeconds()).slice(-2)
    minutes = ('0' + dateTimer.getUTCMinutes()).slice(-2)

    timeStart = `${minutes}:${seconds}:${milliseconds}`
    return timeStart
  }, 10)
}

function showScoreboard() {
  if (localStorage.getItem('scoreboard') == null) {
    outScoreboard.hide()
  } else {
    outScoreboard.show()
    scoreboard = JSON.parse(localStorage.getItem('scoreboard'))
    let sortedScoreboard = scoreboard.sort((a, b) => {
      return b.cpm - a.cpm
    })
    let rank = 1
    sortedScoreboard.map(index => {
      let linha =
        '<tr>' +
        '<td>' +
        rank +
        '</td>' +
        '<td>' +
        index.cpm +
        '</td>' +
        '<td>' +
        index.wpm +
        '</td>' +
        '</tr>'

      tableBody.append(linha)
      rank++
    })
  }
}

function saveToScoreboard(wpm, cpm) {
  return function () {
    if (localStorage.getItem('scoreboard') != null) {
      scoreboard = JSON.parse(localStorage.getItem('scoreboard'))
    }
    scoreboard.push({ wpm, cpm })
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard))
    updateScoreboard()
    myModal.toggle()
  }
}

function updateScoreboard() {
  showScoreboard()
  tableBody.empty()
  let sortedScoreboard = scoreboard.sort((a, b) => {
    return b.wpm - a.wpm
  })
  let rank = 1
  sortedScoreboard.map(index => {
    let linha =
      '<tr>' +
      '<td>' +
      rank +
      '</td>' +
      '<td>' +
      index.cpm +
      '</td>' +
      '<td>' +
      index.wpm +
      '</td>' +
      '</tr>'

    tableBody.append(linha)
    rank++
  })
}

btnStart.on('click', startCountdown)

btnTryAgain.on('click', () => {
  location.reload()
})

btnClearHistory.on('click', () => {
  localStorage.removeItem('scoreboard')
  scoreboard = []
  updateScoreboard()
})

inputText.on('input', () => {
  let wpm = Math.ceil(
    (wordsNumber * 60) / (Number(minutes) * 60 + Number(seconds))
  )
  let cpm = Math.ceil(
    (charNumber * 60) / (Number(minutes) * 60 + Number(seconds))
  )

  let text = inputText.val()
  let textLength = text.length

  if (text === quote) {
    $('.modalResults').html(
      `<p>Your time: ${timeStart}<br>
      Words per minute: ${wpm}<br>
      Characters per minute: ${cpm}</p>`
    )
    myModal.toggle()
    clearInterval(startTime)
    inputText.prop('disabled', true)
    btnTryAgain.show()
    btnSaveToScoreboard.on('click', saveToScoreboard(wpm, cpm))
  }

  if (text === quote.substring(0, textLength)) {
    inputText.css('outline', '3px solid rgba(25, 240, 84, 0.8)')
  } else {
    inputText.css('outline', '3px solid rgba(240, 30, 30, 0.8)')
  }
})

$(document).ready(getText)
showInstructions()
btnTryAgain.hide()
showScoreboard()
