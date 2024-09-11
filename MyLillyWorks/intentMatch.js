const axios = require('axios');

const readline = require('readline');

const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

async function checkIntent(userInput){

    const url = "https://bots.kore.ai/api/v1.1/rest/bot/st-dd4fe209-0b7b-5f6c-8b00-a4df12b67996/findIntent?fetchConfiguredTasks=false";
    const requestData = 
    {     
        input: userInput,
        streamName:"ITSM Universal Bot Dev"
    }
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'auth':"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsImFwcElkIjoiY3MtMjAyMDEyZDItZGFlZi01MGExLTkwNTgtODQ4MTA0ZTY4MjQ3In0.mxjP5n5Yi0lrHxgJXaAXBRJLjIsJBI_3WQYPLjMt5zQ"
    }
    try{
        var response = await axios.post(url, requestData , { headers });

        if(response.status === 200){   

            let finalResolver = response.data.response.finalResolver;
            let winningIntentArray = (finalResolver.winningIntent).map(intentType => intentType.intent);
            //console.log("Response_Data::::::::",response.data)
            //console.log("Resolver::",finalResolver)
            //console.log("winningIntentArray:::::::::::::>>",winningIntentArray)
            console.log("Post intent recognition successfully:::>>",response.status)
            return winningIntentArray;
        }
    }
    catch(error){
         console.log("No utterance match while making request::::::::::::>>>",response.status)
         return [];
    }
}
async function display(){
    rl.question('enter the user utterance : ',
    async (input)=> {
            console.log('You entered :',input);
            const result = await checkIntent(input);
            console.log(result)

            //logic 
            if (result.includes('Agent Transfer' || 'TalktoAgent')){
                console.log("Its a agent request...!!");
                 
            }

            rl.close();
        }
        )
//console.log(await checkIntent("HoBO DEVice"));
}

display();












// const readline = require('readline')

// const r2 = readline.createInterface({
//     input:process.stdin,
//     output:process.stdout
// })

// r2.question("Please enter ",input=>{
//     console.log("Input:",input);
//     r2.close()
    
// })