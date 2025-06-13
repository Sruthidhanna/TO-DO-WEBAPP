let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

window.onload = function () {
  renderTasks();
  applyTheme();
  requestNotificationPermission();
};

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const dateTimeInput = document.getElementById('taskDateTime');

  const taskText = taskInput.value.trim();
  const dateTime = dateTimeInput.value;

  if (!taskText) {
    alert('Please enter a task.');
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText,
    dateTime: dateTime,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  notifyTask(task);

  taskInput.value = '';
  dateTimeInput.value = '';
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks(filter = 'all') {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');

    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';
    taskDetails.innerHTML = `<strong>${task.text}</strong><br><small>${task.dateTime || ''}</small>`;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const completeBtn = document.createElement('button');
    completeBtn.textContent = '✔';
    completeBtn.onclick = () => toggleComplete(task.id);

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏';
    editBtn.onclick = () => editTask(task.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(completeBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(taskDetails);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  filterTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt('Edit task:', task.text);
  const newTime = prompt('Edit date/time:', task.dateTime);

  if (newText && newText.trim()) {
    task.text = newText.trim();
    task.dateTime = newTime;
    saveTasks();
    filterTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  filterTasks();
}

function filterTasks() {
  const filter = document.getElementById('filter').value;
  renderTasks(filter);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

function applyTheme() {
  const darkMode = JSON.parse(localStorage.getItem('darkMode'));
  if (darkMode) document.body.classList.add('dark');
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

function notifyTask(task) {
  if ('Notification' in window && Notification.permission === 'granted') {
    setTimeout(() => {
      new Notification("⏰ Task Reminder", {
        body: task.text + (task.dateTime ? ` at ${task.dateTime}` : ''),
        icon: "icon-192.png"
      });
    }, 60000); // 1 minute delay
  }
}

function startVoice() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = function(event) {
    const spokenText = event.results[0][0].transcript;
    document.getElementById("taskInput").value = spokenText;
  };

  recognition.onerror = function(event) {
    alert("Speech recognition error: " + event.error);
  };

  recognition.start();
}
