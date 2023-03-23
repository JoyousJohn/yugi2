function removeMonsterFromHandVar(who, monsterName) {
    //console.log("Removing " + monsterName + " from " + who + "'s hand")
    window[who]['monsters'] = remove(window[who]['monsters'], monsterName)
    //getHand(who).find('div[data-card-name="' + monsterName + '"]').fadeOut();
}

function updateCardImage(elm) {
    var cardName = $(elm).attr('data-card-name')
    $(elm).find('img').attr('src', 'cards/' + cards[cardName]['file'])
}

function clearHand(who) {
    $('#' + who + '-hand').empty();
}




























function random(list) {
    return list[Math.floor(Math.random()*list.length)]
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