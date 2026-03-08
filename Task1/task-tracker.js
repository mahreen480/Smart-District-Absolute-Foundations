const fs = require("fs");
const readline = require("readline");

let tasks = [];

try {
  const data = fs.readFileSync("./tasks.json", "utf8");
  tasks = JSON.parse(data);
} catch (error) {
  console.log("Error reading tasks.json");
  tasks = [];
}

function createTaskCounter() {
  let count = tasks.length;

  return function () {
    count++;
    return count;
  };
}

const getNextId = createTaskCounter();

function saveTasks() {
  fs.writeFileSync("./tasks.json", JSON.stringify(tasks, null, 2));
}

function addTask(title, priority, date) {
  const newTask = {
    id: getNextId(),
    title: title,
    priority: Number(priority),
    date: date,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();

  console.log("Task added successfully");
}

function removeTask(id) {
  const taskId = Number(id);

  const newTasks = tasks.filter((task) => task.id !== taskId);

  if (newTasks.length === tasks.length) {
    throw new Error("Task not found");
  }

  tasks = newTasks;
  saveTasks();

  console.log("Task removed");
}

function listTasks() {
  if (tasks.length === 0) {
    console.log("No tasks found");
    return;
  }

  for (const task of tasks) {
    console.log(
      `${task.id}. ${task.title} | Priority:${task.priority} | Date:${task.date} | Done:${task.completed}`
    );
  }
}

function searchTask(keyword) {
  const result = tasks.filter((task) =>
    task.title.toLowerCase().includes(keyword.toLowerCase())
  );

  if (result.length === 0) {
    console.log("No matching tasks");
    return;
  }

  result.map((task) =>
    console.log(`${task.id}. ${task.title} (${task.date})`)
  );
}

function sortTasks(type) {
  if (type === "priority") {
    tasks.sort((a, b) => a.priority - b.priority);
  } else if (type === "date") {
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  console.log("Tasks sorted");
  listTasks();
}

function showStats() {
  const completedCount = tasks.reduce((acc, task) => {
    if (task.completed) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const hasCompleted = tasks.some((task) => task.completed);

  const allCompleted = tasks.every((task) => task.completed);

  console.log("Total tasks:", tasks.length);
  console.log("Completed tasks:", completedCount);
  console.log("Any completed:", hasCompleted);
  console.log("All completed:", allCompleted);
}

function completeTask(id) {
  const task = tasks.find((t) => t.id === Number(id));

  if (!task) {
    throw new Error("Task not found");
  }

  task.completed = true;
  saveTasks();

  console.log("Task marked completed");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\nTask Tracker CLI");
console.log("Commands:");
console.log("add title priority date");
console.log("remove id");
console.log("list");
console.log("search keyword");
console.log("sort priority/date");
console.log("complete id");
console.log("stats");
console.log("exit\n");

rl.on("line", (input) => {
  try {
    const args = input.split(" ");
    const command = args[0];

    switch (command) {
      case "add":
        addTask(args[1], args[2], args[3]);
        break;

      case "remove":
        removeTask(args[1]);
        break;

      case "list":
        listTasks();
        break;

      case "search":
        searchTask(args[1]);
        break;

      case "sort":
        sortTasks(args[1]);
        break;

      case "complete":
        completeTask(args[1]);
        break;

      case "stats":
        showStats();
        break;

      case "exit":
        rl.close();
        break;

      default:
        console.log("Unknown command");
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
});