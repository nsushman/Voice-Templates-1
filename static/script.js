document.addEventListener('DOMContentLoaded', function() {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');

    function toggleDarkMode() {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        saveDarkModeSetting();
    }

    function saveDarkModeSetting() {
        localStorage.setItem('darkMode', darkModeToggle.checked);
    }

    darkModeToggle.addEventListener('change', toggleDarkMode);

    // Check system settings and set initial dark mode state
    const darkModeOn = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
        darkModeToggle.checked = savedDarkMode === 'true';
    } else {
        darkModeToggle.checked = darkModeOn;
    }
    toggleDarkMode(); // Initial setup based on system settings

    // Function to handle adding a new row
    document.getElementById('addRowBtn').addEventListener('click', function() {
        addNewRow();
    });

    function addNewRow() {
        var tableBody = document.querySelector('#snippetTable tbody');
        var newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td>
                <button class="btn btn-success btn-sm" onclick="copySnippetText(this)">Copy</button>
                <button class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button>
            </td>
        `;
        tableBody.appendChild(newRow);
        saveSnippetData();
    }

    // Function to copy snippet text to clipboard
    window.copySnippetText = function(button) {
        var row = button.closest('tr');
        var snippetText = row.querySelector('td:nth-child(4)').innerText.trim();
        navigator.clipboard.writeText(snippetText).then(function() {
            alert('Snippet text copied to clipboard!');
        }, function(err) {
            console.error('Unable to copy snippet text: ', err);
        });
    }

    // Function to delete a row
    window.deleteRow = function(button) {
        var row = button.closest('tr');
        row.remove();
        saveSnippetData();
    }

    // Function to save snippet data to localStorage
    function saveSnippetData() {
        var snippetRows = [];
        var rows = document.querySelectorAll('#snippetTable tbody tr');
        rows.forEach(function(row) {
            var sectionTitle = row.cells[0].innerText.trim();
            var triggerPhrase = row.cells[1].innerText.trim();
            var status = row.cells[2].innerText.trim();
            var snippetText = row.cells[3].innerText.trim();
            snippetRows.push({
                sectionTitle: sectionTitle,
                triggerPhrase: triggerPhrase,
                status: status,
                snippetText: snippetText
            });
        });
        localStorage.setItem('snippetRows', JSON.stringify(snippetRows));
    }

    // Load snippet data from localStorage on page load
    var storedSnippets = JSON.parse(localStorage.getItem('snippetRows')) || [];
    var tableBody = document.querySelector('#snippetTable tbody');
    storedSnippets.forEach(function(snippet) {
        var newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td contenteditable="true">${snippet.sectionTitle}</td>
            <td contenteditable="true">${snippet.triggerPhrase}</td>
            <td contenteditable="true">${snippet.status}</td>
            <td contenteditable="true">${snippet.snippetText}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="copySnippetText(this)">Copy</button>
                <button class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button>
            </td>
        `;
        tableBody.appendChild(newRow);
    });
});
