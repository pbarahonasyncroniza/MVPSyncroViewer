import { useState } from 'react'

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "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"

function Chatbox() {
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message : "Hello I'm ChatGPT",
      sender :"ChatGPT"
    }
  ])

      const handleSend =async (message) =>{
        const newMessage ={
          message :message,
          sender: "user",
          direction: "outgoing"
        }

        const newMessages = [...messages, newMessage];  // all the old messages + new messages

        //set Taping indicator
        setTyping(true);

        // update our message state
        setMessages(newMessages)
        
        await processMessageToChatGPT(newMessages);
      }


        async function processMessageToChatGPT(chatMessages) {

          let apiMessage = chatMessages.map((messageObject)=>{
              let role = "";
              if(messageObject.sender === "ChatGPT"){
                role="assistant"
              }else {
                role = "user"
              }
              return {role: role, content: messageObject.message}
          })

          // role : "user" -> a message from the user, "assistant" -> a response from chat GPT
          // "system" -> genarally one initiali message defining HOW we want Chat GPT to talk

            const systemMessage = {
              role : "system",
              content: "Explain all concepts like Building information modeling expert "
            }



          const apiRequestBody = {
            "model" : "gpt-3.5-turbo",
            "messages": [
              systemMessage,
              ...apiMessage
            ]
          }

          await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setTyping(false);
    });
  }


  return (
    <div >
      <div  style={{position: "absolute", height:"700px", width:"1200px", backgroundColor:""}}></div>
        <MainContainer >
          <ChatContainer >
            <MessageList
              className="content-input"
              // style={{position: "absolute", height:"700px", width:"1200px", backgroundColor:"black"}}
              typingIndicator={typing ? 
              <TypingIndicator   content="Chat GPT is typing" /> : null}>
              {messages.map((message,i) =>{
                return<Message key={i} model={message}  />
              })}
            </MessageList>
            <MessageInput style={{backgroundColor:"black"}} className="custom-message-input" placeholder="Type message Here" onSend={handleSend}  />
          </ChatContainer>
        </MainContainer>




    </div>
  )
}

export default Chatbox;