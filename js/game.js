var deck;

var player;
var computer;

var activeCard;
var selectedSquare;

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

function summonMonster(who, monsterName) {

    var firstFreeZone = getFirstFreeZone(who)
    print(getPhaseFormat() + " " + who + " summons monster " + monsterName + " in zone #" + firstFreeZone)

    var source = getHandCardElm(who, monsterName);
    var target = getSquareElm(who, firstFreeZone)
    moveCard(source, target)

    removeMonsterFromHandVar(who, monsterName)

}

async function moveCard(source, targetSquare, isDefense, faceDown) {

    var clone = source.clone();
    
    clone.css({
        position: 'absolute', //absolute
        margin: 0,
        top: source[0].offsetTop, // - 26,E
        left: (source[0].offsetLeft) //- parseInt(source.css('margin-left')) //+ 11,
    });

    $(clone).appendTo(source.parent())

    source.css('transform', 'scale(0)') // Make source invisible. Can't remove since also removes clone.
    targetSlot = targetSquare.find('div.card-zone')[0] // Get the actual card loc in card-square

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

    $(targetSlot).flip({
        'trigger': 'manual',
        'speed': -1, // To show no animation if set in defense mode. 1 works too, not sure why not 0
    })

    clone.transition({ 
        top: targetSlot.offsetTop,
        left: targetSlot.offsetLeft,
        rotate: isDefense && '90deg' || '0',
    }, 1000, 'ease', function() {
        clone.remove() 
        source.remove()
        updateCardImage(targetSquare)           
    });
 
    // Flip card if being set
    if (faceDown) {
        clone.find('.card-front, .card-back').transition({
            rotateY: '+=180deg',
            perspective: '50px'
        }, 800, function() {
            $(targetSlot).flip(true)
        });

    }
    
    //console.log(target.find('div.card-zone').flip('toggle'))
    //console.log($(target).find('div.card-zone'))

   // target.find('div.card-zone').flip('toggle');

    // Actually set the moved card in the DOM
    var cardType = $(source).attr('data-card-type')
    var cardName = $(source).attr('data-card-name')
    $(targetSquare).attr('data-card-type', cardType)
    $(targetSquare).attr('data-card-name', cardName)
    
    //console.log('waiting')
    //$(target).find('div.card-zone').flip() // Init flip
    //print('flipping')
   //await sleep(550)
    //print('toggling')
    //$(target).find('div.card-zone').flip('toggle');

}

// Select some card in player's hand
$(document).on('click', '#player-hand > .card', function() {

    if (activeCard !== null) {
        $('.active-card').removeClass('active-card')
    }

    activeCard = $(this);

    $(this).addClass('active-card')
})

// Select card on player's grid (placing the card)
$(document).on('click', 'div.card-zone-square', function() {

    if (activeCard !== null) {

        selectedSquare = $(this);
        console.log(selectedSquare)
        summonOptions = $('#summon-options')
        summonOptions.show();
        summonOptions.css('top', $(this).offset().top)
        summonOptions.css('left', $(this).offset().left)

        $('.active-card').removeClass('active-card')
    }

})

//$(document).on('click', '.summon-option', function() {

function summonOptionSelected(position) {

    $('#summon-options').hide();

    if (position === 'def-down') {
        faceDown = true;
    } else {
        faceDown = false;
    }

    if (position === 'def-up' || position === 'def-down') {
        isDefense = true;
        selectedSquare.find('div.card-zone.main-zone').css('transform', 'rotate(90deg)');
    } else {
        isDefense = false;
    }

    moveCard(activeCard, selectedSquare, isDefense, faceDown) // source, target
    removeMonsterFromHandVar('player', activeCard.attr('data-card-name'))

    activeCard = null;
    selectedSquare = null;

}











function addCardToHand(who, card) {
    var imgSrc = cards[card]['file'];
    cardElm = '<div class="card" data-card-name="' + card + '"><div class="card-relative" style="position: relative;"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div><div class="card-back"></div></div></div>'
    //cardElm = '<div class="card" data-card-name="' + card + '"><div class="card-relative" style="position: relative;"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div></div></div>'
    //cardElm = '<div class="card" data-card-name="' + card + '"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div></div>'
    $('#' + who + '-hand').append(cardElm);
}

