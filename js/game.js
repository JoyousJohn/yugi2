var deck;

var player;
var computer;

var selectedCard;
var selectedSlot;

var cardDiv = ('<div class="card-zone main-zone"><img></div>');

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

// Add n cards to player/computer's hand
function getCards(who, num) {

    var cardList = [];

    if (who === 'player') {
        cardList = deck;
    } else if (who === 'computer') {
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

function removeMonsterFromHandVar(who, monsterName) {
    //console.log("Removing " + monsterName + " from " + who + "'s hand")
    window[who]['monsters'] = remove(window[who]['monsters'], monsterName)
    //getHand(who).find('div[data-card-name="' + monsterName + '"]').fadeOut();
}

function getHand(who) { return $('#' + who + '-hand') }

function getField(who) { return $('#' + who + '-field') }

function getZoneElm(who, zoneNum) { return getField(who).find('[data-zone="' + zoneNum + '"]') }

function getHandCardElm(who, cardName) { return getHand(who).find('div[data-card-name="' + cardName + '"]').eq(0) } // or :first

function summonMonster(who, monsterName) {

    var firstFreeZone = getFirstFreeZone(who)
    print(getPhaseFormat() + " " + who + " summons monster " + monsterName + " in zone #" + firstFreeZone)

    var source = getHandCardElm(who, monsterName);
    var target = getZoneElm(who, firstFreeZone)
    moveCard(source, target)

    removeMonsterFromHandVar(who, monsterName)
    //setFieldCard(who, firstFreeZone, monsterName)

}

function moveCard(source, target, isDefense) {

    console.log("isDefense: " + isDefense)

    const clone = source.clone();
    
    clone.css({
        position: 'absolute',
        margin: 0,
        top: source[0].offsetTop, // - 26,E
        left: (source[0].offsetLeft) //- parseInt(source.css('margin-left')) //+ 11,
    });

    $(clone).appendTo(source.parent())

    source.css('transform', 'scale(0)')
    targetLoc = target.find('div.card-zone')[0]

    /*clone.animate({

        top: targetLoc.offsetTop,
        left: targetLoc.offsetLeft,
        transform: 'scale(0) rotate(90deg)'

    }, 250, function() {

        clone.remove() 
        source.remove()
        updateCardImage(target)

    });*/

    clone.transition({ 
        top: targetLoc.offsetTop,
        left: targetLoc.offsetLeft,
        rotate: isDefense && '90deg' || '0',
    }, 500, 'ease', function() {
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
    var zone;
    var field = getField(who)
    $(field).find('.card-zone-square').each(function() {
        print($(this))
        var cardName = $(this).attr('data-card-name');
        if (cardName === "") {
            zone = $(this).attr('data-zone')
            return false;       
        }
    })
    return zone;
}

// (int) Return how many free zones left
function getFreeZones(who) {
    var freeZones = 0;
    var field = getField(who)
    $(field).find('.card-zone-square').each(function() {
        var cardName = $(this).attr('data-card-name');
        if (cardName === "") {
            freeZones++;   
        }
    })
    return freeZones;
}

// Select some card in player's hand
$(document).on('click', '#player-hand > .card', function() {

    if (selectedCard !== undefined) {
        $('.selected-card').removeClass('selected-card')
    }

    selectedCard = $(this);

    $(this).addClass('selected-card')
})

// Select card on player's grid (placing the card)
$(document).on('click', '.player-field-grid > div', function() {

    if (selectedCard !== undefined) {

        selectedSlot = $(this);
        summonOptions = $('#summon-options')
        summonOptions.show();
        summonOptions.css('top', $(this).offset().top)
        summonOptions.css('left', $(this).offset().left)

        //moveCard($(selectedCard), $(this))
        $('.selected-card').removeClass('selected-card')
    }

})

//$(document).on('click', '.summon-option', function() {

function summonOptionSelected(position) {

    $('#summon-options').hide();

    console.log(position)

    if (position === 'def-up' || position === 'def-down') {
        isDefense = true;
        selectedSlot.find('div').css('transform', 'rotate(90deg)');
    } else {
        isDefense = false;
    }

    moveCard(selectedCard, selectedSlot, isDefense)
    removeMonsterFromHandVar('player', selectedCard.attr('data-card-name'))

    selectedCard = null;
    //selectedSlot = null;

}











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