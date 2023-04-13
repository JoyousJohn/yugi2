var deck;

var player = {'hand': [], 'field': []};
var computer = {'hand': [], 'field': []};

var activeCard = null; // So showAvailableZones isn't called in playerTurn Main Phase 1
var selectedSquare;

var printMoves = false;

// Add n cards to player/computer's hand
function getCards(who, num) {

    let cardList = [];

    if (who === 'player') {
        cardList = deck;
    } else if (who === 'computer') {
        cardList = (Object.keys(cards));
    }

    for (var i = 0; i < num; i++) {

        const cardName = random(cardList);
        addCardToHand(who, cardName)

        const cardType = cards[cardName]['type']
        window[who]['hand'][cardType].push(cardName)
    }

    if (printMoves) print(getPhaseFormat() + " " + who + " draws a card")
}

function summonMonster(who, monsterName) {

    const {mode, faceDown} = AICalcMonsterPosition(monsterName)
    const firstFreeZone = getFirstFreeZone(who)

    if (printMoves) print(getPhaseFormat() + " " + who + " summons monster " + monsterName + " in zone #" + firstFreeZone)

    const source = getHandCardElm(who, monsterName); // make sure the sourcec doesn't have class "clone"
    const target = getSquareElm(who, firstFreeZone)
    moveCard('computer', source, target, mode, faceDown)

    removeMonsterFromHandVar(who, monsterName)

}

// Move a card (from hand) to board position
async function moveCard(who, source, targetSquare, mode, faceDown) {

    let isDefense;
    if (mode === 'attack') {
        isDefense = false;
    } else if (mode === 'defense') {
        isDefense = true;
    }
    const isAttack = !isDefense;

    let isPlayer, isComputer;
    if (who === 'player') { 
        isPlayer = true; isComputer = false;
    } else if (who === 'computer') {
        isPlayer = false; isComputer = true;
    }

    const cardName = $(source).attr('data-card-name')
    const zoneNum = $(targetSquare).attr('data-zone')
    addToFeed('(debug) ' + who + " summons <em>" + cardName + "</em> in zone #" + zoneNum + ' in ' + mode + ' mode\n\n')

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
        'trigger': 'manual', // So isn't flipped on click
        //'speed': -1, // To show no animation if set in defense mode. 1 works too, not sure why not 0 // Is this even doing anything??
    })

    // Set target zone to sideways if in defense
    if (isDefense) targetZone.css('transform', 'rotate(90deg)'); 

    // Move the card
    clone.transition({ 
        top: targetZone[0].offsetTop,
        left: targetZone[0].offsetLeft,
        rotate: isDefense && '90deg' || '0', // Rotate sideways if is set in defense
        rotateX: 0 // Rotates perspective of card being held up. Only applies to computer currently as player is already 0. Check card.css. 
    }, 1000, 'ease', function() {
        clone.remove(); 
        source.remove();
        updateCardImage(targetSquare);  
        //updateFlipSpeed(targetZone, 500)  // Update how fast the card will be flipped after it's placed. newSpeed in ms.
        targetZone.show(); // Unhide if hidden by setting card face-down - can add if visible condition later
    });

    const faceUp = !faceDown;

    if (isComputer && faceUp) {
         
        targetZone.hide(); // Hide target zone so defense animation isn't shown
        zoneFlippedUp(true); // Set placed card-data to flipped face-up.
        //updateFlipSpeed(targetZone, 5000)
        //await sleep(100)
        cloneFlipYAnimation(); // Flip face-down card from opponent hand to face-up

    } else if (isComputer && faceDown) {
        targetZone.hide(); // Don't show placed card (which is face-down) until moving card animation has finished
        zoneFlippedUp(false); // Set status to flipped face-down
    }
 
    // Visually flip over moving card if player setting face-down
    if (isPlayer && faceDown) {

        targetZone.hide() // Hide target zone so flip over animation isn't shown - or is it to hide new card elm that's generated?
        zoneFlippedUp(false) // Set placed card-data to flipped face-down.
        //await sleep(100) // Without delay the flip above is visible <-- either this or .hide/.show would both work
        //updateFlipSpeed(targetZone, 500)
        cloneFlipYAnimation() // Flip face-up card from opponent hand to face-down

    } else if (isPlayer && faceUp) {
        // Note: don't need to targetZone.hide() since card already face-up and visible
        zoneFlippedUp(true)
    }

    // Set jquery.flip status
    function zoneFlippedUp(flippedUp) {
        targetZone.flip(!flippedUp) // Opposite since jquery.flip is if card is flipped down
        // print(monsterName + ' .flip status set to: ' + !flippedUp)
    }

    // Spin the card around if being flipped opposite face
    function cloneFlipYAnimation() {
        clone.find('.card-front, .card-back').transition({
            rotateY: '+=180deg',
            perspective: '50px'
        }, 800);
    }

    // Actually set the moved card in the DOM
    const cardType = $(source).attr('data-card-type')
    $(targetSquare).attr('data-card-type', cardType)
    $(targetSquare).attr('data-card-name', cardName)
    $(targetSquare).attr('data-card-position', mode)
    $(targetSquare).attr('data-turn-moved', turnCount)

    // Add card to global field var
    window[who]['field'][cardType].push({'zone': zoneNum, 'cardName': cardName, 'cardType': cardType})
}

