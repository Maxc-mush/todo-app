document.addEventListener('DOMContentLoaded', () => { 
    const todoInputEl = document.getElementById('todo-input')
    const todosContainerEl = document.querySelector('.todos-container')
    const noTodoMessage = document.querySelector('#no-todos-message')
    const allTodosTab = document.getElementById('all-todos-tab')
    const completedTodosTab = document.getElementById('completed-todos-tab')
    const uncompletedTodosTab = document.getElementById('uncompleted-todos-tab')
    const uncompletedBadge = document.getElementById('uncompleted-todos-badge')
    const toastContainer = document.querySelector('.toast-container')
    const modal = document.querySelector('.modal')
    const signInBtn = document.querySelector('#sign-in-btn')
    const closeModal = document.querySelector('.close-modal')
    const loginBtn = document.querySelector('#login-btn')
    const registerBtn = document.querySelector('#register-btn')
    const loginMessage = document.querySelector('#login-message')
    const usernameEl = document.getElementById('username')
    const passwordEl = document.getElementById('password')
    const addTodoBtn = document.getElementById('add-todo-btn')
    const currentUserDiv = document.getElementById('current-user')
    
    let allTodos = []
    let currentFilter = 'all'
    let currentUser = null
    
    const getAllTodos = () => {
        const data = localStorage.getItem(`${currentUser}-TODOS-DATA`)
        return data ? JSON.parse(data) : [];
    }
    
    const createTodoEl = (todo, index) => {
        const todoEl = document.createElement('li')
        todoEl.classList.add('each-todo')
        todoEl.innerHTML = `<label for="todo-${index}">
        <input type="checkbox" name="todo-${index}" id="todo-${index}">
        ${todo.text}
        </label>
        <span data-index='${index}' class="todo-del"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="18px" width="18px" fill="currentColor"><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg></span>`
    
        const removeBtn  = todoEl.querySelector('span')
        removeBtn.addEventListener('click', () => {
            todoEl.style.animation = 'fadeOut 0.1s forwards'
            setTimeout(() => {
                removeTodo(index)
            }, 300)
        })
    
        const checkBox = todoEl.querySelector('input')
        checkBox.checked = todo.completed
        checkBox.addEventListener('change', () => {
            allTodos[index].completed = checkBox.checked
            saveTodos()
            updateDisplay()
        })
    
        return todoEl
    }
    
    const saveTodos = () => {
        const stringData = JSON.stringify(allTodos)
        localStorage.setItem(`${currentUser}-TODOS-DATA`, stringData)
    }
    
    const updateDisplay = () => {
        todosContainerEl.innerHTML = ''
    
        const filteredTodos = filterTodos(currentFilter)
        filteredTodos.forEach((todo, index) => {
            const todoEl = createTodoEl(todo, index)
            todosContainerEl.appendChild(todoEl)
        })
    
        noTodoMessage.classList.toggle('hidden', allTodos.length > 0)
        updateCounts()
    }
    
    const updateCounts = () => {
        const uncompleted = allTodos.filter(todo => !todo.completed).length
        uncompletedBadge.textContent = uncompleted
        if (uncompleted === 0) {
            uncompletedBadge.classList.add('hidden')
        } else {
            uncompletedBadge.classList.remove('hidden')
        }
    }
    
    const filterTodos = (filter) => {
        switch (filter) {
            case 'completed': 
                return allTodos.filter(todo => todo.completed)
            case 'uncompleted': 
                return allTodos.filter(todo => !todo.completed)
            case 'all': 
                return allTodos
            default:
                return allTodos
        }
    }
    
    const addTodo = () => {
        if (currentUser === null) {
            showToast('Please login!', 'error')
            return
        }
        const newTodo = todoInputEl.value.trim()
        console.log(newTodo, currentUser)
        if (newTodo === "") {
          showToast('Todo must contain more than 1 character', 'error')
          return 
        }
        const todoOj = {
            text: newTodo,
            completed: false
        }
        allTodos.unshift(todoOj)
        saveTodos()
        updateDisplay()
        todoInputEl.value = ''
        showToast('New todo succesifully created!', 'success')
    }
    
    const createToast = (message, type) => {
        const toastEl = document.createElement('div')
        toastEl.className = `toast ${type}`
        toastEl.innerHTML = `<span>${message}</span>
                    <button class="close-btn" onclick="removeToast(this.parentElement)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="15px" width="15px"><path fill="#ff0000" d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg></button>`
        return toastEl
    }
    
    const showToast = (message, type) => {
        const toastEl = createToast(message, type)
        toastContainer.appendChild(toastEl)
    
        setTimeout(() => {
            removeToast(toastEl)
        }, 5000)
    }
    const removeToast = (toastEl) => {
        if (toastEl) {
            toastEl.style.animation = 'fadeOut 0.3s forwards'
            setTimeout(() => {
                toastEl.remove()
            },300)
        }
    }
    const removeTodo = (index) => {
        allTodos.splice(index, 1)
        saveTodos()
        updateDisplay()
        showToast('Succesifully deleted!', 'error')
    }
    
    const handleLogin = () => {
      loginMessage.classList.add('hidden')
      const username = usernameEl.value.trim()
      const password = passwordEl.value.trim()
      
      if (!username || !password) {
        loginMessage.textContent = "Username and password are required!"
        loginMessage.classList.remove('hidden')
        return
      }
      
      const users = JSON.parse(localStorage.getItem('users')) || {}
      
      if (users[username] && users[username] === password) {
        currentUser = username
        currentUserDiv.innerHTML = `Hey ${currentUser},`
        passwordEl.value = ""
        modal.style.display = 'none'
        allTodos = getAllTodos()
        updateDisplay()
        showToast("Login successful", 'success')
      } else {
        loginMessage.textContent = 'Invalid username or password!'
        loginMessage.classList.remove('hidden')
        passwordEl.value = ""
      }                  
    }
    
    const handleRegister = () => {
      loginMessage.classList.add('hidden')
      const username = usernameEl.value.trim()
      const password = passwordEl.value.trim()
       
      if (!username || !password) {
        loginMessage.textContent = "Username and password are required!"
        loginMessage.classList.remove('hidden')
        return
      }
      
      const users = JSON.parse(localStorage.getItem('users')) || {}
      if (users[username]) {
        loginMessage.textContent = 'Username already exists!'
        loginMessage.classList.remove('hidden')
      } else {
        users[username] = password
        localStorage.setItem('users', JSON.stringify(users))
        passwordEl.value = ""
        showToast('Registration successful. Please Login.', 'success')
      }
    }
    if (currentUser === null) {
        noTodoMessage.textContent = 'Please login to you account to be able to add todo.'
    }
    const selectActiveTab = (button) => {
        document.querySelectorAll('.todo-tabs button').forEach(tab => tab.classList.remove('active'))
        button.classList.add('active')
    }
    
    signInBtn.addEventListener('click', () => {
      modal.style.display = "block"
    })
    
    closeModal.addEventListener('click', () => {
      modal.style.display = "none"
    })
    
    window.addEventListener('click', (event) => {
      if (event.target == modal) {
        modal.style.display = 'none'
      }
    })
    
    loginBtn.addEventListener('click', handleLogin)
    
    registerBtn.addEventListener('click', handleRegister)

    addTodoBtn.addEventListener('click', addTodo)

    todoInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo()
        }
    })
    
    allTodosTab.addEventListener('click', () => {
        currentFilter = 'all'
        selectActiveTab(allTodosTab)
        updateDisplay()
    })
    
    completedTodosTab.addEventListener('click', () => {
        currentFilter = 'completed'
        selectActiveTab(completedTodosTab)
        updateDisplay()
    })
    
    uncompletedTodosTab.addEventListener('click', () => {
        currentFilter = 'uncompleted'
        selectActiveTab(uncompletedTodosTab)
        updateDisplay()
    })
    
    //initial display of todos
    updateDisplay()
    })