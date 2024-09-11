let quickReplies = ["Yes", "No","Maybe"];
let card = {
    body: []
};
let columns = [];
for (let i = 0; i < quickReplies.length; i++) {
    let actionSet = {
        "type": "ActionSet",
        "horizontalAlignment": "Left",
        "separator": true,
        "actions": [
            {
                "type": "Action.Submit",
                "title": quickReplies[i],
                "data": {
                    "msteams": {
                        "type": "messageBack",
                        "displayText": quickReplies[i],
                        "text": quickReplies[i] == "No" ? "I have an issue" : quickReplies[i]
                    }
                }
            }
        ]
    };
    let column = {
        "type": "Column",
        "width": "auto",
        "items": [actionSet]
    };
    columns.push(column);
}
let text = {
    "type": "TextBlock",
    "text": `Have you completed the steps for **${context.session.BotUserSession.instructionsHeadingsArray[context.session.BotUserSession.currentInstructionsIndex]}**. Please select **YES** to proceed to next steps or **NO** if you require assistance.`,
    "wrap": true
};
// Push the text block into the body
card.body.push(text);
// Push the columns into the body
card.body.push({
    "type": "ColumnSet",
    "columns": columns
});
let message = {
    "attachments": [{
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
            "type": "AdaptiveCard",
            "version": "1.4",
            "body": card.body,
            "msteams": {
                "width": "Full"
            }
        }
    }]
};
print(JSON.stringify(message));
