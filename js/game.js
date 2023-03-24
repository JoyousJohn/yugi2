var deck;

var player;
var computer;

var activeCard;
var selectedSquare;

var printMoves = false;

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

    if (printMoves) print(getPhaseFormat() + " " + who + " draws a card")
}

function summonMonster(who, monsterName) {

    var firstFreeZone = getFirstFreeZone(who)
    if (printMoves) print(getPhaseFormat() + " " + who + " summons monster " + monsterName + " in zone #" + firstFreeZone)

    var source = getHandCardElm(who, monsterName);
    var target = getSquareElm(who, firstFreeZone)
    moveCard('computer', source, target)

    removeMonsterFromHandVar(who, monsterName)

}

function moveCard(who, source, targetSquare, isDefense, faceDown) {

    var clone = source.clone();
    
    clone.css({
        position: 'absolute',
        margin: 0,
        top: source[0].offsetTop,
        left: (source[0].offsetLeft)
    });

    $(clone).appendTo(source.parent())

    source.css('transform', 'scale(0)') // Make source invisible. Can't remove since also removes clone.
    let targetSlot = targetSquare.find('div.card-zone')[0] // Get the actual card loc in card-square

    function b(c) {
        c.flip({
            //'trigger': 'manual',
            'speed': -1, // To show no animation if set in defense mode. 1 works too, not sure why not 0
        })
    }
    b($(targetSlot)) // Callback, w/o only affects last card moved by end of delay

    clone.transition({ 
        top: targetSlot.offsetTop,
        left: targetSlot.offsetLeft,
        rotate: isDefense && '90deg' || '0',
        rotateX: 0
    }, 1000, 'ease', function() {
        clone.remove() 
        source.remove()
        updateCardImage(targetSquare)     
        updateFlipSpeed(targetSlot, 500)  // newSpeed in ms
    });
 
    // Visually flip moving card if being set
    if (who === 'player' && faceDown) {
        clone.find('.card-front, .card-back').transition({
            rotateY: '+=180deg',
            perspective: '50px'
        }, 800, async function() {
            await sleep(100) // Din't show newly placed card until rotate + move animation finished
            $(targetSlot).flip(true)
            /*setTimeout(function() { // Alternate method
                $(targetSlot).flip(true)
            }, 100);*/
        });
    }

    // Set flip status to flipped if placed by computer
    if (who === 'computer') {
        setTimeout(function() {
            $(targetSlot).flip(true) // Set placed card-data to flipped face-down.
        }, 900);      
    }

    // Actually set the moved card in the DOM
    var cardType = $(source).attr('data-card-type')
    var cardName = $(source).attr('data-card-name')
    $(targetSquare).attr('data-card-type', cardType)
    $(targetSquare).attr('data-card-name', cardName)

}

async function updateFlipSpeed(flipElm, newSpeed) {
    flipElm = $(flipElm)
    flipElm.data('flip-model').setting.speed = 500; // Not sure if affects anything
    flipElm.find('div.front, div.back').css('transition', 'all ' + newSpeed + 'ms ease-out 0s') // Change transition speed
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
$(document).on('click', '.player-field-grid div.card-zone-square', function() {

    if (activeCard !== null && isSquareEmpty($(this))) { // Confirm an active card is selected and target square is available

        selectedSquare = $(this);
        summonOptions = $('#summon-options')
        summonOptions.show();
        summonOptions.css('top', $(this).offset().top)
        summonOptions.css('left', $(this).offset().left)

        $('.active-card').removeClass('active-card')
    }

})

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

    moveCard('player', activeCard, selectedSquare, isDefense, faceDown) // source, target
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

