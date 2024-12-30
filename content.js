// Author: Aditya Arya
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the webpage level activities (e.g. manipulating page data, etc.)
// License: MIT
const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

const ASSET_URL = {
    "close": chrome.runtime.getURL("assets/close.png"),
    "send":chrome.runtime.getURL("assets/play.png"),
    "delete":chrome.runtime.getURL("assets/delete.png")
}
const COLORS={
    "Blue":"#005C83",
    "Dark_blue":"#012B41",
    "Beige":"#EFEBDA",
    "Light_green":"#1D655D",
    "White":"#FFFFFF",
    "Light_gray":"#E0E0E0",
    "Black": "#000000",
    "Light_blue":"#DCF5FE"
}

const codingDesContainerClass = "py-4 px-3 coding_desc_container__gdB9M";
const AI_Helper_Button_ID = "add-chatbot-button";
const ChatboxContainer_id = "AI-Chatbox-Container";

let lastVisitedPage = "";

function isProblemsRoute() {
    const pathname = window.location.pathname;
    return pathname.startsWith("/problems/") && pathname.length > "/problems/".length;
}

function isPageChange() {
    const currentPath = window.location.pathname;
    if (lastVisitedPage === currentPath) return false;
    lastVisitedPage = currentPath;
    return true;
}

function handlePageChange(){
        cleanUpPage();
        addInjectScript();
        addChatBotButton();
}

function cleanUpPage(){
    const existingButton = document.getElementById(AI_Helper_Button_ID);
    if(existingButton) existingButton.remove();

    const existingChatContainer = document.getElementById(ChatboxContainer_id);
    if(existingChatContainer)existingChatContainer.remove();
}

function addInjectScript(){
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject.js");
    document.documentElement.insertAdjacentElement("afterbegin",script);
    script.remove();
}

function addChatBotButton() {
    if (document.getElementById("add-chatbot-button")) {
        console.log("Chatbot button already exists, skipping creation.");
        return;
    }
    const ChatBotButton = document.createElement('button');
    ChatBotButton.id = "add-chatbot-button";
    ChatBotButton.textContent = "Chatbot"; // Add button text

    // Style the button
    ChatBotButton.style.height = "40px";
    ChatBotButton.style.width = "100px";
    ChatBotButton.style.background = "linear-gradient(90deg, #00648F, #00A1D9)";
    //ChatBotButton.style.backgroundColor = "#00648F"; // Button color
    ChatBotButton.style.color = "#FFFFFF"; // Text color
    ChatBotButton.style.border = "none"; // Remove border
    ChatBotButton.style.borderRadius = "5px"; // Rounded corners
    ChatBotButton.style.cursor = "pointer";
    ChatBotButton.style.fontSize = "16px";

    // Add hover effect
    ChatBotButton.addEventListener("mouseenter", () => { 
        ChatBotButton.style.backgroundColor = "#0056b3";
    });
    ChatBotButton.addEventListener("mouseleave", () => {
        ChatBotButton.style.backgroundColor = "#007BFF";
    });

    const CodingDescContainer = document.getElementsByClassName(codingDesContainerClass)[0];
    CodingDescContainer.insertAdjacentElement("beforeend",ChatBotButton);

    ChatBotButton.addEventListener("click", ()=>{
        if(!document.getElementById(ChatboxContainer_id))
        OpenChatBot();//injectChatInterface(ChatboxContainer_id);
    });

}
// Observe for page changes
const observer = new MutationObserver(() => {
    if (isPageChange() && isProblemsRoute()) {
        console.log("Detected route change to /problems/*");
        //addChatBotButton();
        handlePageChange();
    }
});

// Observe the root element for changes
observer.observe(document.body, {
    childList: true,  // Observe addition or removal of nodes
    subtree: true     // Observe the entire subtree of the document
});

console.log("MutationObserver is now active");

function deleteChatHistory() {
    const AZProblemURL = window.location.href;
    chrome.storage.sync.get(["chatHistory"], (result) => {
        const chatHistory = result.chatHistory || {};
        delete chatHistory[AZProblemURL];
        chrome.storage.sync.set({ chatHistory }, () => {
            const chatMessages = document.getElementById("chat-messages");
            chatMessages.innerHTML = ""; // Clear UI
            console.log("Chat history cleared for the current problem.");
        });
    });
}

