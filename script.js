(() => {
    // --- State ---
    let currentDate = new Date();
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    // --- DOM ---
    const $date = document.getElementById('currentDate');
    const $dayName = document.getElementById('dayName');
    const $prev = document.getElementById('prevDay');
    const $next = document.getElementById('nextDay');
    const $today = document.getElementById('todayBtn');
    const $taskInput = document.getElementById('taskInput');
    const $taskPriority = document.getElementById('taskPriority');
    const $addTask = document.getElementById('addTaskBtn');
    const $taskList = document.getElementById('taskList');
    const $taskCount = document.getElementById('taskCount');
    const $scheduleGrid = document.getElementById('scheduleGrid');
    const $notes = document.getElementById('notesArea');
    const $charCount = document.getElementById('charCount');

    // --- Helpers ---
    function dateKey(d) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    function loadData(key) {
        try {
            return JSON.parse(localStorage.getItem('planner_' + key)) || null;
        } catch { return null; }
    }

    function saveData(key, data) {
        localStorage.setItem('planner_' + key, JSON.stringify(data));
    }

    // --- Date Navigation ---
    function renderDate() {
        $date.textContent = `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
        $dayName.textContent = DAYS[currentDate.getDay()];
    }

    $prev.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 1); loadDay(); });
    $next.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 1); loadDay(); });
    $today.addEventListener('click', () => { currentDate = new Date(); loadDay(); });

    // --- Tasks ---
    function getTasks() {
        return loadData(dateKey(currentDate))?.tasks || [];
    }

    function setTasks(tasks) {
        const key = dateKey(currentDate);
        const data = loadData(key) || {};
        data.tasks = tasks;
        saveData(key, data);
    }

    function renderTasks() {
        const tasks = getTasks();
        $taskList.innerHTML = '';

        if (!tasks.length) {
            $taskList.innerHTML = '<li class="task-empty">No tasks yet. Add one above!</li>';
            $taskCount.textContent = '0/0';
            return;
        }

        const done = tasks.filter(t => t.done).length;
        $taskCount.textContent = `${done}/${tasks.length}`;

        tasks.forEach((task, i) => {
            const li = document.createElement('li');
            li.className = 'task-item' + (task.done ? ' done' : '');
            li.innerHTML = `
                <input type="checkbox" ${task.done ? 'checked' : ''} data-i="${i}">
                <span class="priority-dot ${task.priority}"></span>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" data-i="${i}">&times;</button>
            `;
            $taskList.appendChild(li);
        });
    }

    function addTask() {
        const text = $taskInput.value.trim();
        if (!text) return;
        const tasks = getTasks();
        tasks.push({ text, priority: $taskPriority.value, done: false });
        setTasks(tasks);
        $taskInput.value = '';
        renderTasks();
    }

    $addTask.addEventListener('click', addTask);
    $taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

    $taskList.addEventListener('change', e => {
        if (e.target.type === 'checkbox') {
            const tasks = getTasks();
            tasks[+e.target.dataset.i].done = e.target.checked;
            setTasks(tasks);
            renderTasks();
        }
    });

    $taskList.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            const tasks = getTasks();
            tasks.splice(+e.target.dataset.i, 1);
            setTasks(tasks);
            renderTasks();
        }
    });

    // --- Schedule ---
    function getSchedule() {
        return loadData(dateKey(currentDate))?.schedule || {};
    }

    function setSchedule(schedule) {
        const key = dateKey(currentDate);
        const data = loadData(key) || {};
        data.schedule = schedule;
        saveData(key, data);
    }

    function buildScheduleGrid() {
        $scheduleGrid.innerHTML = '';
        for (let h = 6; h <= 22; h++) {
            const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`;
            const row = document.createElement('div');
            row.className = 'schedule-row';
            row.innerHTML = `
                <span class="schedule-time">${label}</span>
                <input class="schedule-input" type="text" data-hour="${h}" placeholder="—">
            `;
            $scheduleGrid.appendChild(row);
        }
    }

    function renderSchedule() {
        const schedule = getSchedule();
        $scheduleGrid.querySelectorAll('.schedule-input').forEach(input => {
            const h = input.dataset.hour;
            input.value = schedule[h] || '';
        });
    }

    $scheduleGrid.addEventListener('input', e => {
        if (e.target.classList.contains('schedule-input')) {
            const schedule = getSchedule();
            schedule[e.target.dataset.hour] = e.target.value;
            setSchedule(schedule);
        }
    });

    // --- Notes ---
    function getNotes() {
        return loadData(dateKey(currentDate))?.notes || '';
    }

    function setNotes(text) {
        const key = dateKey(currentDate);
        const data = loadData(key) || {};
        data.notes = text;
        saveData(key, data);
    }

    function renderNotes() {
        $notes.value = getNotes();
        updateCharCount();
    }

    function updateCharCount() {
        $charCount.textContent = `${$notes.value.length} / 1000`;
    }

    $notes.addEventListener('input', () => {
        setNotes($notes.value);
        updateCharCount();
    });

    // --- Utility ---
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Load Day ---
    function loadDay() {
        renderDate();
        renderTasks();
        renderSchedule();
        renderNotes();
    }

    // --- Init ---
    buildScheduleGrid();
    loadDay();
})();
