// Returns (boolean) defense mode, (boolean) face-down
function AICalcMonsterPosition(monsterName) {

    const atk = cards[monsterName]['atk']
    const def = cards[monsterName]['def']

    if (getNumOfMonstersOnField('computer') === 0) {
        return 'defense-down'
    }

    if (def > atk) {
        return 'defense-up'
    }

    if (atk >= def) {
        return 'attack'
    }

}