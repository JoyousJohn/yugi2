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
    window[who]['hand']['monsters'] = remove(window[who]['hand']['monsters'], monsterName)
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

// Highlight available zones where cards can be placed on player field
function showAvailableZones() {
    const availableSquares = getAvailableSquaresElms()
    for (const square of availableSquares) {
        square.find('div.card-zone.main-zone').addClass('available-zone')
    }   
}

function hideSummonOptionsIfVisible() {
    if (isSummonOptionsVisible()) $('#summon-options').hide();
}

// Hide the position change buttons that show up when clicking placed monster
function hidePositionChangeOptionsIfVisible() {
    if (isPositionChangeOptionsVisible()) $('#change-position-options').hide();
}

function hideAtkMenuIfVisible() {
    if (isAtkMenuVisible()) $('#attack-menu').hide();
}

// Show any change position options that were hidden when showing valid position changes
function showAllPositionChanges() {
    $('#change-position-options button').each(function() {
        console.log($(this))
        if ($(this).is(':hidden')) $(this).show(); 
    })
}

// Remove CSS from active caard
function resetActiveCardClass() {
    $('.active-card').removeClass('active-card') 
}

// Only affects element if 'speed' field was changed in .flip init, i.e. if was set to -1, or 1, so .flip status can be set with no animation
async function updateFlipSpeed(flipElm, newSpeed) {
    flipElm = $(flipElm)
    flipElm.data('flip-model').setting.speed = 500; // Not sure if affects anything
    flipElm.find('div.front, div.back').css('transition', 'all ' + newSpeed + 'ms ease-out 0s') // Change transition speed
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