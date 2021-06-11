$(document).ready(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const ticket = urlParams.get('ticket')
    const service = window.location.origin + "/setup/umls-auth"
    const setupUrl = window.location.origin + `/annotate/setup-umls/?ticket=${ticket}&service=${service}`

    fetch(setupUrl)
        .then(response => response.text())
        .then(hasValidated => {
            localStorage.setItem("hasValidated", hasValidated == 'True')
        })
        .finally(() => window.close())
})
