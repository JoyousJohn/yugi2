var deck;

var player;
var opponent;

var selectedCard;

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

function getCards(who, num) {

    var cardList = [];

    if (who === 'player') {
        cardList = deck;
    } else if (who === 'opponent') {
        cardList = (Object.keys(cards))
    }

    for (var i = 0; i < num; i++) {

        var card = random(cardList);
        addCardToHand(who, card)

        type = cards[card]['type']
        window[who][type].push(card)
    }

    console.log(getPhaseFormat() + " " + who + " draws a card")
}
function 
removeMonsterFromHand(who, monsterName) {
    //console.log("Removing " + monsterName + " from " + who + "'s hand")
    window[who]['monsters'] = remove(window[who]['monsters'], monsterName)
    //getHand(who).find('div[data-card-name="' + monsterName + '"]').fadeOut();
}

function getHand(who) { return $('#' + who + '-hand') }

function getField(who) { return $('#' + who + '-field') }

function getZoneElm(who, zoneNum) { return getField(who).find('[data-zone="' + zoneNum + '"]') }

function getCardElm(who, cardName) { return getHand(who).find('div[data-card-name="' + cardName + '"]').eq(0) } // or :first

function summonMonster(who, monsterName) {

    var firstFreeZone = getFirstFreeZone(who)
    print(getPhaseFormat() + " " + who + " summons monster " + monsterName + " in zone #" + firstFreeZone)

    var source = getCardElm(who, monsterName);
    var target = getZoneElm(who, firstFreeZone)
    moveCard(source, target)

    removeMonsterFromHand(who, monsterName)
    //setFieldCard(who, firstFreeZone, monsterName)

}

function moveCard(source, target) {

    //const sourceOffset = source.offset();
    //print("Source offset:")
    /*print(sourceOffset)
    print("Source position:")
    print(source.position())
    const targetOffset = target.position();*/

    const clone = source.clone();
    
    clone.css({
        position: 'absolute',
        margin: 0,
        top: source[0].offsetTop, // - 26,
        left: (source[0].offsetLeft) //- parseInt(source.css('margin-left')) //+ 11,
    });


    $(clone).appendTo(source.parent())
    //source.css('visibility', 'hidden');
    source.css('transform', 'scale(0)')

    /*print("Clone offset:")
    print($(clone).offset())
    print("Clone position:")
    print($(clone).position())*/


    clone.animate({

        top: target[0].offsetTop,
        left: target[0].offsetLeft

    }, 250, function() {

        clone.remove() 
        source.remove()
        updateCardImage(target)

    });

    var cardType = $(source).attr('data-card-type')
    var cardName = $(source).attr('data-card-name')
    $(target).attr('data-card-type', cardType)
    $(target).attr('data-card-name', cardName)

}

function updateCardImage(elm) {
    var cardName = $(elm).attr('data-card-name')
    $(elm).find('img').attr('src', 'cards/' + cards[cardName]['file'])
}

function setFieldCard(who, zoneNum, cardName) {

    var targetZone = getZone(who, zoneNum)
    //$(targetZone).hide(); //temporary
    var targetImage = $(targetZone).find('img')
    $(targetImage).attr('src', 'cards/' + cards[cardName]['file'])
    $(targetZone).attr('data-card-type', 'monster')
    $(targetZone).attr('data-card-name', cardName)
    //$(targetZone).fadeIn(); //temporary

}

// (int) Return the ID of the first available card zone
function getFirstFreeZone(who) {
    var div = getField(who)
    var zone;
    $(div).find('.main-zone').each(function() {
        var cardName = $(this).attr('data-card-name');
        if (cardName === "") {
            zone = $(this).attr('data-zone')
            return false;       
        }
    })
    //console.log("returning getFirstFreeZone " + zone)
    return zone;
}

// (int) Return how many free zones left
function getFreeZones(who) {
    var div = getField(who)
    var freeZones = 0;
    $(div).find('.main-zone').each(function() {
        var cardName = $(this).attr('data-card-name');
        if (cardName === "") {
            freeZones++;   
        }
    })
    //console.log("returning zonesleft: " + freeZones)
    return freeZones;
}

// Select some card
$(document).on('click', '#player-hand > .card', function() {

    if (selectedCard !== undefined) {
        $('.selected-card').removeClass('selected-card')
    }

    selectedCard = this;

    $(this).addClass('selected-card')
})

// Select caard on player's grid
$(document).on('click', '.player-field-grid > div', function() {

    if (selectedCard !== undefined) {
        print(selectedCard)

        moveCard($(selectedCard), $(this))

        $('.selected-card').removeClass('selected-card')
    }

})











function addCardToHand(who, card) {
    var imgSrc = cards[card]['file'];
    $('#' + who + '-hand').append('<div class="card" data-card-name="' + card + '"><img class="card-img" src="cards/' + imgSrc + '"></div>');
}

function clearHand(who) {
    $('#' + who + '-hand').empty();
}

function random(list) {
    return list[Math.floor(Math.random()*list.length)]
}