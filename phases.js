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
    getCards('opponent', 5)
    
    turn = Math.round(Math.random()); // 0: player, 1: opponent
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

    getCards('opponent', 1)
    await sleep(1000)

    setPhase(1); // Standby

    setPhase(2) // Main Phase 1

    var currentHand = [...opponent['monsters']]
    for (var m in currentHand) {

        if (!getFreeZones('opponent')) {
            console.log("Opponent has no free zones left, stopping summons")
            break;
        }

        var monsterName = currentHand[m];
        summonMonster('opponent', monsterName)
        //removeMonsterFromHand('opponent', monsterName)
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
    turn ? console.log("Turn set to 1 (opponent's)") : console.log("Turn set to 0 (player's)")
    turn ? $('#turn-info').text("Opponent's turn") : $('#turn-info').text("Your turn") 
} 

function updatePhaseInfo() {
    $('#game-phase').text(phases[phase].phaseName)
}

function getPhaseFormat() {
    return "[" + phases[phase]['phaseName'] + "]"
}

function requestEndTurn() {
    if (turn === 0) {
        console.log(getPhaseFormat() + " Player ends their turn")
        computerTurn();
    } else {
        alert('not your turn')
    }
}

function prepareGame() {
    $('#homescreen').hide(); 
    $('#viewport').show();
    player = { 'monsters': [], 'spells': [], 'traps': []}
    opponent = { 'monsters': [], 'spells': [], 'traps': []}
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
    clearHand('opponent');
    player = null;
    opponent = null;

    // Clear & reset all fields
    $('.main-zone').each(function() {
        $(this).attr('data-card-type', "")
        $(this).attr('data-card-name', "")
        $(this).find('img').removeAttr('src')
    })
}
