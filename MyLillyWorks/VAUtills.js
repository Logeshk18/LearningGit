const axios = require('axios');
var config = require("./config.json");
var redisClient = require("./lib/RedisClient").createClient(config.redis);

// var endMsg = { "attachments": [{ "contentType": "application/vnd.microsoft.card.adaptive", "content": { "type": "AdaptiveCard", "version": "1.4", "body": [{ "type": "TextBlock", "text": "Is there anything else I can help you with?", "wrap": true }, { "type": "ColumnSet", "columns": [{ "type": "Column", "width": "auto", "items": [{ "type": "ActionSet", "horizontalAlignment": "Left", "separator": true, "actions": [{ "type": "Action.Submit", "title": "No", "data": { "msteams": { "type": "messageBack", "displayText": "No", "text": "No" } } }] }] }, { "type": "Column", "width": "auto", "items": [{ "type": "ActionSet", "horizontalAlignment": "Left", "separator": true, "actions": [{ "type": "Action.Submit", "title": "Yes", "data": { "msteams": { "type": "messageBack", "displayText": "Yes", "text": "Yes" } } }] }] }] }], "msteams": { "width": "Full" } } }] }
var endMsg = "Is there anything else I can help you with?";

function generateRandom12DigitNumber() {
    const min = 100000000000;
    const max = 999999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function prepareRequestBody(data, userInput) {

    const random12DigitNumber = generateRandom12DigitNumber();
    var minSec = new Date().getTime();
    var profileInfo = data.context.session.UserSession.profileInfo
    let msgId = profileInfo.email
    let userID = await redisClient.get("UserId:::" + msgId)

    const requestBody = {
        requestId: random12DigitNumber,
        clientSessionId: data.context.session.BotUserSession.conversationSessionId,
        nowSessionId: "",
        message: {
            text: userInput,
            typed: true,
            clientMessageId: "ABC-123"
        },
        userId: userID,
        emailId: profileInfo.email,
        clientVariables: {
            visitor_id: data.context.session.UserContext._id,
            emailId: profileInfo.email
        },
        timestamp: minSec,
        timezone: profileInfo.timezone
    };

    return requestBody;
}
async function prepareRequestBodyForSessionClosure(data) {

    const random12DigitNumber = generateRandom12DigitNumber();
    var minSec = new Date().getTime();
    var profileInfo = data.context.session.UserSession.profileInfo
    let msgId = profileInfo.email
    let userID = await redisClient.get("UserId:::" + msgId)

    const requestBody = {
        requestId: random12DigitNumber,
        action: "END_CONVERSATION",
        clientSessionId: data.context.session.BotUserSession.conversationSessionId,
        nowSessionId: "",
        message: {
            text: "",
            typed: true,
            clientMessageId: "ABC-123"
        },
        userId: userID,
        emailId: profileInfo.email,
        clientVariables: {
            visitor_id: data.context.session.UserContext._id,
            emailId: profileInfo.email,
            endChat: "Ended"
        },
        timestamp: minSec,
        timezone: profileInfo.timezone
    };

    return requestBody;
}
async function prepareRequestBodyForSessionClosureEndChat(data) {

    const random12DigitNumber = generateRandom12DigitNumber();
    var minSec = new Date().getTime();
    var profileInfo = data.context.session.UserSession.profileInfo
    let msgId = profileInfo.email
    let userID = await redisClient.get("UserId:::" + msgId)

    const requestBody = {
        requestId: random12DigitNumber,
        action: "END_CONVERSATION",
        clientSessionId: data.context.session.BotUserSession.conversationSessionId,
        nowSessionId: "",
        message: {
            text: "",
            typed: true,
            clientMessageId: "ABC-123"
        },
        userId: userID,
        emailId: profileInfo.email,
        clientVariables: {
            visitor_id: data.context.session.UserContext._id,
            emailId: profileInfo.email
        },
        timestamp: minSec,
        timezone: profileInfo.timezone
    };

    return requestBody;
}

async function makePostRequestServiceNow(requestBody) {

    const url = config.SnowVA.postURL;
    const username = config.SnowVA.username;
    const password = config.SnowVA.password;
    try {
        const response = await axios.post(url, requestBody,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': config.SnowVA.token,
                    'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')
                }
            });

        const responseData = response.data;
        console.log(new Date() + ` Post Request Body:::::${JSON.stringify(requestBody)})`);

        // Verify if the response has status code 200 and a success message
        if (response.status === 200 && responseData.status === 'success') {
            console.log(new Date() + ` POST ServiceNow request successful:::: STATUS_CODE: ${response.status}`);

        }
        else {
            let msgId = requestBody.clientVariables.emailId;
            await redisClient.set("PostSnowRequest:::" + msgId, "Failure", 'EX', 60);
            console.log(new Date() + ` POST ServiceNow request failed:::: STATUS_CODE:${response.status}`);
            console.log(new Date() + ` Error:::Response data: ${responseData}`);

        }
    }
    catch (error) {
        let msgId = requestBody.clientVariables.emailId;
        await redisClient.set("PostSnowRequest:::" + msgId, "Failure", 'EX', 60);
        console.error(new Date() + ` Error making POST request::: ${error}`);
    }
}

