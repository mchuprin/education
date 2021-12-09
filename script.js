let allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
let input = null;
let inputValue = '';
let activeEditTask = null;
let id = null;

window.onload = async function init() {
    input = document.getElementById('add-task');
    input.addEventListener('change', updateValue);
    const resp = await fetch ('http://localhost:8000/allTasks', {
        method: 'GET'
    });
    let result = await resp.json();
    allTasks = result.data;
    render ();
}

updateValue = (event) => {
    inputValue = event.target.value;
} 

onClickButton = async () => {
    allTasks.push ( {
        text: inputValue,
        isCheck: false
    })
    const resp = await fetch ('http://localhost:8000/createTask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Origin': '*'
        },
        body: JSON.stringify({
            text: inputValue,
            isCheck: false
        })
    });
    let result = await resp.json();
    allTasks = result.data;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    input.value = '';
    render ();
}    



render = () => {
    const content = document.getElementById('content');
    while (content.firstChild) {
        content.removeChild(content.firstChild)
    }
    allTasks.sort((a,b) => a.isCheck > b.isCheck ? 1 : a.isCheck < b.isCheck ? -1 : 0)
    allTasks.map ((value, index) => {
        const container = document.createElement('div');
        content.appendChild(container);
        container.className = "task";
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = value.isCheck;
        id = value.id;
        container.appendChild(checkbox)
        checkbox.onchange = function () {
            doneTask(index)
        };
        if(value.id === activeEditTask) {
            const inputTask = document.createElement('input');
            inputTask.type = 'text';
            inputTask.value = value.text;
            inputTask.addEventListener('change', updateTaskText);
            inputTask.addEventListener('blur', doneEditTask);
            container.appendChild(inputTask);
        } else {
            const text = document.createElement('p');
            text.innerText = value.text;
            container.appendChild(text);
            text.className = value.isCheck ? 'done-task' : 'task-text'; 
        }
        
        if(value.isCheck) {
            if (value.id === activeEditTask) {
                const imageDone = document.createElement('img');
                imageDone.src = 'done.svg';
                imageDone.onclick = function () {
                    doneEditTask
                }
                container.appendChild(imageDone);
            } else {
                const imageEdit = document.createElement('img');
                imageEdit.src = "pencil.svg";
                imageEdit.onclick = function () {
                    activeEditTask = value.id;
                    render();
                }
                container.appendChild(imageEdit);
            }

            const imageDelete = document.createElement('img');
            imageDelete.src = "cross.svg";
            imageDelete.onclick = function () {
                deleteTask(index);
            };
            container.appendChild(imageDelete);
        }
    });
}

doneTask = async (index) => {
    allTasks[index].isCheck = !allTasks[index].isCheck;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render ();
}

deleteTask = async (event) => {
    const resp = await fetch (`http://localhost:8000/deleteTask?id=${id}`, {
        method: 'DELETE',
    })
    let result = await resp.json();
    allTasks = result.data;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
}

updateTaskText = async (event) => {
    const resp = await fetch ('http://localhost:8000/updateTask', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Origin': '*'
        },
        body: JSON.stringify({
            id: activeEditTask,
            text: event.target.value,
            isCheck: false
        })
    });
    let result = await resp.json();
    allTasks = result.data;
    
    localStorage.setItem('tasks', JSON.stringify(allTasks));
    render();
}

doneEditTask = async () => {
    activeEditTask = null;
    render();
}