ChatboxContainer_id.appendChild(clearStorageButton);
function injectChatInterface(ChatboxContainer_id){
    const chatboxContainer = document.createElement('div');
    chatboxContainer.id = "AI-Chatbox-Container";
    chatboxContainer.style.cssText = `
        width: 100%;
        height: 400px;
        display: flex;
        flex-direction: column;
        background-color: ${COLORS["white"]};
        border: 1px solid ${COLORS["Light_blue"]};
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
        border-radius: 20px;
        overflow: hidden;
    `;
    //Header
    const chatHeader = document.createElement("div");
chatHeader.style.cssText = `
    display: flex;
    justify-content: space-between; /* Spread heading and buttons */
    align-items: center; /* Vertically align items */
    padding: 10px;
    background-color: ${COLORS["Light_blue"]};
    color: ${COLORS["Black"]};
    font-size: 16px;
    font-weight: bold;
`;

// Heading
const chatHeading = document.createElement("span");
chatHeading.innerText = "My AI ChatBot";
chatHeading.style.cssText = `
    margin-left: 10px; /* Add spacing from the left edge */
`;
chatHeader.appendChild(chatHeading);

// Button Container
const buttonContainer = document.createElement("div");
buttonContainer.style.cssText = `
    display: flex;
    gap: 10px; /* Add spacing between buttons */
    align-items: center; /* Vertically align buttons */
`;

// Delete button
const deleteButton = document.createElement("img");
deleteButton.src = ASSET_URL["delete"];
deleteButton.style.cssText = `
    width: 20px;
    height: 20px;
    border-radius: 50%; 
    cursor: pointer;
`;
deleteButton.addEventListener("click", () => deleteChatHistory());
buttonContainer.appendChild(deleteButton);

// Close button
const closeButton = document.createElement("img");
closeButton.src = ASSET_URL["close"];
closeButton.style.cssText = `
    width: 20px;
    height: 20px;
    border-radius: 50%; 
    cursor: pointer;
`;
closeButton.addEventListener("click", () => chatboxContainer.remove());
buttonContainer.appendChild(closeButton);

// Add button container to the header
chatHeader.appendChild(buttonContainer);

    //Chat messages area
    const chatMessages = document.createElement("div");
    chatMessages.id = "chat-messages";
    chatMessages.style.cssText= `
    flex:1;
    padding: 10px;
    overflow-y: auto;
    background-color: ${COLORS["Light_gray"]};
    `;
    //INPUT area

    const chatInputContainer = document.createElement("div");
    chatInputContainer.style.cssText = `
    display: flex;
    padding: 10px;
    align-items : center;
    background-color: ${COLORS["Beige"]};
    border-top: 1px solid ${COLORS["Light_gray"]};
    width: 100%;
    `;

    const chatInput = document.createElement("textarea");
    chatInput.id = "chat-input";
    chatInput.placeholder = "Type your query...";
    chatInput.rows = 2;
    chatInput.style.cssText = `
    flex:1;
    padding: 8px;
    border: 1px solid ${COLORS["Light_gray"]};
    border-radius: 5px;
    outline: none;
    resize: none;
    font-size: 14px;
    line-height: 1.4;
    background-color: ${COLORS["white"]};
    `;      
    const sendButton = document.createElement('img');
    sendButton.src = ASSET_URL["send"];
    sendButton.alt = "Send";
    sendButton.style.cssText = `
    width: 25px;
    height: 25px;
    border-radius: 50%; 
    margin: auto 0;
    cursor: pointer;
    `;
    sendButton.addEventListener("click",() => handleUserMessage());

    //Assembly
    chatInputContainer.appendChild(chatInput);
    chatInputContainer.appendChild(sendButton);

    chatboxContainer.appendChild(chatHeader);
    chatboxContainer.appendChild(chatMessages);
    chatboxContainer.appendChild(chatInputContainer);

    //document.getElementById(ChatboxContainer_id).appendChild(chatboxContainer);

    return chatboxContainer;
}
function getProblemStatement() {
    const descriptionElement = document.getElementsByClassName("undefined markdown-renderer")[0];
    if (descriptionElement) {
        return descriptionElement.textContent || descriptionElement.innerText; // text extraction 
    }
    return "Problem statement could not be retrieved."; // Fallback
}
function getInputFormat() {
    const inputDes = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[0];
    if (inputDes) {
        let content = inputDes.textContent || inputDes.innerText;

        // Replace superscripts with their numeric equivalents
        const superscriptMap = {
            '⁰': '0',
            '¹': '1',
            '²': '2',
            '³': '3',
            '⁴': '4',
            '⁵': '5',
            '⁶': '6',
            '⁷': '7',
            '⁸': '8',
            '⁹': '9'
        };

        // Replace superscripts in the text
        content = content.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (match) => superscriptMap[match]);

        return content;
    }
    return "Input format could not be retrieved.";
}
function getOutputFormat() {
    const outputDes = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[1];
    if (outputDes) {
        let content = outputDes.textContent || outputDes.innerText;

        // Replace superscripts with their numeric equivalents
        const superscriptMap = {
            '⁰': '0',
            '¹': '1',
            '²': '2',
            '³': '3',
            '⁴': '4',
            '⁵': '5',
            '⁶': '6',
            '⁷': '7',
            '⁸': '8',
            '⁹': '9'
        };

        // Replace superscripts in the text
        content = content.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (match) => superscriptMap[match]);

        return content;
    }
    return "Output format could not be retrieved.";
}
function getConstraints(){
    const consdes = document.getElementsByClassName("coding_input_format__pv9fS problem_paragraph")[2];
    if(consdes)
    {
        return consdes.innerText || consdes.textContent;
    }
    return "No constraints."
}