async function getResponseServiceNow(msgId, responseData) {

    try {

        const inputJson = responseData;
        if (inputJson.body.length > 0) {
            const result = await convertToResultArray(inputJson.body);
            return result;
        }
    }
    catch (error) {
        console.error(new Date() + ` Error fetching or processing input JSON::: ${error}`);
        return [];
    }
}
// Method to convert UI elements and return result array
async function convertToResultArray(body) {
    const resultArray = [];

    body.forEach(element => {

        if (element.group == "DefaultText" && element.value != "undefined") {
            if (element.value == "The conversation has ended. If you need help again, type hi.") {
                if (!resultArray.includes(endMsg)) {
                    resultArray.push(endMsg);
                }
            }
            else if (element.value != "Can't find a valid record") {
                resultArray.push(element.value || element.label);
            }
        }
        if (element.group == "DefaultPicker") {
            resultArray.push(convertToResultTemplate(element));

        }
        if (element.group == "DefaultDate" || element.group == "DefaultHtml") {
            resultArray.push(element.value || element.label || element.message);
        }
        if (element.group == "DefaultOutputCard" && element.templateName == "Card") {
            resultArray.push(generateAdaptiveCard(element));
        }
        if (element.group == "DefaultOutputCard" && element.templateName == "CatalogCard") {
            resultArray.push(generateCatalogCard(element));
        }
        if (element.group == "DefaultOutputCard" && element.templateName == "QACard") {
            resultArray.push(generateCatalogQACard(element));
        }
        if (element.group == "DefaultOutputLink") {
            resultArray.push(generateOutputLinkTemplate(element));
        }
    });

    return resultArray;
}
// Function to convert TopicPickerControl to Teams template
function convertToResultTemplate(uiElement) {
    if (uiElement.uiType && uiElement.options) {
        var options = uiElement.options.map(option => {
            if (option.label == "I need more help...") {
                return {
                    title: "End Catalog Search",
                    type: "imBack",
                    value: "6767898911223344"
                };
            }
            else {
                return {
                    title: option.label,
                    type: "imBack",
                    value: option.value
                };
            }
        });
        options = options.filter(option => {
            if (option.title == "Dynamic Translation Support Topic") {
                return false
            }
            else {
                return true
            }
        })
        return {
            attachments: [
                {
                    contentType: "application/vnd.microsoft.card.hero",
                    content: {
                        text: uiElement.promptMsg || uiElement.label,
                        buttons: options
                    }
                }
            ]
        };
    }
}

function formatDate(date) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options).replace(',', '');
}
// Function to generate the Adaptive Card
function generateAdaptiveCard(element) {
    let data = JSON.parse(element.data);
    let title = data.title;
    let subtitle = data.subtitle;
    let url;
    if (data.sys_id) {
        url = config.SnowVA.ticketUrl + data.sys_id
    }
    else {
        let dynamicKey = data.dataNowSmartLink;
        url = element.smartLinksMetadata[dynamicKey].source;
    }
    let date = new Date();
    let formattedDate = formatDate(date);
    let body = [];
    body.push({
        type: "TextBlock",
        text: title,
        wrap: true,
        fontType: "Default"
    });

    body.push({
        type: "TextBlock",
        text: `Ticket Number: ${subtitle}`,
        wrap: true
    });

    body.push({
        type: "TextBlock",
        text: `Date: ${formattedDate}`,
        wrap: true
    });

    var obj = {
        type: "ColumnSet",
        columns: [
            {
                type: "Column",
                width: "stretch",
                items: [
                    {
                        type: "ActionSet",
                        actions: [
                            {
                                type: "Action.OpenUrl",
                                title: "View Request Details",
                                url: url
                            }
                        ],
                    },
                ],
            },
        ],
    };
    body.push(obj);

    var message = {
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    version: "1.4",
                    body: body,
                    msteams: {
                        width: "Full",
                    },
                },
            },
        ],
    };

    return message;
}
// Function to generate the Adaptive Card template for OutputLink
function generateOutputLinkTemplate(element) {
    let header = element.header;
    let link = element.value.action
    let body = [];

    body.push({
        type: "TextBlock",
        text: header,
        wrap: true,
        weight: "bolder",
        size: "large"
    });

    body.push({
        type: "ActionSet",
        actions: [
            {
                type: "Action.OpenUrl",
                title: "Request Form Link",
                url: link
            }
        ]
    });

    var message = {
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    version: "1.4",
                    body: body,
                    msteams: {
                        width: "Full",
                    },
                },
            },
        ],
    };

    return message;
}

