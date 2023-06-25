import { Configuration, OpenAIApi } from "openai"
import  { userMessagesSnapshot, AiMessagesSnapshot} from "../App"

const apiKey = "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"

const configuration = new Configuration({
    apiKey: apiKey
});
const openai = new  OpenAIApi(configuration)

async function runConversation(msg){

  function Message(role, content){
    this.role = role
    this.content= content
  }
  
function addMessage(role, content){
    const message = new Message(role, content)
    messages.push(message)
  }
  
  let messages = [];

const userMessagesArray = userMessagesSnapshot.docs;
const aiMessagesArray = AiMessagesSnapshot.docs;
const maxLength = Math.max(userMessagesArray.length, aiMessagesArray.length);

for (let i = 0; i < maxLength; i++) {
  if (i < userMessagesArray.length) {
    const userMessage = userMessagesArray[i];
    addMessage(userMessage.data().role, userMessage.data().content);
  }
  if (i < aiMessagesArray.length) {
    const aiMessage = aiMessagesArray[i];
    addMessage(aiMessage.data().role, aiMessage.data().content);
  }
}

  messages.push(new Message("user",msg))

  const chat_completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages
}).catch((e)=>{
  alert(e)
})

return chat_completion.data.choices[0].message.content
}


export default runConversation
