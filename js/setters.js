// Populates deck variable from localStorage
function buildPlayerDeck() {

    if (localStorage.getItem('deck') === null) {
        deck = Object.keys(cards)
        //console.log(deck)
        return;
    }

    var buildingDeckList = []

    localDeck = JSON.parse(localStorage.getItem('deck'))
    cardList = Object.keys(localDeck)

    for (var c in cardList) {

        var quantOfThisCard = localDeck[cardList[c]]
        
        for (var i = 0; i < quantOfThisCard; i++) {
            buildingDeckList.push(cardList[c]) // cardList[c]: card name
        }

    }

    deck = buildingDeckList
    //console.log(buildingDeckList)
}

// Remove monster string from who.monsters array
function removeMonsterFromHandVar(who, monsterName) {
    if (printMoves) print("Removing " + monsterName + " from " + who + "'s hand")
    window[who]['monsters'] = remove(window[who]['monsters'], monsterName)
    //getHand(who).find('div[data-card-name="' + monsterName + '"]').fadeOut();
}

function updateCardImage(squareElm) {
    const cardName = $(squareElm).attr('data-card-name')
    $(squareElm).find('img').attr('src', 'cards/' + cards[cardName]['file'])
}

function clearHand(who) {
    $('#' + who + '-hand').empty();
}

function clearAvailableZones() {
    const availableSquares = getAvailableSquaresElms()
    for (const square of availableSquares) {
        square.find('div.card-zone.main-zone').removeClass('available-zone')
    }
}




























function random(list) {
    return list[Math.floor(Math.random()*list.length)]
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Remove first occurance of value from arr
function remove(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

function print(message) { console.log(message) }