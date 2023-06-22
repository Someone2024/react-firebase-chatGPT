import { Configuration, OpenAIApi } from "openai"
import {userMessages, AiMessages} from "../App"

const apiKey ="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"

const configuration = new Configuration({
    apiKey: apiKey
});
const openai = new  OpenAIApi(configuration)

async function Chat(msg){
const chat_completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {role: "system", content: "You are a helpful assistant and your responses should be short  ,consice and to the point."},
      { role: "user", content: msg }
      ],
}).catch((e)=>{
  alert(e)
})

return chat_completion.data.choices[0].message.content
}

function runConversation(){
  
}

export default Chat;