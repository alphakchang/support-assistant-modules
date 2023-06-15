var hrTicketFlow = false;
var leaver = false;
var waitingForUser = true;
var userMessage = '';

window.onload = function() {
    var options = ["HR Support Tickets", "memoQ Troubleshoot"];
    setTimeout(function() {
        var welcomeMessage = 'Welcome to Alpha Support. Please select from the following options:';
        sendReply(welcomeMessage);
        sendChoiceList(options, "initChoiceButton");
    }, 1100);
    setTimeout(async function() {
        var initChoice = await getUserChoice("initChoiceButton");
        if (initChoice === options.reverse()[0]) { // HR Support Tickets
            displayUserMessage(initChoice);
            createHRTicketList();
        } else {
            randomGreeting();
            document.getElementById('messageBox').focus();
        }
    }, 1200);
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

document.getElementById('sendButton').addEventListener('click', async function() {
        userMessage = await getUserMessage();
        if (hrTicketFlow === false) {
            generateAnswer(userMessage);
        }
        else {
            // announce that wait is over
            waitingForUser = false;
        }
        messageBox.value = '';
    });

function generateAnswer(message) {
    if (isGreeting(message) && lessThanFiveWords(message)) {
        randomGreeting();
        loading_off();
    } else {
        loading_on();
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
                // var list = ["test1", "test2", "test3", "test4"];
                // sendChoiceList(list);
                randomNoMatchReply();
                loading_off();
            }
            else {
                // console.log(reply); //debug
                sendReply("I believe you will find the answer in the link(s) below:")
                chatlogs.appendChild(document.createElement('br'));

                // let links = JSON.parse(reply);
                // for (let link in reply) {
                    // let linkElement = document.createElement('a');
                    // linkElement.innerText = link;
                    // linkElement.href = reply[link];
                    // linkElement.target = "_blank";
                sendLink(reply);
                // }
            }
            loading_off();
        })
        .then(() => {
            closeOverloadAlert();
        })
    }
}

