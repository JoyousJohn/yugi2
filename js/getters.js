function getHand(who) { return $('#' + who + '-hand') }

function getField(who) { return $('#' + who + '-field') }

function getSquareElm(who, zoneNum) { return getField(who).find('[data-zone="' + zoneNum + '"]') }

function getHandCardElm(who, cardName) { 
    return getHand(who).find('div.card[data-card-name="' + cardName + '"]').not('[is-source-of-clone=true]').eq(0) 
}

// (int) Return the ID of the first available card zone
function getFirstFreeZone(who) {
    var zone;
    var field = getField(who)
    $(field).find('.card-zone-square').each(function() {
        //print($(this))
        var cardName = $(this).attr('data-card-name');
        if (cardName === "") {
            zone = $(this).attr('data-zone')
            return false;       
        }
    })
    return zone;
}

// (int) Return how many free zones left
function getNumOfFreeZones(who) {
    let freeZones = 0;
    const field = getField(who)
    $(field).find('.card-zone-square').each(function() {
        var cardName = $(this).attr('data-card-name');
        if (cardName === '') {
            freeZones++;   
        }
    })
    return freeZones;
}

// (int) Return how many monsters are on who's field
function getNumOfMonstersOnField(who) {
    return 6 - getNumOfFreeZones(who)
}

// (int) Return number of defense position monsters on who's field
function getNumOfDefPosMonstersOnField(who) {
    let defenseMonsters = 0;
    const field = window[who]['field']
    print(field)


    $(field).find('.card-zone-square').each(function() {
        var cardType = $(this).attr('data-card-type');
        var mode = $(this).attr('data-card-position');
        print(cardType + mode)
        if (cardType === 'monsters' && mode === 'defense') {
            defenseMonsters++;   
        }
    })
    return defenseMonsters;
}

function getAvailableSquaresElms() {
    let freeZones = []
    const field = getField('player')
    $(field).find('.card-zone-square').each(function() {
        if (isSquareEmpty($(this))) freeZones.push($(this))
    })
    return freeZones
}

// (boolean) Return if squareElm is empty
function isSquareEmpty(squareElm) {
    return squareElm.attr('data-card-name') === ''
}

function isSummonOptionsVisible() { return $('#summon-options').is(':visible') }

function isPositionChangeOptionsVisible() { return $('#change-position-options').is(':visible') }

function isAtkMenuVisible() { return $('#attack-menu').is(':visible') }