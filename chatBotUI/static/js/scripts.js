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
    if (message === "hello") {
        reply = "Hi there! I'm very happy to assist you today, please type your request below.";
        sendAnswer(reply);
    } else if (message === "hi") {
        reply = "Hi there! I'm very happy to assist you today, please type your request below.";
        sendAnswer(reply);
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
                sendAnswer("Please raise a new ticket for your issue.")
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
