document.addEventListener('DOMContentLoaded', () => {
    const timestampForm = document.getElementById('timestampForm');
    const timestampTable = document.getElementById('timestampTable').querySelector('tbody');
    const timeOptions = document.getElementById('timeOptions');
    const timePicker = document.getElementById('timePicker');
    const timeCategory = document.getElementById('timeCategory');
    const manualTime = document.getElementById('manualTime');

    let selectedTimeType = '';
    let selectedTime = '';
    let selectedCategory = '';
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

            row.addEventListener('dragstart', (e) => onDragStart(e, index));
            row.addEventListener('dragover', (e) => onDragOver(e, index));
            row.addEventListener('dragend', onDragEnd);

            timestampTable.appendChild(row);
        });
    }

    let draggingIndex = null;

    // Drag-and-Drop Handlers
    function onDragStart(e, index) {
        draggingIndex = index;
        e.dataTransfer.effectAllowed = 'move';
    }

    function onDragOver(e, index) {
        e.preventDefault();
        if (draggingIndex !== null && draggingIndex !== index) {
            const temp = events[draggingIndex];
            events.splice(draggingIndex, 1);
            events.splice(index, 0, temp);
            draggingIndex = index;
            saveData();
            renderTable();
        }
    }

    function onDragEnd() {
        draggingIndex = null;
    }

    // Add new event
    timestampForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('timestampName').value.trim();
        if (!title) return;

        selectedTimeType = '';
        selectedTime = '';
        selectedCategory = '';

        timeOptions.classList.remove('hidden');
        timestampForm.reset();

        timeOptions.addEventListener('click', handleTimeTypeSelection);
    });

    // Handle Time Type Selection
    function handleTimeTypeSelection(e) {
        if (!e.target.dataset.timeType) return;

        selectedTimeType = e.target.dataset.timeType;
        timeOptions.classList.add('hidden');

        if (selectedTimeType === 'manual') {
            timePicker.classList.remove('hidden');
        } else {
            selectedTime = getCurrentTime();
            timeCategory.classList.remove('hidden');
        }
    }

    // Confirm Manual Time
    document.getElementById('confirmTime').addEventListener('click', () => {
        selectedTime = manualTime.value;
        if (!selectedTime) return;

        timePicker.classList.add('hidden');
        timeCategory.classList.remove('hidden');
    });

    // Handle Time Category Selection
    timeCategory.addEventListener('click', (e) => {
        if (!e.target.dataset.timeCategory) return;

        selectedCategory = e.target.dataset.timeCategory;
        timeCategory.classList.add('hidden');

        const newEvent = { title: document.getElementById('timestampName').value, startTime: '', endTime: '' };
        if (selectedCategory === 'start') newEvent.startTime = selectedTime;
        if (selectedCategory === 'end') newEvent.endTime = selectedTime;
        if (selectedCategory === 'instance') newEvent.startTime = newEvent.endTime = selectedTime;

        events.push(newEvent);
        saveData();
        renderTable();
    });

    // Get current time
    function getCurrentTime() {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }

    // Edit an event
    window.editEvent = async (index) => {
        const event = events[index];
        const field = confirm('Edit "start" time? Click "Cancel" to edit "end" time.');

        const newTime = prompt('Select a new time (HH:MM):');
        if (!newTime) return;

        if (field) {
            event.startTime = newTime;
            if (event.startTime === event.endTime) {
                const updateEnd = confirm('Update connected end time as well?');
                if (updateEnd) event.endTime = newTime;
            }
        } else {
            event.endTime = newTime;
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
