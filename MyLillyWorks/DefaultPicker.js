// function defaultPickerTemplate(uiElement) {
//     if (uiElement.uiType && uiElement.options) {

//         let card = {
//             body: []
//         };
//         let columns = [];

//         let text = {
//             "type": "TextBlock",
//             "text": uiElement.promptMsg || uiElement.label,
//             "wrap": true
//         };
//         card.body.push(text);

//         var options = uiElement.options.map(option => {
//             if (option.label == "I need more help...") {
//                 var actionSet = {
//                     "type": "ActionSet",
//                     "horizontalAlignment": "Left",
//                     "separator": true,
//                     "actions": [
//                         {
//                             "type": "Action.Submit",
//                             "title": "End Catalog Search",
//                             "data": {
//                                 "msteams": {
//                                     "type": "messageBack",
//                                     "displayText": "End Catalog Search",
//                                     "text": "6767898911223344"
//                                 }
//                             }
//                         }
//                     ]
//                 };
//             }
//             else {
//                 var actionSet = {
//                     "type": "ActionSet",
//                     "horizontalAlignment": "Left",
//                     "separator": true,
//                     "actions": [
//                         {
//                             "type": "Action.Submit",
//                             "title": option.label,
//                             "data": {
//                                 "msteams": {
//                                     "type": "messageBack",
//                                     "displayText": option.label,
//                                     "text": option.label
//                                 }
//                             }
//                         }
//                     ]
//                 };
//             }
//             let column = {
//                 "type": "Column",
//                 "width": "auto",
//                 "items": [actionSet]
//             };
//             columns.push(column);
//         });
//         columns = columns.filter(column => {
//             if (column.items[0].actions[0].title == "Dynamic Translation Support Topic") {
//                 return false
//             }
//             else {
//                 return true
//             }
//         })
//         card.body.push({
//             "type": "ColumnSet",
//             "columns": columns
//         });

//         return {
//             "attachments": [{
//                 "contentType": "application/vnd.microsoft.card.adaptive",
//                 "content": {
//                     "type": "AdaptiveCard",
//                     "version": "1.4",
//                     "body": card.body,
//                     "msteams": {
//                         "width": "Full"
//                     }
//                 }
//             }]
//         };

//     }
// }

let e = {
    "uiType": "Picker",
    "group": "DefaultPicker",
    "required": true,
    "nluTextEnabled": false,
    "label": "What would you like to do now?",
    "itemType": "List",
    "style": "list",
    "multiSelect": false,
    "options": [
        {
            "label": "I'm all set",
            "value": "yes",
            "renderStyle": "data",
            "enabled": true
        },
        {
            "label": "Show me more on \"Catalog Request\"",
            "value": "no",
            "renderStyle": "data",
            "enabled": true
        },
        {
            "label": "Ask something else",
            "value": "another_search",
            "renderStyle": "data",
            "enabled": true
        }
    ],
    "scriptedData": null
}

let uiElement = {
    "uiType": "Picker",
    "group": "DefaultPicker",
    "required": true,
    "nluTextEnabled": false,
    "label": "Here are the results you may find helpful",
    "itemType": "List",
    "style": "list",
    "multiSelect": false,
    "options": [
        {
            "label": "(Catalog) iPhone and iPad Accessories",
            "value": "9e1c0db31b74e15800b10d01cd4bcb90",
            "renderStyle": "data",
            "enabled": true
        },
        {
            "label": "(Catalog) Apple iPad Replacement",
            "value": "b1ad9655db227740be9d707668961914",
            "renderStyle": "data",
            "enabled": true
        },
        {
            "label": "(Catalog) iPad  Magic Keyboard for - 12.9\"",
            "value": "61b0c2db1ba5599088282f42b24bcba4",
            "renderStyle": "data",
            "enabled": true
        },
        {
            "label": "I need more help...",
            "value": "no",
            "renderStyle": "data",
            "enabled": true
        },
        {
            "label": "Ask something else...",
            "value": "another_search",
            "renderStyle": "data",
            "enabled": true
        }
    ],
    "scriptedData": null
}

let uiElement1 = {
    "uiType": "TopicPickerControl",
    "group": "DefaultPicker",
    "nluTextEnabled": true,
    "promptMsg": "Hi SANDEEP REDDY, please enter your request or make a selection of what I can help with. You can type help any time when you need help.",
    "label": "Show me everything",
    "options": [
        {
            "label": "Closing Conversation.",
            "value": "57cde45053130010cf8cddeeff7b1291",
            "promoted": false,
            "enabled": true
        },
        {
            "label": "Dynamic Translation Support Topic",
            "value": "32fb4c695339f410f738ddeeff7b129a",
            "promoted": false,
            "enabled": true
        },
        {
            "label": "Lilly AI Search-Fallback",
            "value": "ad88de273b8c5a909c4eb50864e45a66",
            "promoted": false,
            "enabled": true
        },
        {
            "label": "Live Agent Support.",
            "value": "ce2ee85053130010cf8cddeeff7b12bf",
            "promoted": false,
            "enabled": true
        }
    ]
}

//console.log(JSON.stringify(defaultPickerTemplate(e2)))


/*----------------------------------------------------------------------------------*/
function convertToResultTemplate(uiElement) {
    if (uiElement.uiType && uiElement.options) {
        // Map options to Action.Submit actions
        let actions = uiElement.options.map(option => {
            if (option.label === "I need more help...") {
                return {
                    "type": "Action.Submit",
                    "title": "End Catalog Search",
                    "data": {
                        "msteams": {
                            "type": "messageBack",
                            "displayText": "End Catalog Search",
                            "text": "6767898911223344"
                        }
                    }
                };
            } else {
                return {
                    "type": "Action.Submit",
                    "title": option.label,
                    "data": {
                        "msteams": {
                            "type": "messageBack",
                            "displayText": option.label,
                            "text": option.value
                        }
                    }
                };
            }
        });

        // Filter out unwanted options
        actions = actions.filter(action => {
            return action.title !== "Dynamic Translation Support Topic";
        });

        // Create the Adaptive Card structure
        let card = {
            "type": "AdaptiveCard",
            "version": "1.4",
            "body": [
                {
                    "type": "TextBlock",
                    "text": uiElement.promptMsg || uiElement.label,
                    "wrap": true
                },
                {
                    "type": "ActionSet",
                    "actions": actions
                }
            ],
            "msteams": {
                "width": "Full"
            }
        };

        return {
            "attachments": [
                {
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "content": card
                }
            ]
        };
    }

    // Return an empty object or handle cases where uiElement is not valid
    return {};
}


console.log(JSON.stringify(convertToResultTemplate(uiElement)))