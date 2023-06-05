document.getElementById('sendButton').addEventListener('click', function() {
    let messageBox = document.getElementById('messageBox');
    let chatlogs = document.getElementById('chatlogs');

    // If there's a message to send
    if (messageBox.value) {
        let newMessage = document.createElement('p');
        newMessage.classList.add('user');
        newMessage.textContent = "User: " + messageBox.value;
        chatlogs.appendChild(newMessage);
        chatlogs.appendChild(document.createElement('br'));

        // Scroll to the bottom of the chat
        chatlogs.scrollTop = chatlogs.scrollHeight;
        loading_on();
        generateAnswer(messageBox.value.toLowerCase());
        messageBox.value = '';
    }
});

function generateAnswer(message) {
    // here is where I can see how to use the message
    if (message === "hello" || message === "hi") {
        randomGreeting();
    } else {
        fetch('/find_matches', {
            method: 'POST',
            body: JSON.stringify({'message': message}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                showOverloadAlert();
                generateAnswer(message);
            }
            return response.json();
        })
        .then(data => {
            reply = data.reply;
            // console.log(reply); //debug
            // Check if reply is "NO MATCH"
            if (reply === "NO MATCH" || Object.keys(reply).length === 0) {
                randomNoMatchReply();
                loading_off();
            }
            else {
                // console.log(reply); //debug
                sendAnswer("I believe you will find the answer in the link(s) below:")
                chatlogs.appendChild(document.createElement('br'));

                // let links = JSON.parse(reply);
                for (let link in reply) {
                    let linkElement = document.createElement('a');
                    linkElement.innerText = link;
                    linkElement.href = reply[link];
                    linkElement.target = "_blank";
                    sendLink(linkElement);
                }
            }
        })
        .then(() => {
            closeOverloadAlert();
        })
    }
}

function sendAnswer(reply) {
    var replyMessage = document.createElement('p');
    replyMessage.classList.add('ai');
    replyMessage.textContent = "AI: " + reply;
    chatlogs.appendChild(replyMessage);
    chatlogs.appendChild(document.createElement('br'));
    chatlogs.scrollTop = chatlogs.scrollHeight;
    loading_off();
}

function sendLink(linkElement) {
    chatlogs.appendChild(linkElement);
    chatlogs.appendChild(document.createElement('br'));
    chatlogs.scrollTop = chatlogs.scrollHeight;
}

document.getElementById('messageBox').addEventListener('keydown', function(event) {
    // check if the key pressed was 'Enter'
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        // prevent the default action (don't insert a newline)
        event.preventDefault();
        // simulate clicking the button
        document.getElementById('sendButton').click();
    }
});

window.onload = function() {
    setTimeout(function() {
        var welcomeMessage = 'Welcome to Alpha Support, how may I help you today?';
        sendAnswer(welcomeMessage);
    }, 1100);
    document.getElementById('messageBox').focus();
};

function loading_on() {
    var loader = document.getElementById('loading_display');
    loader.style.display = 'block';
}

function loading_off() {
    var loader = document.getElementById('loading_display');
    loader.style.display = 'none';
}

function closeOverloadAlert() {
    var alert = document.getElementById('overload_alert');
    alert.style.display = 'none';
}

function showOverloadAlert() {
    var alert = document.getElementById('overload_alert');
    alert.style.display = 'block';
}

function randomGreeting() {
    var randomNumber = Math.floor(Math.random() * 7) + 1;
    var messages = ["Hi there! I'm very happy to assist you today, please type your request below.",
                    "How's it going? I'm ready to help you with whatever you need.",
                    "What can I do for you today? I'm here to help.",
                    "Welcome! I'm happy to assist you with your request.",
                    "Howdy! I'm here to help. What can I do for you today?",
                    "I'm so glad you're here. What can I help you with today?",
                    "Today is a great day! How can I help?"];
    var greeting = messages[randomNumber - 1];
    sendAnswer(greeting);
}

function randomNoMatchReply() {
    var randomNumber = Math.floor(Math.random() * 5) + 1;
    var messages = ["I'm afraid I'm not able to help you with this issue. Please raise a ticket.",
                    "I'm sorry, but I'm not able to resolve this issue. Please raise a ticket and a member of our support team will deal with it.",
                    "I'm not able to help you with this issue. Please raise a ticket so that a member of our team can investigate further.",
                    "I'm unable to resolve this issue. Please raise a ticket and a member of our team will help.",
                    "I'm sorry, but I can't help you with this issue. Please raise a ticket so that a member of our technical support team can assist you."];
    var reply = messages[randomNumber - 1];
    sendAnswer(reply);
}


// Function to send GET request to the endpoint
function test() {
    fetch('/test')
      .then(response => response.json())
      .then(data => {
        tags = data.reply;
        
        // Process the reply
        console.log(tags);
      })
      .catch(error => console.error('Error:', error));
}

