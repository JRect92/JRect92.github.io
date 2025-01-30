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

            row.innerHTML = `
                <td>
                    <input type="time" value="${event.startTime}" onchange="updateTime(${index}, 'start', this.value)">
                </td>
                <td>
                    <input type="time" value="${event.endTime}" onchange="updateTime(${index}, 'end', this.value)">
                </td>
                <td contenteditable="true" onblur="updateTitle(${index}, this.innerText)">${event.title}</td>
                <td>
                    <button class="delete-btn" onclick="deleteEvent(${index})">Delete</button>
                </td>
                <td>
                    <button class="up-btn" onclick="moveEvent(${index}, -1)">▲</button>
                    <button class="down-btn" onclick="moveEvent(${index}, 1)">▼</button>
                </td>
            `;

            timestampTable.appendChild(row);
        });
    }

    // Add new event
    timestampForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('timestampName').value.trim();
        if (!title) return;

        events.push({ title, startTime: '', endTime: '' });
        saveData();
        renderTable();
        timestampForm.reset();
    });

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
            renderTable();
        }
    };

    // Move event
    window.moveEvent = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= events.length) return;

        [events[index], events[newIndex]] = [events[newIndex], events[index]];
        saveData();
        renderTable();
    };

    // Load initial data
    renderTable();
}); 
