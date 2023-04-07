// Returns (boolean) defense mode, (boolean) face-down
function AICalcMonsterPosition(monsterName) {

    const atk = cards[monsterName]['atk']
    const def = cards[monsterName]['def']

    if (getNumOfMonstersOnField('computer') === 0) {
        return {'mode': 'defense', 'faceDown': true}; //'def-down'
    }

    if (def > atk) {
        return {'mode': 'defense', 'faceDown': false}; //'def-up'
    }

    if (atk >= def) {
        return {'mode': 'attack', 'faceDown': false}; //'atk'
    }

}