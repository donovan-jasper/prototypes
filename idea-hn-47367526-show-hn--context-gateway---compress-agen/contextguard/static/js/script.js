document.addEventListener('DOMContentLoaded', function() {
    const compressBtn = document.getElementById('compress-btn');
    const expandBtn = document.getElementById('expand-btn');
    const toolOutput = document.getElementById('tool-output');
    const compressedContent = document.getElementById('compressed-content');
    const expandedContent = document.getElementById('expanded-content');

    compressBtn.addEventListener('click', function() {
        fetch('/compress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tool_output: toolOutput.value }),
        })
        .then(response => response.json())
        .then(data => {
            compressedContent.textContent = data.compressed_content;
        });
    });

    expandBtn.addEventListener('click', function() {
        fetch('/expand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ compressed_content_id: compressedContent.dataset.id }),
        })
        .then(response => response.json())
        .then(data => {
            expandedContent.textContent = data.expanded_content;
        });
    });
});
