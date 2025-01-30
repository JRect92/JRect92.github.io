document.addEventListener('DOMContentLoaded', () => {
    const timestampForm = document.getElementById('timestampForm');
    const timestampTable = document.getElementById('timestampTable').querySelector('tbody');

    let events = JSON.parse(localStorage.getItem('timestamps')) || [];

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('timestamps', JSON.stringify(events));
    }

    // Render the table
    function renderTable() {
        timestampTable.innerHTML = '';
        events.forEach((event, index) => {
            const row = document.createElement('tr');
            row.draggable = true;

            row.innerHTML = `
                <td class="drag-handle">☰</td>
                <td>${event.title}</td>
                <td>${event.startTime || ''}</td>
                <td>${event.endTime || ''}</td>
                <td>
                    <button class="edit-btn" onclick="editEvent(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteEvent(${index})">Delete</button>
                </td>
            `;

            timestampTable.appendChild(row);
        });
    }

    // Add new event
    timestampForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('timestampName').value.trim();
        if (!title) return;

        const timeType = await promptTimeType();
        const time = timeType === 'current' ? getCurrentTime() : await promptManualTime();
        const timeCategory = await promptTimeCategory();

        const newEvent = { title, startTime: '', endTime: '' };
        if (timeCategory === 'start') newEvent.startTime = time;
        if (timeCategory === 'end') newEvent.endTime = time;
        if (timeCategory === 'instance') newEvent.startTime = newEvent.endTime = time;

        events.push(newEvent);
        saveData();
        renderTable();
        timestampForm.reset();
    });

    // Prompt for time type
    function promptTimeType() {
        return new Promise((resolve) => {
            const choice = confirm('Use current time? Press "Cancel" to use manual time.');
            resolve(choice ? 'current' : 'manual');
        });
    }

    // Get manual time
    function promptManualTime() {
        return new Promise((resolve) => {
            const time = prompt('Enter time in HH:MM format (24-hour clock):');
            resolve(time);
        });
    }

    // Prompt for time category
    function promptTimeCategory() {
        return new Promise((resolve) => {
            const choice = prompt('Is this a "start", "end", or "instance" time?');
            resolve(choice.toLowerCase());
        });
    }

    // Get current time
    function getCurrentTime() {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }

    // Edit an event
    window.editEvent = async (index) => {
        const event = events[index];
        const field = prompt('Edit "title", "start", or "end":').toLowerCase();

        if (field === 'title') {
            event.title = prompt('Enter new title:', event.title);
        } else if (field === 'start' || field === 'end') {
            const newTime = await promptManualTime();
            event[field + 'Time'] = newTime;

            if (field === 'start' && event.startTime === event.endTime) {
                const updateEnd = confirm('Update connected end time as well?');
                if (updateEnd) event.endTime = newTime;
            }
        }

        saveData();
        renderTable();
    };

    // Delete an event
    window.deleteEvent = (index) => {
        if (confirm('Are you sure you want to delete this event?')) {
            events.splice(index, 1);
            saveData();
            renderTable();
        }
    };

    // Load initial data
    renderTable();
});
