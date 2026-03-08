const form = document.getElementById("taskForm")
const taskInput = document.getElementById("taskInput")
const emailInput = document.getElementById("emailInput")
const taskList = document.getElementById("taskList")
const emailError = document.getElementById("emailError")

let tasks = []

const saved = localStorage.getItem("tasks")

if (saved) {
  tasks = JSON.parse(saved)
  renderTasks()
}

function debounce(fn, delay) {

  let timer

  return function (...args) {

    clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)

  }

}

function throttle(fn, limit) {

  let lastCall = 0

  return function (...args) {

    const now = Date.now()

    if (now - lastCall >= limit) {
      lastCall = now
      fn.apply(this, args)
    }

  }

}

function validateEmail() {

  const email = emailInput.value
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!pattern.test(email)) {
    emailError.textContent = "Invalid email format"
  } else {
    emailError.textContent = ""
  }

}

const debouncedValidation = debounce(validateEmail, 500)

emailInput.addEventListener("input", debouncedValidation)

form.addEventListener("submit", function (e) {

  e.preventDefault()

  const text = taskInput.value.trim()

  if (!text) return

  const task = {
    id: Date.now(),
    text: text
  }

  tasks.push(task)

  saveTasks()

  renderTasks()

  form.reset()

})

function renderTasks() {

  taskList.innerHTML = ""

  tasks.forEach(task => {

    const li = document.createElement("li")

    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    `

    li.dataset.id = task.id

    taskList.appendChild(li)

  })

}

taskList.addEventListener("click", function (e) {

  const li = e.target.closest("li")

  if (!li) return

  const id = Number(li.dataset.id)

  if (e.target.classList.contains("delete-btn")) {

    tasks = tasks.filter(t => t.id !== id)

    saveTasks()

    renderTasks()

  }

  if (e.target.classList.contains("edit-btn")) {

    const span = li.querySelector(".task-text")

    const newText = prompt("Edit task", span.textContent)

    if (newText) {

      const task = tasks.find(t => t.id === id)

      task.text = newText

      saveTasks()

      renderTasks()

    }

  }

})

function saveTasks() {

  localStorage.setItem("tasks", JSON.stringify(tasks))

}

function handleResize() {

  if (window.innerWidth < 600) {
    document.body.style.background = "#f4f4f4"
  } else {
    document.body.style.background = "white"
  }

}

window.addEventListener("resize", throttle(handleResize, 500))