function generateCatalogCard(element) {
    const dataObj = JSON.parse(element.data)
    const header = dataObj.header;
    const description = dataObj.description;
    const linkLabel = dataObj.linkLabel;
    const source = dataObj.linkHref

    if (source) {
        return {
            attachments: [
                {
                    contentType: "application/vnd.microsoft.card.adaptive",
                    content: {
                        type: "AdaptiveCard",
                        version: "1.4",
                        body: [
                            {
                                type: "TextBlock",
                                text: "Here is the requested item",
                                separator: true,
                                spacing: "extraLarge",
                                weight: "bolder"
                            },
                            {
                                type: "ColumnSet",
                                columns: [
                                    {
                                        type: "Column",
                                        width: 1,
                                        items: [
                                            {
                                                type: "Image",
                                                url: "https://media.istockphoto.com/id/1216074470/vector/definitely-feedback.jpg?s=612x612&w=0&k=20&c=w8zvNi6chxR_9Anp8EsBmhZp5AAVgEVFf1lC5Ne5vww=",
                                                width: "100px",
                                                height: "100px"
                                            }
                                        ]
                                    },
                                    {
                                        type: "Column",
                                        width: 2,
                                        items: [
                                            {
                                                type: "TextBlock",
                                                text: header,
                                                weight: "bolder",
                                                size: "medium",
                                                spacing: "none",
                                                wrap: true
                                            },
                                            {
                                                type: "TextBlock",
                                                text: description || "",
                                                size: "Small",
                                                wrap: true,
                                                maxLines: 5
                                            },
                                            {
                                                type: "ActionSet",
                                                actions: [
                                                    {
                                                        type: "Action.OpenUrl",
                                                        title: linkLabel || "View Details",
                                                        url: source
                                                    }
                                                ]
                                            }

                                        ]
                                    }
                                ]
                            }
                        ],
                        msteams: {
                            width: "Full"
                        }
                    }
                }
            ]
        };
    }
    else {
        return {
            attachments: [
                {
                    contentType: "application/vnd.microsoft.card.adaptive",
                    content: {
                        type: "AdaptiveCard",
                        version: "1.4",
                        body: [
                            {
                                type: "TextBlock",
                                text: "Here is the requested item",
                                separator: true,
                                spacing: "extraLarge",
                                weight: "bolder"
                            },
                            {
                                type: "ColumnSet",
                                columns: [
                                    {
                                        type: "Column",
                                        width: 1,
                                        items: [
                                            {
                                                type: "Image",
                                                url: "https://media.istockphoto.com/id/1216074470/vector/definitely-feedback.jpg?s=612x612&w=0&k=20&c=w8zvNi6chxR_9Anp8EsBmhZp5AAVgEVFf1lC5Ne5vww=",
                                                width: "100px",
                                                height: "100px"
                                            }
                                        ]
                                    },
                                    {
                                        type: "Column",
                                        width: 2,
                                        items: [
                                            {
                                                type: "TextBlock",
                                                text: header,
                                                weight: "bolder",
                                                size: "medium",
                                                spacing: "none",
                                                wrap: true
                                            },
                                            {
                                                type: "TextBlock",
                                                text: description || "",
                                                size: "Small",
                                                wrap: true,
                                                maxLines: 5
                                            }

                                        ]
                                    }
                                ]
                            }
                        ],
                        msteams: {
                            width: "Full"
                        }
                    }
                }
            ]
        };
    }
}


function generateCatalogQACard(element) {
    const dataObj = JSON.parse(element.data)
    const header = dataObj.header;
    const description = dataObj.description;
    const linkLabel = dataObj.linkLabel;
    const source = dataObj.linkHref

    return {
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    version: "1.4",
                    body: [
                        {
                            type: "TextBlock",
                            text: "Here is the requested KB article",
                            separator: true,
                            spacing: "extraLarge",
                            weight: "bolder"
                        },
                        {
                            type: "ColumnSet",
                            columns: [
                                {
                                    type: "Column",
                                    width: 2,
                                    items: [
                                        {
                                            type: "TextBlock",
                                            text: header,
                                            weight: "bolder",
                                            size: "medium",
                                            spacing: "none",
                                            wrap: true
                                        },
                                        {
                                            type: "TextBlock",
                                            text: description || "",
                                            size: "Small",
                                            wrap: true,
                                            maxLines: 5
                                        },
                                        {
                                            type: "ActionSet",
                                            actions: [
                                                {
                                                    type: "Action.OpenUrl",
                                                    title: linkLabel || "View Details",
                                                    url: source
                                                }
                                            ]
                                        }

                                    ]
                                }
                            ]
                        }
                    ],
                    msteams: {
                        width: "Full"
                    }
                }
            }
        ]
    };
}
module.exports = {
    prepareRequestBody,
    makePostRequestServiceNow,
    getResponseServiceNow,
    generateOutputLinkTemplate,
    generateCatalogCard,
    generateCatalogQACard,
    prepareRequestBodyForSessionClosure,
    prepareRequestBodyForSessionClosureEndChat,
    formatDate
}
