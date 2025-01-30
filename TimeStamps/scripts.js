document.addEventListener('DOMContentLoaded', () => {
    const timestampForm = document.getElementById('timestampForm');
    const timestampEntries = document.getElementById('timestampEntries');

    let events = JSON.parse(localStorage.getItem('timestamps')) || [];
    
    // Detect if user prefers 24-hour time format
    const prefers24Hour = new Intl.DateTimeFormat(navigator.language, {
        hour: 'numeric'
    }).formatToParts(new Date()).find(part => part.type === 'hour').value.length === 2;

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('timestamps', JSON.stringify(events));
    }

    // Format time entry for clipboard
    function formatTimeEntry(event) {
        const { title, startTime, endTime } = event;
        
        if (startTime === endTime) {
            return `${startTime} - ${endTime} ${title}`;
        } else if (!endTime || endTime === "") {
            return `${startTime} -   ${title}`;
        } else if (!startTime || startTime === "") {
            return `  - ${endTime} ${title}`;
        }
        
        return `${startTime} - ${endTime} ${title}`;
    }

    // Copy formatted text to clipboard
    function copyToClipboard() {
        const formattedText = events
            .map(event => formatTimeEntry(event))
            .join('\n');
        
        const textarea = document.createElement('textarea');
        textarea.value = formattedText;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            alert('Report copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text:', err);
            alert('Failed to copy text to clipboard');
        }
        
        document.body.removeChild(textarea);
    }

    // Convert time between 12h and 24h formats
    function convertTime(time, to24Hour) {
        if (!time) return time;
        
        const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
        
        if (to24Hour) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } else {
            let period = hours >= 12 ? 'PM' : 'AM';
            let hours12 = hours % 12 || 12;
            return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
    }

    // Format time for display
    function formatTimeForDisplay(time) {
        if (!time) return '';
        return prefers24Hour ? time : convertTime(time, false);
    }

    // Parse displayed time to 24h format for storage
    function parseTimeForStorage(time) {
        if (!time) return '';
        return prefers24Hour ? time : convertTime(time, true);
    }

    // Render entries
    function renderEntries() {
        timestampEntries.innerHTML = '';
        events.forEach((event, index) => {
            const entry = document.createElement('div');
            entry.className = 'timestamp-entry';

            entry.innerHTML = `
                <div class="timestamp-left">
                    <div class="timestamp-title" contenteditable="true" onblur="updateTitle(${index}, this.innerText)">${event.title}</div>
                    <div class="timestamp-times">
                        <input type="time" value="${event.startTime}" onchange="updateTime(${index}, 'start', this.value)">
                        <input type="time" value="${event.endTime}" onchange="updateTime(${index}, 'end', this.value)">
                        <button onclick="deleteEvent(${index})">Delete</button>
                    </div>
                </div>
                <div class="timestamp-right">
                    <button class="arrow-btn" onclick="moveEvent(${index}, -1)">▲</button>
                    <button class="arrow-btn" onclick="moveEvent(${index}, 1)">▼</button>
                </div>
            `;

            timestampEntries.appendChild(entry);
        });
    }

    // Add new event
    timestampForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('timestampName').value.trim();
        if (!title) return;

        const currentTime = getCurrentTime();
        events.push({ title, startTime: currentTime, endTime: currentTime });
        saveData();
        renderEntries();
        timestampForm.reset();
    });

    // Get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Update title
    window.updateTitle = (index, newTitle) => {
        events[index].title = newTitle.trim();
        saveData();
    };

    // Update time
    window.updateTime = (index, type, newTime) => {
        // Convert the input time to 24-hour format for storage
        const storedTime = parseTimeForStorage(newTime);
        events[index][`${type}Time`] = storedTime;
        saveData();
    };

    // Delete event
    window.deleteEvent = (index) => {
        if (confirm('Are you sure you want to delete this event?')) {
            events.splice(index, 1);
            saveData();
            renderEntries();
        }
    };

    // Move event
    window.moveEvent = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= events.length) return;

        [events[index], events[newIndex]] = [events[newIndex], events[index]];
        saveData();
        renderEntries();
    };

    // Clear all entries
    function clearAllEntries() {
        if (confirm('Are you sure you want to delete all entries? This cannot be undone.')) {
            events = [];
            saveData();
            renderEntries();
        }
    }

    // Add button event listeners
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
    document.getElementById('clearButton').addEventListener('click', clearAllEntries);

    // Load initial data
    renderEntries();
});
