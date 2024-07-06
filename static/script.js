let snippetsData = JSON.parse(localStorage.getItem('snippetsData')) || [];

function renderTable() {
    const table = document.getElementById('snippetTable');
    table.innerHTML = '';
    snippetsData.forEach((snippet, index) => {
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td contenteditable="true" oninput="updateSnippet(${index}, 'title', this.innerText)">${snippet.title}</td>
            <td contenteditable="true" oninput="updateSnippet(${index}, 'trigger', this.innerText)">${snippet.trigger}</td>
            <td>
                <input type="checkbox" ${snippet.status ? 'checked' : ''} data-toggle="switch" data-on-text="On" data-off-text="Off" data-on-color="success" data-off-color="danger" onchange="updateSnippet(${index}, 'status', this.checked)">
            </td>
            <td>
                <button class="btn btn-link btn-sm" onclick="viewRow(${index})">View</button>
                <button class="btn btn-link btn-sm" onclick="copyRow(${index})">Copy</button>
                <button class="btn btn-link btn-sm" onclick="deleteRow(${index})">Delete</button>
            </td>
        `;
        $(newRow).find('[data-toggle="switch"]').bootstrapSwitch();
    });
}

function addRow() {
    const newSnippet = { title: 'New Title', trigger: 'New Trigger', status: true, content: '' };
    snippetsData.push(newSnippet);
    renderTable();
    saveSnippets();
}

function deleteRow(index) {
    snippetsData.splice(index, 1);
    renderTable();
    saveSnippets();
}

function updateSnippet(index, key, value) {
    snippetsData[index][key] = key === 'status' ? value : value.trim();
    saveSnippets();
}

function saveSnippets() {
    localStorage.setItem('snippetsData', JSON.stringify(snippetsData));
}

function viewRow(index) {
    document.getElementById('snippetContent').value = snippetsData[index].content;
}

function copyRow(index) {
    const snippet = snippetsData[index];
    navigator.clipboard.writeText(JSON.stringify(snippet));
    alert('Snippet copied to clipboard.');
}

function saveSnippetContent() {
    const activeRow = document.querySelector('#snippetTable tr.active');
    if (activeRow) {
        const index = Array.from(activeRow.parentNode.children).indexOf(activeRow);
        snippetsData[index].content = document.getElementById('snippetContent').value;
        saveSnippets();
        alert('Snippet content saved.');
    }
}

$(document).ready(function() {
    renderTable();
});

async function generate() {
    const prompt = document.getElementById('prompt').value;
    const response = await fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt })
    });
    const data = await response.json();
    alert(data.content);
}
