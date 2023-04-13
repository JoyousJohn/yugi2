var phase;
var turn;

var phases = [

    { 
        'phaseNum': 0,
        'phaseName': 'Draw Phase'
    },

    { 
        'phaseNum': 1,
        'phaseName': 'Standby Phase'
    },

    { 
        'phaseNum': 2,
        'phaseName': 'Main Phase 1'
    },

    { 
        'phaseNum': 3,
        'phaseName': 'Battle Phase'
    },

    { 
        'phaseNum': 4,
        'phaseName': 'Main Phase 2'
    },

    { 
        'phaseNum': 5,
        'phaseName': 'End Phase'
    },

    {
        'phaseNum': 6,
        'phaseName': 'Game Start'
    }

]

function startGame() {
    prepareGame();

    setPhase(6)

    getCards('player', 5)
    getCards('computer', 5)
    
    turn = Math.round(Math.random()); // 0: player, 1: computer
    p = getPhaseFormat()
    turn ? console.log(p + " Computer goes first") : console.log(p + " Player goes first")
    turn ? computerTurn() : playerTurn();

}

function playerTurn() {

    showPopup("YOUR TURN")

    updateTurn(0); // Set phase to player

    setPhase(0) // Draw

    getCards('player', 1)

    setPhase(1) // Standby

    setPhase(2) // Main Phase 1
    
}

async function computerTurn() {

    showPopup("COMPUTER'S TURN")

    updateTurn(1); // Set phase to computer

    setPhase(0) // Draw 

    getCards('computer', 1)
    await sleep(1000)

    setPhase(1); // Standby

    setPhase(2) // Main Phase 1

    var currentHand = [...computer['hand']['monsters']]
    for (var m in currentHand) {

        if (!getNumOfFreeZones('computer')) {
            if (printMoves) print("Computer has no free zones left, stopping summons")
            break;
        }

        var monsterName = currentHand[m];
        summonMonster('computer', monsterName)
        //removeMonsterFromHand('computer', monsterName)
        await sleep(500);
    }

    setPhase(3) // Battle Phase

    setPhase(4) // Main Phase 2

    setPhase(5) // End Phase
    await sleep(1000)

    console.log(getPhaseFormat() + " Computer ends their turn")

    playerTurn();

}

function updateTurn(newTurn) { 
    turn = newTurn
    turn ? print("Turn set to 1 (computer's)") : print("Turn set to 0 (player's)")
    turn ? $('#turn-info').text("computer's turn") : $('#turn-info').text("Your turn") 
} 

function updatePhaseInfo() {
    $('#game-phase').text(phases[phase].phaseName.toUpperCase())
}

function getPhaseFormat() {
    return "[" + phases[phase]['phaseName'] + "]"
}

function requestEndTurn() {
    if (turn === 0) {

        if (printMoves) print(getPhaseFormat() + " Player ends their turn")

        if (activeCard) { // If active card is currently selected
            $('.active-card').removeClass('active-card')
            clearAvailableZones(); // Remove borders of zones that were available
        }

        computerTurn();

    } else { alert('not your turn') }

}

function prepareGame() {
    $('#homescreen').hide(); 
    $('#summon-options').hide();
    $('#viewport').show();
    player = { 
        'hand': { 'monsters': [], 'spells': [], 'traps': []},
        'field': { 'monsters': [], 'spells': [], 'traps': []}
    }
    computer = { 
        'hand': { 'monsters': [], 'spells': [], 'traps': []},
        'field': { 'monsters': [], 'spells': [], 'traps': []}
    }
    buildPlayerDeck()
}

function setPhase(newPhase) {
    phase = newPhase;
    updatePhaseInfo();
}

function showPopup(text) {
    $('#turn-popup > span').text(text);
    $('#turn-popup').fadeIn();
    setTimeout(function(){ $('#turn-popup').fadeOut(); }, 1000);
}

function endGame() {
    $('#viewport').hide();
    $('#homescreen').show(); 
    $('#feed').text('');
    clearHand('player');
    clearHand('computer');
    player = null;
    computer = null;

    if (activeCard) clearAvailableZones() // Remove borders of available zones if active card was currently selected

    resetAllSquares()   
}

function addToFeed(gameMove) {
    //$('#feed').text(gameMove + '\n\n' + $('#feed').text())
    $('#feed').append(gameMove)
}

// Clear & reset all fields
function resetAllSquares(squareElm) {

    $('.card-zone-square').each(function() {

        $(this).find('div.card-zone').off(".flip"); // Removes flip click listener. Not having this means the card will flip (new transformY is added when summon option menu opens) when selecting a zone to summon a card after first placemenet. Took wayyyy too long to figure this out.

        $(this).attr('data-card-type', "")
        $(this).attr('data-card-name', "");

        $(this).find('div.card-zone').removeData("flip-model") // Unitialize .flip

        $(this).find('div.card-zone').removeData('transform') // Removes rotate 90deg and perspective 200px from transform data. Not sure why the perspective is this amount.
        $(this).find('div.card-zone').removeAttr('style') // Remove rotate 90deg, perspective 200px, and position relative from visible css attributes
        
        //$(this).removeAttr('style') // remove pos: relative added by .flip. Not doing this moves card to 0, 0 of viewport on moveCard
        $(this).find('img').removeAttr('src')
        $(this).find('img').removeAttr('style') // Remove backface-visibility from front > img. Not sure if this really affects anything.
        
        $(this).find('.front, .back').removeAttr('style') // Remove many props added by .flip
        $(this).find('.front, .back').removeData('transform') // Removes rotateY. Not sure if actually required. Should really just delete all elms and make sure ones on new game lol
    })

}