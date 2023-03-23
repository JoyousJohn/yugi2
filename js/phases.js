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

    var currentHand = [...computer['monsters']]
    for (var m in currentHand) {

        if (!getFreeZones('computer')) {
            console.log("computer has no free zones left, stopping summons")
            break;
        }

        var monsterName = currentHand[m];
        summonMonster('computer', monsterName)
        //removeMonsterFromHand('computer', monsterName)
        await sleep(100);
    }

    setPhase(3) // Battle Phase

    setPhase(4) // Main Phase 2

    setPhase(5) // End Phase
    await sleep(1000)

    console.log("[" + phases[phase]['phaseName'] + " Phase] Computer ends their turn")

    playerTurn();

}

function updateTurn(newTurn) { 
    turn = newTurn
    turn ? print("Turn set to 1 (computer's)") : print("Turn set to 0 (player's)")
    turn ? $('#turn-info').text("computer's turn") : $('#turn-info').text("Your turn") 
} 

function updatePhaseInfo() {
    $('#game-phase').text(phases[phase].phaseName)
}

function getPhaseFormat() {
    return "[" + phases[phase]['phaseName'] + "]"
}

function requestEndTurn() {
    if (turn === 0) {
        if (printMoves) print(getPhaseFormat() + " Player ends their turn")
        computerTurn();
    } else {
        alert('not your turn')
    }
}

function prepareGame() {
    $('#homescreen').hide(); 
    $('#summon-options').hide();
    $('#viewport').show();
    player = { 'monsters': [], 'spells': [], 'traps': []}
    computer = { 'monsters': [], 'spells': [], 'traps': []}
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
    clearHand('player');
    clearHand('computer');
    player = null;
    computer = null;

    // Clear & reset all fields
    $('.card-zone-square').each(function() {
        $(this).attr('data-card-type', "")
        $(this).attr('data-card-name', "");
        $(this).removeAttr('style') // remove pos: relative and transform added by .flip. Not doing this moves card to 0, 0 of viewport on moveCard
        $(this).find('img').removeAttr('src')
        $(this).find('.card-zone.main-zone').css('transform', '') // Remove def pos rotation
        $(this).find('.front, .back').removeAttr('style') // Unit the .flip called on cards
    })
}
