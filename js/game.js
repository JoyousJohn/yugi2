var deck;

var player = {'hand': [], 'field': []};
var computer = {'hand': [], 'field': []};

var activeCard;
var selectedSquare;

var printMoves = false;

// Add n cards to player/computer's hand
function getCards(who, num) {

    var cardList = [];

    if (who === 'player') {
        cardList = deck;
    } else if (who === 'computer') {
        cardList = (Object.keys(cards));
    }

    for (var i = 0; i < num; i++) {

        var card = random(cardList);
        addCardToHand(who, card)

        type = cards[card]['type']
        window[who]['hand'][type].push(card)
    }

    if (printMoves) print(getPhaseFormat() + " " + who + " draws a card")
}

function summonMonster(who, monsterName) {

    const {mode, faceDown} = AICalcMonsterPosition(monsterName)
    print(mode  + "   " + faceDown)

    var firstFreeZone = getFirstFreeZone(who)
    if (printMoves) print(getPhaseFormat() + " " + who + " summons monster " + monsterName + " in zone #" + firstFreeZone)

    let source = getHandCardElm(who, monsterName); // make sure the sourcec doesn't have class "clone"
    var target = getSquareElm(who, firstFreeZone)
    moveCard('computer', source, target, mode, faceDown)

    removeMonsterFromHandVar(who, monsterName)

}

// Move a card (from hand) to board position
async function moveCard(who, source, targetSquare, mode, faceDown) {

    if (mode === 'attack') {
        isDefense = false;
    } else if (mode === 'defense') {
        isDefense = true;
    }
    const isAttack = !isDefense;

    monsterName = source.attr('data-card-name')
    addToFeed('(debug) ' + who + " summons <em>" + monsterName + "</em> in zone #" + targetSquare.attr('data-zone') + ' in ' + mode + ' mode\n\n')

    const clone = source.clone();
    clone.attr('is-moving-clone', true) // Not used for anything, just debug helper
    source.attr('is-source-of-clone', true) // So the next getHandCardElm doesn't return the invisible (scale(0)) instead of next card in hand of the same monster

    clone.css({ // Move clone to location of source
        position: 'absolute',
        margin: 0,
        top: source[0].offsetTop,
        left: (source[0].offsetLeft)
    });

    clone.appendTo(source.parent()) // Add new clone to hand of cards to immitate being moved from hand

    source.css('transform', 'scale(0)') // Make source invisible. Can't remove since also removes clone.

    let targetZone = targetSquare.find('div.card-zone') // Get the actual card square inner zone location in card-square

    targetZone.flip({ // Init flip
        //'trigger': 'manual', // So isn't flipped on click
        //'speed': -1, // To show no animation if set in defense mode. 1 works too, not sure why not 0 // Is this even doing anything??
    })

    const faceUp = !faceDown
    if (isDefense) targetZone.css('transform', 'rotate(90deg)'); // Set target zone to sideways if in defense

    // Move the card
    clone.transition({ 
        top: targetZone[0].offsetTop,
        left: targetZone[0].offsetLeft,
        rotate: isDefense && '90deg' || '0', // Rotate sideways if is set in defense
        rotateX: 0 // Rotates perspective of card being held up. Only applies to computer currently as player is already 0. Check card.css. 
    }, 1000, 'ease', function() { // removed async temporarily?
        clone.remove() 
        source.remove()
        updateCardImage(targetSquare)   
        
        //updateFlipSpeed(targetZone, 500)  // Update how fast the card will be flipped after it's placed. newSpeed in ms.
        targetZone.show() // Unhide if hidden by setting card face-down - can add if visible condition later

    });

    // Visually flip card over to being visible if computer placing card face-up
    // NOTE: .flip booleans are opposite for opponent!!!
    if (who === 'computer' && faceUp) { // face-up
         
        targetZone.hide() // Hide target zone so defense animation isn't shown
        targetZone.flip(false) // Set placed card-data to flipped face-down.
        //updateFlipSpeed(targetZone, 5000)
        //await sleep(100)
        clone.find('.card-front, .card-back').transition({
            rotateY: '+=180deg',
            perspective: '50px'
        }, 800);

    } else if (who === 'computer' && faceDown) {
        targetZone.hide() // Don't show placed card (which is face-down) until moving card animation has finished
        targetZone.flip(true) // Set status to flipped upside-down
    }
 
    // Visually flip over moving card if player setting face-down
    if (who === 'player' && faceDown) {

        targetZone.hide() // Hide target zone so flip over animation isn't shown - or is it to hide new card elm that's generated?
        targetZone.flip(true) // Set placed card-data to flipped face-down.
        //await sleep(100) // Without delay the flip above is visible <-- either this or .hide/.show would both work
        //updateFlipSpeed(targetZone, 500)
        clone.find('.card-front, .card-back').transition({
            rotateY: '+=180deg',
            perspective: '50px'
        }, 800);

    } else if (who === 'player' && faceUp) {
        targetZone.flip(false)
    }

    // Actually set the moved card in the DOM
    const cardType = $(source).attr('data-card-type')
    const cardName = $(source).attr('data-card-name')
    $(targetSquare).attr('data-card-type', cardType)
    $(targetSquare).attr('data-card-name', cardName)
    $(targetSquare).attr('data-card-position', mode)

    // Add card to global field var
    const zoneNum = $(targetSquare).attr('data-zone')
    window[who]['field'][cardType].push({'zone': zoneNum, 'cardName': cardName, 'cardType': cardType})
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
        if (isSummonOptionsVisible()) $('#summon-options').hide(); // Hide summon options if visible. Should only be visible if active card selected...
    }

    activeCard = $(this); // Set new activeCard var

    $(this).addClass('active-card')

    const availableSquares = getAvailableSquaresElms()

    for (const square of availableSquares) {
        square.find('div.card-zone.main-zone').addClass('available-zone')
    }

})

