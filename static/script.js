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
            <td>
                <div class="form-check form-switch">
                    <input class="form-check-input status-switch" type="checkbox">
                </div>
            </td>
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
            var status = row.cells[2].querySelector('.status-switch').checked;
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
            <td>
                <div class="form-check form-switch">
                    <input class="form-check-input status-switch" type="checkbox" ${snippet.status ? 'checked' : ''}>
                </div>
            </td>
            <td contenteditable="true">${snippet.snippetText}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="copySnippetText(this)">Copy</button>
                <button class="btn btn-danger btn-sm" onclick="deleteRow(this)">Delete</button>
            </td>
        `;
        tableBody.appendChild(newRow);
    });

    // Set to keep track of detected trigger phrases
    const detectedTriggers = new Set();

    // Detect trigger phrases in the prompt textarea and append formatted snippet text
    const promptTextarea = document.getElementById('prompt');
    promptTextarea.addEventListener('input', function() {
        const promptText = promptTextarea.value;
        // Check if prompt ends with a period
        if (promptText.endsWith('.')) {
            storedSnippets.forEach(function(snippet) {
                const triggerPhrase = snippet.triggerPhrase;
                const snippetText = snippet.snippetText;
                if (promptText.includes(triggerPhrase) && !detectedTriggers.has(triggerPhrase)) {
                    appendFormattedSnippetToPrompt(snippet);
                    detectedTriggers.add(triggerPhrase); // Mark as detected
                }
            });
        }
    });

    // Function to append formatted snippet text to the prompt textarea
    function appendFormattedSnippetToPrompt(snippet) {
        const formattedSnippet = `\n${snippet.sectionTitle}\n${snippet.snippetText}`;
        promptTextarea.value += formattedSnippet;
    }

    // Toggle "In Chair mode"
    const chairModeToggle = document.getElementById('chairModeToggle');
    chairModeToggle.addEventListener('change', function() {
        // Add functionality for chair mode toggle if needed
    });

    // Template actions
    window.clearTemplate = function() {
        document.getElementById('templateTextarea').value = '';
    }

    window.saveTemplate = function() {
        const templateContent = templateTextarea.value;
        localStorage.setItem('templateContent', templateContent);
        alert('Template saved!');
    }

    function loadTemplate() {
        const savedTemplateContent = localStorage.getItem('templateContent');
        if (savedTemplateContent !== null) {
            templateTextarea.value = savedTemplateContent;
        }
    }

    loadTemplate();

    // Recording functionality
    let mediaRecorder;
    let audioChunks = [];
    const recordButton = document.getElementById('recordButton');
    const pauseButton = document.createElement('button');
    pauseButton.textContent = 'Pause';
    pauseButton.classList.add('btn', 'btn-warning');
    pauseButton.style.display = 'none';
    recordButton.after(pauseButton);

    const recordingPanel = document.getElementById('recordingPanel');
    const recordingTimer = document.getElementById('recordingTimer');
    let timerInterval;
    let isPaused = false;
    let elapsedTime = 0;
    let stream; // Variable to hold the stream globally
    let animationFrameId; // Variable to hold the requestAnimationFrame id

    recordButton.addEventListener('click', function() {
        if (recordButton.classList.contains('recording')) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    pauseButton.addEventListener('click', function() {
        if (isPaused) {
            resumeRecording();
        } else {
            pauseRecording();
        }
    });

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(str => {
                stream = str; // Store the stream globally
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                audioChunks = [];

                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    audio.play();
                });

                recordButton.classList.add('recording');
                recordButton.textContent = 'Stop';
                pauseButton.style.display = 'inline-block';
                recordingPanel.style.display = 'block';
                startTimer();

                visualize();
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
            });
    }

    function stopRecording() {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop()); // Stop all tracks in the stream
        recordButton.classList.remove('recording');
        recordButton.textContent = 'Record';
        pauseButton.style.display = 'none';
        recordingPanel.style.display = 'none';
        stopTimer();
        isPaused = false;
        elapsedTime = 0;
        cancelAnimationFrame(animationFrameId); // Stop the visualizer animation
    }

    function pauseRecording() {
        mediaRecorder.pause();
        isPaused = true;
        pauseButton.textContent = 'Resume';
        stopTimer();
        cancelAnimationFrame(animationFrameId); // Stop the visualizer animation
    }

    function resumeRecording() {
        mediaRecorder.resume();
        isPaused = false;
        pauseButton.textContent = 'Pause';
        startTimer();
        visualize(); // Restart the visualizer animation
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            elapsedTime++;
            recordingTimer.textContent = formatTime(elapsedTime);
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function visualize() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = document.getElementById('visualizer');
        const canvasCtx = canvas.getContext('2d');

        function draw() {
            if (mediaRecorder.state === 'inactive' || isPaused) {
                cancelAnimationFrame(animationFrameId); // Stop animation if paused or recording stopped
                return;
            }

            const WIDTH = canvas.width;
            const HEIGHT = canvas.height;

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = '#f3f3f3';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = '#000';

            canvasCtx.beginPath();

            const sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * HEIGHT / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();

            animationFrameId = requestAnimationFrame(draw); // Request next frame for animation
        }

        // Connect the analyser to the media stream source
        audioCtx.createMediaStreamSource(stream).connect(analyser);

        // Start the initial animation
        draw();
    }


});
