import * as fs from "fs";
import * as readline from "readline";

enum Priority {
  Low = 1,
  Medium = 2,
  High = 3,
}

interface Task {
  id: number;
  title: string;
  priority: Priority;
  date: string;
  completed: boolean;
}

function findByProp<T, K extends keyof T>(
  list: T[],
  prop: K,
  value: T[K]
): T | undefined {
  return list.find((item) => item[prop] === value);
}

let tasks: Task[] = [];

try {
  const data = fs.readFileSync("./tasks.json", "utf8");
  tasks = JSON.parse(data);
} catch {
  console.log("tasks.json not found, starting fresh.");
  tasks = [];
}

function createTaskCounter() {
  let count = tasks.length;

  return () => {
    count++;
    return count;
  };
}

const getNextId = createTaskCounter();


function saveTasks(): void {
  fs.writeFileSync("./tasks.json", JSON.stringify(tasks, null, 2));
}

class TaskManager {
  addTask(title: string, priority: number, date?: string): void {
    const newTask: Task = {
      id: getNextId(),
      title,
      priority: priority as Priority,
      date: date || new Date().toISOString().split("T")[0],
      completed: false,
    };

    tasks.push(newTask);
    saveTasks();

    console.log("Task added");
  }

  removeTask(id: number): void {
    const newTasks = tasks.filter((task) => task.id !== id);

    if (newTasks.length === tasks.length) {
      throw new Error("Task not found");
    }

    tasks = newTasks;
    saveTasks();

    console.log("Task removed");
  }

  listTasks(): void {
    if (tasks.length === 0) {
      console.log("No tasks found");
      return;
    }

    tasks.forEach((task) => {
      console.log(
        `${task.id}. ${task.title} | Priority:${task.priority} | Date:${task.date} | Done:${task.completed}`
      );
    });
  }

  searchTask(keyword: string): void {
    const result = tasks.filter((task) =>
      task.title.toLowerCase().includes(keyword.toLowerCase())
    );

    if (result.length === 0) {
      console.log("No matching tasks");
      return;
    }

    result.forEach((task) => {
      console.log(`${task.id}. ${task.title} (${task.date})`);
    });
  }

  completeTask(id: number): void {
    const task = findByProp(tasks, "id", id);

    if (!task) {
      throw new Error("Task not found");
    }

    task.completed = true;
    saveTasks();

    console.log("Task completed");
  }

  sortTasks(type: "priority" | "date"): void {
    if (type === "priority") {
      tasks.sort((a, b) => a.priority - b.priority);
    } else {
      tasks.sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }

    console.log("Tasks sorted");
    this.listTasks();
  }

  showStats(): void {
    const completedCount = tasks.reduce((acc, task) => {
      return task.completed ? acc + 1 : acc;
    }, 0);

    const anyCompleted = tasks.some((task) => task.completed);
    const allCompleted = tasks.every((task) => task.completed);

    console.log("Total:", tasks.length);
    console.log("Completed:", completedCount);
    console.log("Any completed:", anyCompleted);
    console.log("All completed:", allCompleted);
  }
}

const manager = new TaskManager();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\nTask Tracker CLI (TypeScript)");
console.log("Commands:");
console.log("add title priority date");
console.log("remove id");
console.log("list");
console.log("search keyword");
console.log("sort priority/date");
console.log("complete id");
console.log("stats");
console.log("exit\n");

rl.on("line", (input: string) => {
  try {
    const args = input.split(" ");
    const command = args[0];

    switch (command) {
      case "add":
        manager.addTask(args[1], Number(args[2]), args[3]);
        break;

      case "remove":
        manager.removeTask(Number(args[1]));
        break;

      case "list":
        manager.listTasks();
        break;

      case "search":
        manager.searchTask(args[1]);
        break;

      case "sort":
        manager.sortTasks(args[1] as "priority" | "date");
        break;

      case "complete":
        manager.completeTask(Number(args[1]));
        break;

      case "stats":
        manager.showStats();
        break;

      case "exit":
        rl.close();
        break;

      default:
        console.log("Unknown command");
    }
  } catch (error: any) {
    console.log("Error:", error.message);
  }
});