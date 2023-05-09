// const Sequelize = require('sequelize');
const express = require('express');
const app = express();
require('dotenv').config()
const http = require('http').Server(app);
const userRoute = require('./routes/userRoute');
const sequelize = require('./util/database')
const User = require('./models/usetModel')
const Chat = require('./models/chatModel')
const Group = require('./models/groupModel')
const GroupChat = require('./models/groupChatModel')
const Member = require('./models/memberModel')
const {Op} = require('sequelize')
const PORT = process.env.PORT || 4000
app.use(userRoute);

const io = require('socket.io')(http);
var usp = io.of('/user-namespace');
usp.on('connection',async function(socket){
    console.log('user connected')
    // console.log(socket)
    const userId = socket.handshake.auth.token;

    try {
      await User.update(
        { is_online: true },
        { where: { id: userId } }
      );
    } catch (error) {
      console.log(error.message);
    }

//    // user broadcast online status
    socket.broadcast.emit('getOnlineUser',{user_id:userId})

    socket.on('disconnect',async function(){
        console.log('user disconnected')
        const userId = socket.handshake.auth.token;
        try {
          await User.update(
            { is_online: false },
            { where: { id: userId } }
          );
        } catch (error) {
          console.log(error.message);
        }
//         // user broadcast offline status
        socket.broadcast.emit('getOfflineUser',{user_id:userId})
    })

    //chatting implimention
    socket.on('newChat',function(data){
        socket.broadcast.emit('loadNewChat',data)
    })

//     //load old chats
socket.on('existsChat', async function(data) {
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          {
            sender_id: data.sender_id,
            receiver_id: data.receiver_id,
          },
          {
            sender_id: data.receiver_id,
            receiver_id: data.sender_id,
          },
        ],
      },
    });
    socket.emit('loadChats', { chats: chats });
  });
  

    //delete chats
    socket.on('chatDeleted', function(id){
        socket.broadcast.emit('chatMessageDeleted',id)
    })
    //update chats
    socket.on('chatUpdated', function(data){
        socket.broadcast.emit('chatMessageUpdated',data)
    })
//       // new grop chats add

      socket.on('newGroupChat',function(data){
        socket.broadcast.emit('loadNewGroupChat',data) //broadcast group chat object
    })

     //delete Groupchats
     socket.on('groupChatDeleted', function(id){
      socket.broadcast.emit('GroupchatMessageDeleted',id)
  })
  //update Groupchats
  socket.on('groupChatUpdated', function(data){
    socket.broadcast.emit('groupChatMessageUpdated',data)
})
});

  
Chat.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Chat.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

GroupChat.belongsTo(User, {
  foreignKey: 'sender_id',
  onDelete: 'CASCADE'
});

GroupChat.belongsTo(Group, {
  foreignKey: 'group_id',
  onDelete: 'CASCADE'
});

Group.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });
User.hasMany(Group, { foreignKey: 'creator_id' });

Group.hasMany(Member, { foreignKey: 'group_id' });
Member.belongsTo(Group, { foreignKey: 'group_id' });

Group.hasMany(GroupChat, { foreignKey: 'group_id' });
GroupChat.belongsTo(Group, { foreignKey: 'group_id' });

Member.belongsTo(Group, { foreignKey: 'group_id', onDelete: 'CASCADE' });
Member.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });


sequelize.sync({ force:false}).then(res =>{console.log(res)}).catch(err=>{console.log(err)})
console.log("All models were synchronized successfully.");
http.listen(PORT,function(){
  console.log("servee is redy port no 4000")
});