const server = io()

//Elements
const messageForm = document.querySelector('#chat-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#find-me')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

//Template 
const messageTemplate = document.querySelector('#message-template').innerHTML 
const messageTemplateLocation = document.querySelector('#message-template-location').innerHTML
const sidebarDataTemplate = document.querySelector('#sidebar-template').innerHTML

//Option of query string
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll = ()=>{
    //New message Element
    const newMessage = messages.lastElementChild
    //Hight of new message
    const newMessagesStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessagesStyle.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin
    //visible height
    const visibleHeight = messages.offsetHeight
    //Height of message container
    const containerHeight = messages.scrollHeight
    //how far have i scrolled
    const scrollOffSet = messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffSet){
        messages.scrollTop = messages.scrollHeight
    }

}

server.on('messages',(msg)=>{
    console.log(msg)
    msg.createdAt = moment(msg.createdAt).format('h:mm:ss a')
    messages.insertAdjacentHTML('beforeend',Mustache.render(messageTemplate,{msg}))
    autoScroll()
})

server.on('locationMessages',(locationmsg)=>{
    console.log(locationmsg)
    locationmsg.createdAt = moment(locationmsg.createdAt).format('h:mm:ss a')
    messages.insertAdjacentHTML('beforeend',Mustache.render(messageTemplateLocation,{locationmsg}))
    autoScroll()
})

server.on('roomData',({room,users})=>{
   
    sidebar.innerHTML = Mustache.render(sidebarDataTemplate,{room,users})
})

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    //Dissabled form elements
    messageFormButton.setAttribute('disabled', 'disabled')
    // Getting form message
    const msg = e.target.elements.message.value
    //sending message to the server
    server.emit('messageSEND',msg,(error)=>{
        //Enable button
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered ')
    })

})

//get current location
function geoFindMe() {
    // disabled send location button
    sendLocationButton.setAttribute('disabled','disabled')

    const status = document.querySelector('#status');
     
    function success(position) {
      const latitude  = position.coords.latitude;
      const longitude = position.coords.longitude;
     //sending lat, log to the server
      server.emit('sendLocation',{latitude:latitude,longitude:longitude},()=>{
          //Enable send button location
        sendLocationButton.removeAttribute('disabled')
          console.log('Location Shared')
      })
      status.textContent = '';
    }
  
    function error() {
      status.textContent = 'Unable to retrieve your location';
    }
  
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation is not supported by your browser';
    } else {
      status.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(success, error);
    }
  
  }
  
  sendLocationButton.addEventListener('click', geoFindMe);

  server.emit('join',{username,room},(error)=>{
      if(error){
          alert(error)
          location.href = '/'
      }
    
  });