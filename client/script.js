import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('#questionForm')
const createSohbetForm = document.querySelector('#createSohbetForm')
const chatContainer = document.querySelector('#chat_container')
const backdrop = document.querySelector('#backdrop')
const closeModal = document.querySelector('#closeModal')
let createChatBtn = document.querySelector('#create-chat')
const sidebar = document.querySelector('#sidebar')

let loadInterval

let current_id = ""

window.onload = (e) => {
    loadChatBoxs();
}

const loadChatBoxs = async () => {
    const response = await fetch(`https://codex-vinn.onrender.com/sidebar`).then(res => res.json())
    for (let i = 0; i < response.questions.length; i++) {
        const q = response.questions[i];
        const chatbox = `
            <div class="sohbet" id="${q._id}" onclick="changeChat('${q._id}')">
                <p>${q.title}</p>
                <i class="fa-solid fa-trash" onclick="deleteQuestion('${q._id}')"></i>
            </div>
        `
        sidebar.innerHTML += chatbox
    }
    createChatBtn = document.querySelector('#create-chat')
}

window.loadChatBoxs = loadChatBoxs

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    const question = data.get('prompt')

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch(`http://localhost:5000`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        if(current_id != "") {
            saveQuestion(question, parsedData)
        }

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})
closeModal.addEventListener('click', () => {
    backdrop.style.display = "none";
})
createChatBtn.addEventListener('click', () => {
    backdrop.style.display = "flex";
})

const showModal = () => {
    backdrop.style.display = "flex";
}

window.showModal = showModal

const deleteQuestion = async (id) => {
    const response = await fetch(`https://codex-vinn.onrender.com/question`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id
        })
    })
    .then(res => res.json())
    .then(data => location.reload())

    current_id = ""
    
}

window.deleteQuestion = deleteQuestion




createSohbetForm.addEventListener('submit', async () => {
    const response = await fetch(`https://codex-vinn.onrender.com/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: document.querySelector('#createFormValue').value
        })
    })
})


const changeChat = async (id) => {
    current_id = id
    chatContainer.innerHTML = ""
    let question
    const res = await fetch(`https://codex-vinn.onrender.com/question/${id}`).then(res => res.json()).then(data => {question = data.questions})
    console.log(question)
    for (let i = 0; i < question.length; i++) {
        const element = question[i];
        chatContainer.innerHTML += chatStripe(false, element.q)
        const uniqueId = generateUniqueId()
        chatContainer.innerHTML += chatStripe(true, element.a, uniqueId)
    }
}

const saveQuestion = async (q, a) => {
    const response = await fetch(`https://codex-vinn.onrender.com/question`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: current_id,
            question: {
                q,
                a
            }
        })
    })
}

window.changeChat = changeChat