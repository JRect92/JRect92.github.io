document.addEventListener('DOMContentLoaded', () => {
    const timestampForm = document.getElementById('timestampForm');
    const timestampEntries = document.getElementById('timestampEntries');
    const titleToggle = document.getElementById('titleToggle');

    let events = JSON.parse(localStorage.getItem('timestamps')) || [];
    let is24Hour = localStorage.getItem('is24Hour') === 'true';

    
// initialize service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js')
  });
} 
    
    // Toggle time format
    titleToggle.addEventListener('click', () => {
        is24Hour = !is24Hour;
        localStorage.setItem('is24Hour', is24Hour);
        titleToggle.textContent = `${is24Hour ? '24hr' : '12hr'} Timestamp Manager`;
        renderEntries();
    });

    // Convert time between 12hr and 24hr formats
    function convertTime(time, to24Hour) {
        if (!time) return time;
        
        const [hours, minutes] = time.split(':');
        const hoursNum = parseInt(hours);
        
        if (to24Hour) {
            // Already in 24hr format
            return time;
        } else {
            // Convert 24hr to 12hr
            const period = hoursNum >= 12 ? 'PM' : 'AM';
            const hours12 = hoursNum % 12 || 12;
            return `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`;
        }
    }

    // Format time entry for clipboard
    function formatTimeEntry(event) {
        const { title, startTime, endTime } = event;
        let formattedStart = startTime ? convertTime(startTime, is24Hour) : '';
        let formattedEnd = endTime ? convertTime(endTime, is24Hour) : '';
        
        if (startTime === endTime) {
            return `${formattedStart} - ${formattedEnd} ${title}`;
        } else if (!endTime || endTime === "") {
            return `${formattedStart} -   ${title}`;
        } else if (!startTime || startTime === "") {
            return `  - ${formattedEnd} ${title}`;
        }
        
        return `${formattedStart} - ${formattedEnd} ${title}`;
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('timestamps', JSON.stringify(events));
    }

    // Clear all entries
    function clearAllEntries() {
        if (confirm('Are you sure you want to delete all entries? This cannot be undone.')) {
            events = [];
            saveData();
            renderEntries();
        }
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

    // Render entries
    function renderEntries() {
        timestampEntries.innerHTML = '';
        events.forEach((event, index) => {
            const entry = document.createElement('div');
            entry.className = 'timestamp-entry';

            // Convert times for display
            const displayStartTime = event.startTime ? convertTime(event.startTime, is24Hour) : '';
            const displayEndTime = event.endTime ? convertTime(event.endTime, is24Hour) : '';

            entry.innerHTML = `
                <div class="timestamp-left">
                    <div class="timestamp-title" contenteditable="true" onblur="updateTitle(${index}, this.innerText)">${event.title}</div>
                    <div class="timestamp-times">
                        <div class="time-input-group">
                            <input type="time" value="${event.startTime}" onchange="updateTime(${index}, 'start', this.value)">
                            <div class="time-display">${displayStartTime}</div>
                        </div>
                        <div class="time-input-group">
                            <input type="time" value="${event.endTime}" onchange="updateTime(${index}, 'end', this.value)">
                            <div class="time-display">${displayEndTime}</div>
                        </div>
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
        renderEntries(); // Re-render to update the displayed times
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

    // Add event listeners
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
    document.getElementById('clearButton').addEventListener('click', clearAllEntries);

    // Initialize title based on saved preference
    titleToggle.textContent = `${is24Hour ? '24hr' : '12hr'} Timestamp Manager`;

    // Load initial data
    renderEntries();
});
