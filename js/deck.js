function addToDeck(newCard, manuallyAdded) { // newCard: jQuery div card elm to add manuallyAdded: true when new card manually clicked

    id = $(newCard).attr('id');

    // If card already in deck add 1 to the quantity
    if ($('#player-deck > div#' + id).length) {

        var targetCard = $('#player-deck > div#' + id)
        console.log(targetCard)
        var newCount = parseInt(targetCard.attr('quant')) + 1

        console.log("quant: " + targetCard.attr('quant'))
        console.log("new count: " + newCount)

        $(targetCard).attr('quant', newCount)
        $(targetCard).find('p').text('x' + newCount)

        if (newCount === 3) $('#deck-selector > div#' + id).remove(); // Remove card from selection if now 3rd copy in deck
    
    // Else if new card add it to the deck
    } else {
        
        $(newCard).attr('quant', 1); // To remove quant 3 from right side
        if (manuallyAdded) $(newCard).append('<p>x1</p>') // If manually selected add quant

        $('#player-deck').append(newCard);
    }

    setBuildingDeckSize(getBuildingDeckSize() + 1) // Update deck size
    
}

function buildDecks() {

    $('#homescreen').hide(); 
    $('#deck-builder').show();

    var totalCount = 0;

    cardList = JSON.parse(localStorage.getItem('deck'))

    // Popular current deck list (left side)
    for (const cardInDeck in cardList) {

        var quant = cardList[cardInDeck];
        console.log(cardInDeck + ": " + quant)
        totalCount += parseInt(quant);
        var newCard = $('<div><img class="card-img deck-builder-card" src="cards/' + cards[cardInDeck].file + '"><p>x' + quant + '</p></div>');
        $(newCard).prop('id', cardInDeck);
        $(newCard).attr('quant', quant);
        //addToDeck(newCard)
        $('#player-deck').append(newCard);
        
    }

    // Populate cards available to add list (right side)
    for (const card in cards) { // cards = global object of all cards

        var quantAvailable = 3;

        if (cardList && card in cardList) { // If cardList (the JSON deck in localStorage is set and card is in the current deck)
            var numOfCardInDeck = cardList[card]; 
            if (numOfCardInDeck) { 
                quantAvailable -= numOfCardInDeck
                if (quantAvailable === 0) continue // Skip card if none available
            }
        }

        var newCard = $('<div><img class="card-img deck-builder-card" src="cards/' + cards[card].file + '"></div>');
        $(newCard).prop('id', card);
        $(newCard).attr('quant', quantAvailable);
        $(newCard).append('<p> x' + quantAvailable +' available</p>')
        $('#deck-selector').append(newCard);

    }

    setBuildingDeckSize(totalCount) // Update top info label
}

function clearDeck() { // Reset entire deckc
    localStorage.removeItem('deck');
    $('#player-deck').empty();
    $('#deck-selector').empty();
    buildDecks(); // Refresh DOM
}

function doneSelecting() { // Done selecting, save the deck
    $('#homescreen').show(); 
    $('#deck-builder').hide();
    $('#deck-selector').empty();

    // If deck builder is empty don't set localStorage deck
    if (!getBuildingDeckSize()) return;

    // Loop through each card to add to localStorage
    var deckList = {}
    $('#player-deck > div').each(function() { 
        var quant = $(this).attr('quant');
        var cardId = $(this).attr('id');
        deckList[cardId] = quant;    
        console.log("a" + deckList[cardId])  
    });
    console.log(deckList)
    localStorage.setItem('deck', JSON.stringify(deckList))
    $('#player-deck').empty(); // Clear player's deck selection for the next time changing it
}

$(document).on('click', '#deck-selector > div', function() { // When adding a card to deck

    if (getBuildingDeckSize() === 60) return // Do nothing if deck full
    var clone = $(this).clone()
    clone.find('p').remove() // Remove paragraph showing quant
    addToDeck(clone, true) // manuallyAdded: true to update visual quantity label

    var newQuantAvailable = $(this).attr('quant') - 1;
    if (newQuantAvailable === 0) { // If none available remove from right side list
        $(this).remove();
    } else {
        $(this).find('p').text('x' + newQuantAvailable + ' available');
        $(this).attr('quant', newQuantAvailable);
    }

})

function getBuildingDeckSize() { // Return deck being edited
    return parseInt($('#card-count').attr('card-Count'))
}

function setBuildingDeckSize(newSize) { // Update deck size
    $('#card-count').attr('card-Count', newSize);
    $('#card-count').text('Deck size: ' + newSize + '/60')
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