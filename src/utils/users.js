
const usersList = [];

const addUser = ({id, username, room})=>{

    //Cleaning data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate data
    if(!username || !room){
        return {
            error:'username and room are required'
        }
    }

    //Checking for existing
    const existiongUser = usersList.find((user)=>{
        return user.username === username && user.room === room
    })

    //Validate user
    if(existiongUser){
        return {
            error:'Username is use'
        }
    }
    
    //Push user data into the userlist
    const user =  {id,username,room}
    usersList.push(user)
    return {user}

}

//remove user by its id
const removeUserById = (id)=>{

    if(id){
        const index = usersList.findIndex((user)=> user.id ===id)
        if(index !=-1){
            return usersList.splice(index,1)[0]
        }
    }
}

// Get user by its id
const getUserById = (id)=>{
    if(id){
        const index = usersList.findIndex((user)=>user.id ===id)
        if(index !==-1){
            return usersList[index]
        }else{
            return undefined
        }
    }
}

// Get user in room
const getUserInRoom = (room)=>{
    room = room.trim().toLowerCase()
    if(room){
        return usersList.filter((user)=>user.room === room)
    }
}

module.exports = {
    addUser, removeUserById,getUserById,getUserInRoom
}