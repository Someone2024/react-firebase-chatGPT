import { Configuration, OpenAIApi } from "openai"
import  { userMessagesSnapshot, AiMessagesSnapshot} from "../App"

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

async function runConversation(){

  function Message(role, content){
    this.role = role
    this.content= content
  }
  
function addMessage(role, content){
    const message = new Message(role, content)
    messages.push(message)
  }
  
  let messages = []
  
  userMessagesSnapshot.forEach(doc=>{
    addMessage(doc.data().role,doc.data().content)
  })
  AiMessagesSnapshot.forEach(doc=>{
    addMessage(doc.data().role,doc.data().content)
  })
  
  alert(2)
}

export default Chat