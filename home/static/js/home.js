$(document).ready(function () {
    $('#try-demo').click(function () {
        setupDemo();
    });
});


function setupDemo() {
    $.ajax({
        type: 'POST',
        url: '~/setup-demo',
        data: {'csrfmiddlewaretoken': getCookie('csrftoken')},
        success: function (response) {
            var data = JSON.parse(response);

            // Store demo documents locally
            var documents = data['documents'];
            var documentCount = documents.length;
            if (documentCount > 1) {
                localStorage.setItem('documentOpenType', 'multiple');
            } else {
                localStorage.setItem('documentOpenType', 'single');
            }
            localStorage.setItem('documentCount', documentCount);

            for (var i = 0; i < documentCount; i++) {
                localStorage.setItem('fileName' + i, 'demo-document-' + i);
                localStorage.setItem('documentText' + i, documents[i]);
                localStorage.setItem('lineBreakType' + i, detectLineBreakType(documents[i]));
            }

            // Store demo config locally
            var config = data['config']; 
            localStorage.setItem('configText', config);

            // Move to anontation page for demo docs
            location.href = '/annotate';
        }
    });
}

function detectLineBreakType(text) {
    if (text.indexOf('\r\n') !== -1) {
        return 'windows';
    } else if (text.indexOf('\r') !== -1) {
        return 'mac';
    } else if (text.indexOf('\n') !== -1) {
        return 'linux';
    } else {
        return 'unknown';
    }
}
