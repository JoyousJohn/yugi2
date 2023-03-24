function getHand(who) { return $('#' + who + '-hand') }

function getField(who) { return $('#' + who + '-field') }

function getSquareElm(who, zoneNum) { return getField(who).find('[data-zone="' + zoneNum + '"]') }

function getHandCardElm(who, cardName) { return getHand(who).find('div[data-card-name="' + cardName + '"]').eq(0) } // or :first

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
        if (cardName === "") {
            freeZones++;   
        }
    })
    return freeZones;
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