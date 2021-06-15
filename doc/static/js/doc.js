$(document).ready(() => {
    $('#show-hide-single-doc').click(() => {
        $('#singleGif').toggle()
    })

    $('#show-hide-conf-creator').click(() => {
        $('#confCreatorGif').toggle()
    })

    $('#show-hide-mutliple-docs').click(() => {
        $('#multpleDocsGif').toggle()
    })

    $('#show-hide-annotation').click(() => {
        $('#annotation-gif').toggle()
    })

    $('#show-hide-data-gen').click(() => {
        $('#dataGenGif').toggle()
    })

    $('#show-hide-predict').click(() => {
        $('#predictGif').toggle()
    })

    $('.doc-gif-toggle').click(function() {
        const el = $(this)[0]

        if (el.innerText == SHOW_TEXT) {
            el.innerText = HIDE_TEXT
        } else {
            el.innerText = SHOW_TEXT
        }
    })
})

const SHOW_TEXT = "Show GIF"
const HIDE_TEXT = "Hide GIF"