// Interact with user to create a list for ticket raising
async function createHRTicketList() {
    hrTicketFlow = true;
    console.log("hrTicketFlow running");
    var finalList = [];

    // 1. Get the alpha username
    sendReply("No problem! I will help you to raise a ticket")
    setTimeout(function() {
        sendReply("Please enter your alpha username")
    }, 250);
    document.getElementById('messageBox').focus();
    var nextStep = await waitingOver();
    if (nextStep) {
        console.log("username entered: " + userMessage);
        // let alpha_username = userMessage;
        let alpha_username = "kchang"; // override with my username for testing purpose
        finalList.push(alpha_username);
        // console.log(finalList);
        if (userMessage === "skesmodel") {
            sendReply("Welcome Steen!")
        }
        if (userMessage === "staratukhina") {
            sendReply("Welcome Lana!")
        }
    }

    // 2. Get the ticket type
    var hrTicketList = await grabList("ticketTypes");
    sendReply("Please choose the ticket type");
    sendChoiceList(hrTicketList, "ticketTypeButton");
    var userChoice = await getUserChoice("ticketTypeButton");
    var typeChoice = userChoice.toLowerCase(); // To be used later
    if (typeChoice === "leaver") {
        leaver = true;
    }
    displayUserMessage(userChoice);
    // Now find the index in the type list
    hrTicketList.reverse();
    hrTicketList.unshift("");
    var typeIndex = hrTicketList.findIndex(item => item === userChoice);
    finalList.push(typeIndex);
    // console.log(finalList);

    // 3. Get the full name of the person to action on
    if (typeChoice === "change department") {
        sendReply("Please enter the full name of the person who would be changing department")
    }
    else {
        sendReply("Please enter the full name of the " + typeChoice);
    }
    document.getElementById('messageBox').focus();
    waitingForUser = true;
    nextStep = await waitingOver();
    if (nextStep) {
        console.log("Full name entered: " + userMessage);
        var wordcount = countWords(userMessage);
        while (wordcount < 2) {
            sendReply("Seems like only part of the name was entered, please enter both the firstname and lastname");
            document.getElementById('messageBox').focus();
            waitingForUser = true;
            nextStep = await waitingOver();
            if (nextStep) {
                wordcount = countWords(userMessage);
            }
        }
        console.log("Full name entered: " + userMessage);
        let fullname = userMessage;
        finalList.push(fullname);
        // console.log(finalList);
    }

    // 4. Get the office
    if (typeChoice === "change department") {
        sendReply("Please enter the office location after the change takes place")
    }
    else {
        sendReply("Please enter the office location for the " + typeChoice);
    }
    document.getElementById('messageBox').focus();
    waitingForUser = true;
    nextStep = await waitingOver();
    if (nextStep) {
        console.log("Office: " + userMessage);
        let office = userMessage;
        finalList.push(office);
        // console.log(finalList);
    }

    // 5. Get the stratetic group
    var hrStrategicList = await grabList("strategicGroups");
    if (typeChoice === "change department") {
        sendReply("Please choose the new strategic group after the change takes place");
    }
    else {
        sendReply("Please choose the strategic group");
    }
    sendChoiceList(hrStrategicList, "strategicGroupButton");
    userChoice = await getUserChoice("strategicGroupButton");
    console.log(userChoice);
    displayUserMessage(userChoice);
    // Now find the index in the strategic group list
    hrStrategicList.reverse();
    var strategicIndex = hrStrategicList.findIndex(item => item === userChoice);
    finalList.push(strategicIndex);
    // console.log(finalList);
    
    // 6. Get the relevant mail aliases
    sendReply("Which mail alias(es) is this " + typeChoice + " associated with? (if none can enter n/a)");
    document.getElementById('messageBox').focus();
    waitingForUser = true;
    nextStep = await waitingOver();
    if (nextStep) {
        console.log("Mail aliases: " + userMessage);
        let aliases = userMessage;
        finalList.push(aliases);
        // console.log(finalList);
    }

    // 7. Get the Cost centre
    if (typeChoice === "change department") {
        sendReply("Please enter the new cost centre after the change takes place");
    }
    else {
        sendReply("What is the cost centre for the " + typeChoice + "?");
    }
    document.getElementById('messageBox').focus();
    waitingForUser = true;
    nextStep = await waitingOver();
    if (nextStep) {
        console.log("Cost centre: " + userMessage);
        let costCentre = userMessage;
        finalList.push(costCentre);
        // console.log(finalList);
    }

    // 8. Get the department code
    if (typeChoice === "change department") {
        sendReply("What is the new department code for the person who would be changing department?");
    }
    else {
        sendReply("What is the department code for the " + typeChoice + "?");
    }
    document.getElementById('messageBox').focus();
    waitingForUser = true;
    nextStep = await waitingOver();
    if (nextStep) {
        console.log("Department: " + userMessage);
        let department = userMessage;
        finalList.push(department);
        // console.log(finalList);
    }

    // 9. Get the date that the change will take effect
    var date = "";
    sendReply("What date is this change effective from? (Please use this date format dd-mm-yyyy)");
    document.getElementById('messageBox').focus();
    waitingForUser = true;
    nextStep = await waitingOver();
    if (nextStep) {
        console.log("Date: " + userMessage);
        date = userMessage;
        while (isValidDateFormat(date) === false) {
            sendReply("The date format entered was invalid, please use the date format dd-mm-yyyy, with dashes between the numbers");
            document.getElementById('messageBox').focus();
            waitingForUser = true;
            nextStep = await waitingOver();
            if (nextStep) {
                date = userMessage;
            }
        }
        console.log("Date: " + userMessage);
        finalList.push(date);
        // console.log(finalList);
    }

    // 10. Check if this is a leaver, if yes, ask about holiday arrangement
    if (leaver) {
        sendReply("What is the remaining holiday arrangement?");
        document.getElementById('messageBox').focus();
        waitingForUser = true;
        nextStep = await waitingOver();
        if (nextStep) {
            console.log("Remaining holiday arrangement: " + userMessage);
            let holidayArrangement = userMessage;
            finalList.push(holidayArrangement);
            // console.log(finalList);
        }
    }

    // 11. Any other info
    sendReply("Please enter any additional info");
    document.getElementById('messageBox').focus();
    waitingForUser = true;
    nextStep = await waitingOver();
    if (nextStep) {
        console.log("Additional info: " + userMessage);
        let additional = userMessage;
        finalList.push(additional);
        console.log(finalList);
    }

    sendReply("I will now raise your ticket");
    loading_on();
    var ticketLink = await raiseHRTicket(finalList);
    console.log(ticketLink);
    sendReply("Your ticket has been raised, please use the link below to access and monitor it.");
    sendLink(ticketLink);
    loading_off();
    
    hrTicketFlow = false;
    console.log("hrTicketFlow finished");
}

function raiseHRTicket(listData) {
    return fetch('/raiseHRTicket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({list: listData}),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let receivedLink = data.link; 
        console.log(receivedLink);
        return receivedLink;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


/* functions to work with async functions to wait for user input */

function getUserMessage() {
    return new Promise((resolve, reject) => {
        let messageBox = document.getElementById('messageBox');
        let chatlogs = document.getElementById('chatlogs');

        // If there's a message to send
        if (messageBox.value) {
            displayUserMessage(messageBox.value);
            resolve(messageBox.value.toLowerCase());
        }
    });
}

function getUserChoice(className) {
    return new Promise((resolve, reject) => {
        var buttons = document.getElementsByClassName(className);
        // console.log(buttons.length)
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function(event) {
                var theChoice = this.innerText;
                resolve(theChoice);
            });
        }
    });
}

