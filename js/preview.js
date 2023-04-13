var hoverCardName;

$(document).on('mouseenter', '.card-zone-square, .card',

    // Mouse enter
    function() {

        if (hoverCardName || !$(this).attr('data-card-name')) { return; } // Don't do anything if card already selected

        hoverCardName = $(this).attr('data-card-name')

        const cardImgURL = 'cards/' + cards[hoverCardName]['file']

        //$('#preview-card').css('background-image', 'url(' + cardImgURL + ')')
        $('#preview-card-img').attr('src', cardImgURL)

        //console.log('Set preview-card to ' + cardImgURL)

    }

)

$(document).on('mouseleave', '.card-zone-square, .card', 

    // Mouse leave
    function() {

        hoverCardName = null;
        $('#preview-card-img').attr('src', null)

    }
)