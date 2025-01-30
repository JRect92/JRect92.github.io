document.addEventListener('DOMContentLoaded', () => {
    const timestampForm = document.getElementById('timestampForm');
    const timestampEntries = document.getElementById('timestampEntries');

    let events = JSON.parse(localStorage.getItem('timestamps')) || [];

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('timestamps', JSON.stringify(events));
    }

    // Format time entry for clipboard
    function formatTimeEntry(event) {
        const { title, startTime, endTime } = event;
        
        if (startTime === endTime) {
            // If times are the same, format as "HH:MM - HH:MM Title"
            return `${startTime} - ${endTime} ${title}`;
        } else if (!endTime || endTime === "") {
            // If no end time, format as "HH:MM -   Title"
            return `${startTime} -   ${title}`;
        } else if (!startTime || startTime === "") {
            // If no start time, format as "  - HH:MM Title"
            return `  - ${endTime} ${title}`;
        }
        
        // Default format "HH:MM - HH:MM Title"
        return `${startTime} - ${endTime} ${title}`;
    }

    // Copy formatted text to clipboard
    function copyToClipboard() {
        // Format all events
        const formattedText = events
            .map(event => formatTimeEntry(event))
            .join('\n');
        
        // Create temporary textarea to copy text
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
        return now.toTimeString().slice(0, 5); // HH:MM format
    }

    // Update title
    window.updateTitle = (index, newTitle) => {
        events[index].title = newTitle.trim();
        saveData();
    };

    // Update time
    window.updateTime = (index, type, newTime) => {
        events[index][`${type}Time`] = newTime;
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

    // Add copy button event listener
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);

    // Load initial data
    renderEntries();
});
