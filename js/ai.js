// Returns (boolean) defense mode, (boolean) face-down
function AICalcMonsterPosition(monsterName) {

    const atk = cards[monsterName]['atk']
    const def = cards[monsterName]['def']

    if (getNumOfMonstersOnField('computer') === 0) {
        return {'isDefense': true, 'faceDown': true}; //'def-down'
    }

    if (def > atk) {
        return {'isDefense': true, 'faceDown': false}; //'def-up'
    }

    if (atk >= def) {
        return {'isDefense': false, 'faceDown': false}; //'atk'
    }

}