function getSampleTestCases() {
    const testCaseInput = document.getElementsByClassName("coding_input_format_container__iYezu mb-0 flex-grow-1 p-3 ")[0];
    const testCaseOutput = document.getElementsByClassName("coding_input_format_container__iYezu mb-0 flex-grow-1 p-3 ")[1];

    // Extract input and output text
    const inputTestCases = testCaseInput.innerText; //|| testCaseElements[0]?.textContent || "No input cases found.";
    const outputTestCases = testCaseOutput.innerText;// || testCaseElements[1]?.textContent || "No output cases found.";

    return [inputTestCases, outputTestCases];
}

function OpenChatBot() {
    const AZPrpblemURL = window.location.href;
    const UniqueId = extractProblemID(AZPrpblemURL);
    const ProblemName = document.getElementsByClassName("Header_resource_heading__cpRp1 rubik fw-bold mb-0 fs-4")[0];
    const problemStatement = getProblemStatement(); // Replace with actual selector
    const [testCases,testOutputs] = getSampleTestCases();
    const ChatbotObj = {
        id: UniqueId,
        name: ProblemName,
        url: AZPrpblemURL
    }

    const problemContext = {
        statement: problemStatement,
        testCases: testCases,
        outputs: testOutputs,
    };


    // Store the problem context in Chrome storage for later use
    chrome.storage.sync.set({ problemContext })
    // Create the chat modal
    const chatboxContainer = injectChatInterface(ChatboxContainer_id);
    const chatButton = document.getElementById("add-chatbot-button"); 

// Ensure chatButton exists
if (chatButton) {
    // Insert chatbox right after the chat button
    chatButton.insertAdjacentElement('afterend', chatboxContainer);
} else {
    console.error("Chat button not found!");
}
loadChatHistory();
console.log("Chatbox successfully injected.");

}
async function handleUserMessage(){
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");
    //User message
    const userMessage = chatInput.value.trim();

    if(!userMessage) return; // skip empty messages

    //addMessageToChatHistory(userMessage, chatMessages, false);
    const userMessageElement = document.createElement("div");
    userMessageElement.style.cssText = `
    padding: 8px;
    margin: 5px;
    background-color:${COLORS["Blue"]};
    color: ${COLORS["White"]};
    border-radius: 5px;
    align-self: flex-end;
    max-width: 100%;
    word-wrap: break-word;
    text-align: right;
    `;

    userMessageElement.innerText = userMessage;
    chatMessages.appendChild(userMessageElement);

    chatInput.value = "";

    try {
        // Send message to API and get bot's reply
        const botReply = await sendMessagetoAPI(userMessage);

        // Display bot's reply
        const botMessageElement = document.createElement("div");
        botMessageElement.style.cssText = `
            padding: 8px;
            margin: 5px;
            background-color: ${COLORS["Beige"]};
            color: ${COLORS["Black"]};
            border-radius: 5px;
            align-self: flex-end;
            max-width: 100%;
            word-wrap: break-word;
        `;
        botMessageElement.innerText = botReply;
        chatMessages.appendChild(botMessageElement);

        //addMessageToChatHistory(botReply, chatMessages, true);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error("Error handling user message:", error);
    }
}
   