// Select card on player's grid (placing the card)
$(document).on('click', '.player-field-grid div.card-zone-square', function() {

    if (turn === 1) return; // Don't do anything if is computer's turn

    isAlreadySelected = selectedSquare && ($(this)).is(selectedSquare) // Is selected square already selected. Need to make sure selectedSquare is set first before comparing or else error.

    if (activeCard !== null && !isAlreadySelected && isSquareEmpty($(this))) { // Confirm an active card is selected and target square is available

        // Probably a temp menu
        selectedSquare = $(this);
        summonOptions = $('#summon-options')
        summonOptions.show();
        summonOptions.css('top', $(this).offset().top)
        summonOptions.css('left', $(this).offset().left)

    }

})

function summonOptionSelected(position) {

    $('.active-card').removeClass('active-card') // Remove css from active caard
    $('#summon-options').hide(); // Remove summon options button menu
    
    clearAvailableZones() // Do this before moving card since getAvailableSquaresElms() wouldn't return target zone then

    if (position === 'def-down') {
        faceDown = true;
    } else if (position === 'atk' || position === 'def-up') {
        faceDown = false;
    }

    if (position === 'def-up' || position === 'def-down') {
        isDefense = true;
        mode = 'defense'
    } else if (position === 'atk') {
        isDefense = false;
        mode = 'attack'
    }

    moveCard('player', activeCard, selectedSquare, mode, faceDown) // source, target
    removeMonsterFromHandVar('player', activeCard.attr('data-card-name'))

    activeCard = null;
    selectedSquare = null;

}











function addCardToHand(who, card) {

    console.log(card)

    var imgSrc = cards[card]['file'];
    var type = cards[card]['type']

    if (who === 'player') { // Solves that really annoying computer moving a card that has to be flipped over bug. Apparently order of card face elm matters even though the divs have the right classes...
        var faceOrder = '<div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div><div class="card-back">'
    } else if (who === 'computer') {
        var faceOrder = '<div class="card-back"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div>'
    }

    cardElm = '<div class="card" data-card-name="' + card + '" data-card-type="' + type + '"><div class="card-relative" style="position: relative;">' + faceOrder + '</div></div>'

    //cardElm = '<div class="card" data-card-name="' + card + '"><div class="card-relative" style="position: relative;"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div></div></div>'
    //cardElm = '<div class="card" data-card-name="' + card + '"><div class="card-front"><img class="card-img" src="cards/' + imgSrc + '"></div></div>'
    $('#' + who + '-hand').append(cardElm);
}