function waitingOver() {
    return new Promise((resolve, reject) => {
        var interval = setInterval(() => {
            if (waitingForUser === false) {
                clearInterval(interval);
                resolve(true);
            }
        }, 1000); // checks every 1 second
    });
}

/* End of functions to work with async functions to wait for user input */

/* All "Send" functions that sends something to the user */

function sendReply(reply) {
    var replyMessage = document.createElement('p');
    replyMessage.classList.add('ai');
    replyMessage.textContent = "AI: " + reply;
    chatlogs.appendChild(replyMessage);
    chatlogs.appendChild(document.createElement('br'));
    chatlogs.scrollTop = chatlogs.scrollHeight;
}

// receive links with python dictionary format {"xxx": "url"}
function sendLink(links) {
    for (let link in links) {
        let linkElement = document.createElement('a');
        linkElement.innerText = link;
        linkElement.href = links[link];
        linkElement.target = "_blank";
        chatlogs.appendChild(linkElement);
        chatlogs.appendChild(document.createElement('br'));
        chatlogs.scrollTop = chatlogs.scrollHeight;
    }
}

function sendChoiceList(choiceList, buttonClass) {
    choiceList.reverse(); // reverse because items get added to the left of the previous item
    var allChoices = document.createElement('div');
    allChoices.classList.add('choiceDiv');
    for (let choice of choiceList) {
        var choiceButton = document.createElement('button');
        choiceButton.classList.add(buttonClass);
        choiceButton.innerText = choice;
        allChoices.appendChild(choiceButton);
    }
    chatlogs.appendChild(allChoices);
    chatlogs.scrollTop = chatlogs.scrollHeight;
}

function displayUserMessage(message) {
    let newMessage = document.createElement('p');
    newMessage.classList.add('user');
    newMessage.textContent = "User: " + message;
    chatlogs.appendChild(newMessage);
    chatlogs.appendChild(document.createElement('br'));
    // Scroll to the bottom of the chat
    chatlogs.scrollTop = chatlogs.scrollHeight;
}

/* End of All "Send" functions that sends something to the user */


function randomNoMatchReply() {
    var randomNumber = Math.floor(Math.random() * 5) + 1;
    var messages = ["I'm afraid I'm not able to help you with this issue. Please raise a ticket.",
                    "I'm sorry, but I'm not able to resolve this issue. Please raise a ticket and a member of our support team will deal with it.",
                    "I'm not able to help you with this issue. Please raise a ticket so that a member of our team can investigate further.",
                    "I'm unable to resolve this issue. Please raise a ticket and a member of our team will help.",
                    "I'm sorry, but I can't help you with this issue. Please raise a ticket so that a member of our technical support team can assist you."];
    var reply = messages[randomNumber - 1];
    sendReply(reply);
}

/* Loading animation and alert toggles */

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

/* End of Loading animation and alert toggles */

function grabList(listName) {
    return fetch('/grabList?listName=' + listName)
      .then(response => response.json())
      .then(data => {
        var list = data.reply;
        
        // Process the reply
        // console.log(list);
        return list;
      })
      .catch(error => {
        console.error('Error:', error);
        return null;
      });
}

/* Greeting identification and reply section */

function isGreeting(inputString) {
    const wordList = ["hi", "hello", "greeting", "greetings", "howdy", "aloha", "konnichiwa",
                        "buenos dias", "guten tag", "salaam", "namaste", "hey"];
    let found = false;
    for (let word of wordList) {
        if (inputString.includes(word)) {
            found = true;
            break;
        }
    }
    if (found) {
        return true;
    } else {
        return false;
    }
}

function lessThanFiveWords(inputString) {
    const words = inputString.split(' ');

    if (words.length < 5) {
        return true;
    } else {
        return false;
    }
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
    sendReply(greeting);
}

/* End of Greeting identification and reply section */

function countWords(str) {
    // Split the string into an array of words
    var wordsArray = str.trim().split(/\s+/);
  
    // Return the number of words
    return wordsArray.length;
}

function isValidDateFormat(date) {
    // Regular expression to match date in "dd-mm-yyyy" format
    const regex = /^(0[1-9]|[12][0-9]|3[01])[-](0[1-9]|1[012])[-]\d{4}$/;
  
    if (regex.test(date)) {
        return true;
    } else {
        return false;
    }
}

// general testing function

function test() {
    fetch('/test')
      .then(response => response.json())
      .then(data => {
        test = data.reply;
        
        // Process the reply
        console.log(test);
      })
      .catch(error => console.error('Error:', error));
}

