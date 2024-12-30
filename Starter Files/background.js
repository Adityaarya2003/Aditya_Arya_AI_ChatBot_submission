// background.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the browser level activities (e.g. tab management, etc.)
// License: MIT
const API_KEY = "AIzaSyBmGun-LIXoXlzhkhKUSnElf7Im9Lk5tJI";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sendMessageToBot") {
        const { message, context } = request;

        // Prepare payload for API
        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: `
                    ${context.prompt}
                    
                    Problem Statement:
                    ${context.statement}

                    Input Format:
                    ${context.inputformat};

                    Output Format:
                    ${context.outputformat};
                    
                    Constraints:
                    ${context.constformat};
                    
                    Sample Test Cases:
                    ${context.testCases ? context.testCases : "No sample test cases provided."}
                    
                    Expected Outputs:
                    ${context.outputs ? context.outputs : "No expected outputs provided."}
                    
                    User Query:
                    ${message}
                    `,
                        },
                    ],
                },
            ],
        };

        // Fetch response from Gemini API
        fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBmGun-LIXoXlzhkhKUSnElf7Im9Lk5tJI", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process your request.";
                sendResponse({ reply: botReply });
            })
            .catch((error) => {
                console.error("Error in API call:", error);
                sendResponse({ reply: "Sorry, I couldn't process your request." });
            });

        return true; // Keep the message channel open for async response
    }
});