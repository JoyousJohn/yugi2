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

async function moveCard(source, target, isDefense, faceDown) {

    var clone = source.clone();
    clone.addClass('clone')
    //clone.css('width', '200px')
    //clone.css('height', 'auto')
    
    clone.css({
        position: 'absolute', //absolute
        margin: 0,
        top: source[0].offsetTop, // - 26,E
        left: (source[0].offsetLeft) //- parseInt(source.css('margin-left')) //+ 11,
    });

    $(clone).appendTo(source.parent())

    source.css('transform', 'scale(0)') // Make source invisible. Can't remove since also removes clone.
    targetLoc = target.find('div.card-zone')[0] // Get the actual card loc in card-square

    /*clone.animate({

        top: targetLoc.offsetTop,
        left: targetLoc.offsetLeft,
        transform: 'scale(0) rotate(90deg)'

    }, 250, function() {

        clone.remove() 
        source.remove()
        updateCardImage(target)

    });*/

    //$(target).find('div.card-zone').flip() // Init flip
    //$(target).find('div.card-zone').flip('toggle');
    /*print(source)
    print($(source))
    source.flip()
    source.flip('toggle')*/

    clone.transition({ 
        top: targetLoc.offsetTop,
        left: targetLoc.offsetLeft,
        rotate: isDefense && '90deg' || '0',
        //perspective: '500px',
    }, 1500, 'ease', function() {
        clone.remove() 
        source.remove()
        updateCardImage(target)     
    });

    console.log(clone.find('div'))

    if (faceDown) {
        clone.find('.card-front, .card-back').transition({
            rotateY: '+=180deg',
            perspective: '50px'
        }, 800);
    }
    

    /*clone.find('.card-back').transition({
        rotateY: '180deg'
    }, 5000, 'ease');*/

    //console.log(target.find('div.card-zone').flip('toggle'))
    //console.log($(target).find('div.card-zone'))

   // target.find('div.card-zone').flip('toggle');

    var cardType = $(source).attr('data-card-type')
    var cardName = $(source).attr('data-card-name')
    $(target).attr('data-card-type', cardType)
    $(target).attr('data-card-name', cardName)
    //console.log('waiting')
    //$(target).find('div.card-zone').flip() // Init flip
    //print('flipping')
   //await sleep(550)
    //print('toggling')
    //$(target).find('div.card-zone').flip('toggle');

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

    if (selectedCard !== null) {
        $('.selected-card').removeClass('selected-card')
    }

    selectedCard = $(this);

    $(this).addClass('selected-card')
})

// Select card on player's grid (placing the card)
$(document).on('click', '.player-field-grid > div', function() {

    if (selectedCard !== null) {

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

    //console.log(position)

    if (position === 'def-down') {
        faceDown = true;
    } else {
        faceDown = false;
    }

    if (position === 'def-up' || position === 'def-down') {
        isDefense = true;
        selectedSlot.find('div.card-zone.main-zone').css('transform', 'rotate(90deg)');
    } else {
        isDefense = false;
    }

    moveCard(selectedCard, selectedSlot, isDefense, faceDown)
    removeMonsterFromHandVar('player', selectedCard.attr('data-card-name'))

    selectedCard = null;
    selectedSlot = null;

}











function addCardToHand(who, card) {
    var imgSrc = cards[card]['file'];
    cardElm = '<div class="card" data-card-name="' + card + '"><div class="card-relative" style="position: relative;"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div><div class="card-back"></div></div></div>'
    //cardElm = '<div class="card" data-card-name="' + card + '"><div class="card-relative" style="position: relative;"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div></div></div>'
    //cardElm = '<div class="card" data-card-name="' + card + '"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div></div>'
    $('#' + who + '-hand').append(cardElm);
}

function clearHand(who) {
    $('#' + who + '-hand').empty();
}

function random(list) {
    return list[Math.floor(Math.random()*list.length)]
}