//let botPrimed = false;
async function sendMessagetoAPI(userMessage) {
    const problemStatement = getProblemStatement(); // Replace with actual selector
    const [testCases, testOutputs] = getSampleTestCases();
    const inputFormat = getInputFormat();
    const outputFormat = getOutputFormat();
    const constFormat = getConstraints();
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                action: "sendMessageToBot",
                message: userMessage,
                context: {
                    prompt: "IMPORTANT INSTRUCTIONS: You are an assistant for solving coding problems. Only respond to queries directly related to the given problem statement. For unrelated questions, reply with: \"Please provide a specific question related to the problem!\" Read the problem below and only answer queries about it.",
                    statement: problemStatement,
                    inputformat: inputFormat,
                    outputformat: outputFormat,
                    constformat:constFormat,
                    testCases: testCases,
                    outputs: testOutputs,
                },
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                } else {
                    resolve(response.reply || "Sorry, I couldn't process your request.");
                }
            }
        );
    });
}
// content.js
function loadChatHistory() {
    const chatMessages = document.getElementById("chat-messages");
    const AZProblemURL = window.location.href;

    chrome.storage.sync.get(["chatHistory"], (result) => {
        const chatHistory = result.chatHistory || {};
        const currentHistory = chatHistory[AZProblemURL] || [];

        currentHistory.forEach(({ text, isBot }) => {
            const messageElement = document.createElement("div");
            messageElement.textContent = text;
            messageElement.style.cssText = `
                padding: 8px;
                margin: 5px;
                background-color: ${isBot ? COLORS["Beige"] : COLORS["Blue"]};
                color: ${isBot ? COLORS["Black"] : COLORS["White"]};
                border-radius: 5px;
                align-self: ${isBot ? "flex-start" : "flex-end"};
                max-width: 70%;
                word-wrap: break-word;
            `;
            chatMessages.appendChild(messageElement);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}
function addMessageToChatHistory(message, isBot) {
    const chatMessages = document.getElementById("chat-messages");
    
    // Create message element
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.style.cssText = `
        padding: 8px;
        margin: 5px;
        background-color: ${isBot ? COLORS["Beige"] : COLORS["Blue"]};
        color: ${isBot ? COLORS["Black"] : COLORS["White"]};
        border-radius: 5px;
        align-self: ${isBot ? "flex-start" : "flex-end"};
        max-width: 70%;
        word-wrap: break-word;
    `;
    chatMessages.appendChild(messageElement);

    // Save to storage
    const AZProblemURL = window.location.href;
    chrome.storage.sync.get(["chatHistory"], (result) => {
        const chatHistory = result.chatHistory || {};
        if (!chatHistory[AZProblemURL]) {
            chatHistory[AZProblemURL] = [];
        }
        chatHistory[AZProblemURL].push({ text: message, isBot });
        chrome.storage.sync.set({ chatHistory });
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function extractProblemID(url) {
    const start = url.indexOf("problems/") + "problems/".length; // Find start of the ID
    const end = url.indexOf("?", start); // Find the next "?" after "problems/"
    return end === -1 ? url.slice(start) : url.slice(start, end); // Extract ID
}