// Only affects element if 'speed' field was changed in .flip init, i.e. if was set to -1, or 1, so .flip status can be set with no animation
async function updateFlipSpeed(flipElm, newSpeed) {
    flipElm = $(flipElm)
    flipElm.data('flip-model').setting.speed = 500; // Not sure if affects anything
    flipElm.find('div.front, div.back').css('transition', 'all ' + newSpeed + 'ms ease-out 0s') // Change transition speed
}

// Select some card in player's hand
$(document).on('click', '#player-hand > .card', function() {

    // If active card is selected then unselect
    if ($(this).is(activeCard)) {
        $('.active-card').removeClass('active-card');
        activeCard = null;
        hideSummonOptionsIfVisible();
        hidePositionChangeOptionsIfVisible();
        clearAvailableZones(); // Remove borders from available zones to place cards
        return; // Don't run code below
    }

    // Remove old active card
    if (activeCard !== null) {
        $('.active-card').removeClass('active-card');
        hideSummonOptionsIfVisible(); // Hide summon options if visible. Should only be visible if active card selected...
        hidePositionChangeOptionsIfVisible(); // Hide position change options if visible. Should only be visible if active card selected...
    }

    activeCard = $(this); // Set new activeCard var
    $(this).addClass('active-card')

    if (turn === 0) { // If player's turn then show all available squares where card can be summoned

        showAvailableZones();

    }

})

// Select card on player's grid 
// 1) To place an active card 
// 2) Change position of placed monster 
// 3) eventually to activate traps/spells too
$(document).on('click', '.player-field-grid div.card-zone-square', function() {

    if (turn === 1) return; // Don't do anything if is computer's turn

    isAlreadySelected = selectedSquare && ($(this)).is(selectedSquare) // If selected square already selected. Need to make sure selectedSquare is set first before comparing or else error.

    // Click on field (square) zone to summon active card.
    // Confirm an active card is selected, selected square wasn't already selected (don't show summon menu twice), and target square is empty/available
    if (activeCard !== null && !isAlreadySelected && isSquareEmpty($(this))) { 

        // Probably a temp menu
        selectedSquare = $(this); // Sets global var
        summonOptions = $('#summon-options')
        summonOptions.show(); // Show summon menu (temp)
        summonOptions.css('top', $(this).offset().top)
        summonOptions.css('left', $(this).offset().left)
        return;

    }

    // Select card that was already placed, i.e. to change its position during main phase
    // Confirm athere's a card in the square and card wasn't placed this turn <-- ONLY APPLIES TO MONSTERS CHANGE THIS LATER (check that monster type is monster below and then check if turn count isn't the same as when monster was summoned)
    if (!isSquareEmpty($(this)) && $(this).attr('data-turn-moved') != turnCount) {

        resetActiveCardClass()
        activeCard = $(this);
        
        $(this).find('div.card-zone.main-zone').addClass('active-card') // Add fancy selected border
        positionOptions = $('#change-position-options')
        positionOptions.show()
        positionOptions.css('top', $(this).offset().top)
        positionOptions.css('left', $(this).offset().left)
        return;

    }

})

function summonOptionSelected(position) {

    resetActiveCardClass(); // Remove css from active card
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

