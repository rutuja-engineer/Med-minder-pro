document.addEventListener('DOMContentLoaded', () => {
    const addMedForm = document.getElementById('addMedForm');
    const medNameInput = document.getElementById('medName');
    const medDosageInput = document.getElementById('medDosage');
    const medTimesInput = document.getElementById('medTimes');
    const medsList = document.getElementById('medsList');
    const scheduleList = document.getElementById('scheduleList');
    const todayDateSpan = document.getElementById('todayDate');

    const medsStorageKey = 'medMinderMeds';
    const takenStatusStorageKey = 'medMinderTakenStatus';

    let medications = [];
    let takenStatuses = { date: getTodayDateString(), statuses: {} }; // { date: 'YYYY-MM-DD', statuses: {'medId_time': true} }

    // --- Utility Functions ---
    function getTodayDateString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatTimeForDisplay(timeStr) { // HH:MM -> H:MM AM/PM (optional, could keep 24hr)
        const [hour, minute] = timeStr.split(':');
        const hourNum = parseInt(hour);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${formattedHour}:${minute} ${ampm}`;
        // return timeStr; // Keep 24-hour format if preferred
    }

    // --- Local Storage Functions ---
    function saveMedications() {
        localStorage.setItem(medsStorageKey, JSON.stringify(medications));
    }

    function loadMedications() {
        const storedMeds = localStorage.getItem(medsStorageKey);
        if (storedMeds) {
            medications = JSON.parse(storedMeds);
        } else {
            medications = [];
        }
    }

    function saveTakenStatuses() {
        localStorage.setItem(takenStatusStorageKey, JSON.stringify(takenStatuses));
    }

    function loadTakenStatuses() {
        const storedStatuses = localStorage.getItem(takenStatusStorageKey);
        const today = getTodayDateString();

        if (storedStatuses) {
            const parsedData = JSON.parse(storedStatuses);
            // Check if the stored data is for today, otherwise reset
            if (parsedData.date === today) {
                takenStatuses = parsedData;
            } else {
                // It's a new day, reset statuses but keep today's date
                takenStatuses = { date: today, statuses: {} };
                saveTakenStatuses(); // Save the reset state for today
            }
        } else {
            // No stored data, initialize for today
            takenStatuses = { date: today, statuses: {} };
            saveTakenStatuses();
        }
        // Ensure statuses object exists if loaded data was corrupt/old format
         if (!takenStatuses.statuses) {
            takenStatuses.statuses = {};
        }
    }

    // --- Rendering Functions ---
    function renderMedsList() {
        medsList.innerHTML = ''; // Clear current list
        if (medications.length === 0) {
             medsList.innerHTML = '<li class="placeholder">No medications added yet.</li>';
             return;
        }

        medications.forEach(med => {
            const li = document.createElement('li');
            li.setAttribute('data-id', med.id);

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('med-info');
            infoDiv.innerHTML = `
                <strong>${med.name}</strong> (${med.dosage})
                <span>Takes at: ${med.times.join(', ')}</span>
            `;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteMedication(med.id));

            li.appendChild(infoDiv);
            li.appendChild(deleteBtn);
            medsList.appendChild(li);
        });
    }

    function renderScheduleList() {
        scheduleList.innerHTML = ''; // Clear current list
        todayDateSpan.textContent = getTodayDateString(); // Update date display

        const todaysScheduleItems = [];

        medications.forEach(med => {
            med.times.forEach(time => {
                todaysScheduleItems.push({
                    medId: med.id,
                    name: med.name,
                    dosage: med.dosage,
                    time: time // Keep original HH:MM for sorting/ID
                });
            });
        });

        // Sort schedule items by time
        todaysScheduleItems.sort((a, b) => a.time.localeCompare(b.time));

         if (todaysScheduleItems.length === 0) {
             scheduleList.innerHTML = '<li class="placeholder">No medications scheduled for today.</li>';
             return;
        }


        todaysScheduleItems.forEach(item => {
            const li = document.createElement('li');
            const doseId = `${item.medId}_${item.time}`; // Unique ID for this specific dose time
            const isTaken = takenStatuses.statuses[doseId] === true;

            li.setAttribute('data-dose-id', doseId);
            if (isTaken) {
                li.classList.add('taken');
            }

            const checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            checkbox.checked = isTaken;
            checkbox.addEventListener('change', () => toggleTakenStatus(doseId));

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('dose-info');
            infoDiv.innerHTML = `
                <span class="dose-time">${formatTimeForDisplay(item.time)}:</span>
                ${item.name} (${item.dosage})
            `;

            li.appendChild(checkbox);
            li.appendChild(infoDiv);
            scheduleList.appendChild(li);
        });
    }


    // --- Event Handlers ---
    function handleAddMed(event) {
        event.preventDefault(); // Prevent page reload

        const name = medNameInput.value.trim();
        const dosage = medDosageInput.value.trim();
        const timesString = medTimesInput.value.trim();

        if (!name || !dosage || !timesString) {
            alert('Please fill in all fields.');
            return;
        }

        // Simple validation for times format (allows HH:MM, comma-separated)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]( *, *([0-1]?[0-9]|2[0-3]):[0-5][0-9])*$/;
        if (!timeRegex.test(timesString)) {
             alert('Invalid time format. Please use HH:MM and separate multiple times with commas (e.g., 08:00, 14:30).');
             return;
        }

        const times = timesString.split(',').map(t => t.trim()).filter(t => t !== ''); // Clean up times array

        const newMed = {
            id: Date.now().toString(), // Simple unique ID
            name: name,
            dosage: dosage,
            times: times
        };

        medications.push(newMed);
        saveMedications();

        // Clear form
        addMedForm.reset();

        // Re-render lists
        renderMedsList();
        renderScheduleList(); // Schedule might change if new med added
    }

    function deleteMedication(medId) {
        if (confirm('Are you sure you want to delete this medication?')) {
            medications = medications.filter(med => med.id !== medId);
            // Also clean up any 'taken' statuses associated with this med for today
            Object.keys(takenStatuses.statuses).forEach(key => {
                if (key.startsWith(medId + '_')) {
                    delete takenStatuses.statuses[key];
                }
            });

            saveMedications();
            saveTakenStatuses(); // Save cleaned statuses
            renderMedsList();
            renderScheduleList(); // Re-render schedule as med is gone
        }
    }

    function toggleTakenStatus(doseId) {
        const isTaken = takenStatuses.statuses[doseId] === true;
        takenStatuses.statuses[doseId] = !isTaken; // Toggle the status

        saveTakenStatuses();

        // Find the list item and update its class visually
        const listItem = scheduleList.querySelector(`li[data-dose-id="${doseId}"]`);
        if (listItem) {
            listItem.classList.toggle('taken', !isTaken);
            // Ensure checkbox state matches (though browser usually handles this on change)
            const checkbox = listItem.querySelector('input[type="checkbox"]');
             if (checkbox) checkbox.checked = !isTaken;
        }
        // No need to call renderScheduleList() fully, just toggle the class
    }

    // --- Initialization ---
    function init() {
        loadMedications();
        loadTakenStatuses(); // This also handles the daily reset check
        renderMedsList();
        renderScheduleList();

        addMedForm.addEventListener('submit', handleAddMed);
        // Note: Delete buttons are added dynamically, event listener added in renderMedsList
        // Note: Checkboxes are added dynamically, event listener added in renderScheduleList
    }

    init(); // Run initialization
});