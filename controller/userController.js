
const bcrypt = require('bcrypt')
const User = require('../models/usetModel')
const Chat = require('../models/chatModel')
const Group = require('../models/groupModel')
const GroupChat = require('../models/groupChatModel')
const Member = require('../models/memberModel')
const {Op} = require('sequelize')
const Sequelize = require('sequelize')

//get register controller
const registerLoad = async(req,res)=>{
 
    try{
        res.render('register')
    }catch(error){
        console.log(error.message)
    }

}

// post register controller
const register = async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      image: req.file.filename,
      password: passwordHash,
    });
    res.render('register', { message: 'Your registration has been successful!' });
    // res.redirect('/')
  } catch (error) {
    console.log(error.message);
  }
};

  //get login controller
const loadLogin = async(req,res)=>{
    
    try{
        res.render('login')
    }catch(error){
        console.log(error.message)
    }   
}



// post login controller
const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({
      where: {
        email: email,
      },
    });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        req.session.user = userData;
        res.cookie(`user`, JSON.stringify(userData));
        res.redirect('/dashboard');
      }
    } else {
      res.render('login', { message: 'Email and Password is Incorrect!' });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// get controller logout
const loguot = async(req,res)=>{
    
    try{
        res.clearCookie('user')
        req.session.destroy();
        res.redirect('/')
    }catch(error){
        console.log(error.message)
    }   
}

// get controller loadDashboard
const loadDashboard = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        id: {
          [Op.ne]: req.session.user.id,
        },
      },
    });
    res.render('dashboard', { user: req.session.user, users: users });
  } catch (error) {
    console.log(error.message);
  }
};
  
  // post controller saveChat
  const saveChat = async (req, res) => {
    try {
      const { sender_id, receiver_id, message, senderName, receiver_name } = req.body;
      const newChat = await Chat.create({
        sender_id: sender_id,
        receiver_id: receiver_id,
        message: message,
        senderName: senderName,
        receiverName: receiver_name
      });
      res.status(200).send({ success: true, msg: 'chat inserted!', data: newChat });
    } catch (error) {
      res.status(400).send({ success: false, msg: error.message });
      console.log(error);
    }
  };
  
  // post controller deleteChat
  const deleteChat = async (req, res) => {
    try {
      const { id } = req.body;
      await Chat.destroy({
        where: {
          id: id
        }
      });
      res.status(200).send({ success: true });
    } catch (error) {
      res.status(400).send({ success: false, msg: error.message });
    }
  };
  
// // post controller updateChat
const updateChat = async(req, res, next) => {
  try {
    const { id, message } = req.body;
    await Chat.update({ message }, {
      where: {
        id
      }
    });
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}


// // get controller loadGroup
const loadGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      where: { creator_id: req.session.user.id },
    });
    res.render("group", { groups:groups});
  } catch (error) {
    console.log(error.message);
  }
};


// post controller create group
const createGroup = async (req, res) => {
  try {
    const group = await Group.create({
      creator_id: req.session.user.id,
      name: req.body.name,
      image: req.file.filename,
      limit: req.body.limit,
    });

    const groups = await Group.findAll({
      where: { creator_id: req.session.user.id },
    });

    res.render('group', {
      message: req.body.name + ' Group created successfully!',
      groups: groups,
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
    console.log(error)
  }
};
const getMembers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Member,
          where: {
            group_id: req.body.group_id,
          },
          required: false,
        },
      
      ],
      
      where: {
        id: {
          [Sequelize.Op.notIn]: [req.session.user.id],
        },
      },
    });

    res.status(200).send({ success: true, data: users });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
    console.log(error)
  }
};

const addMembers = async (req, res) => {
  try {
    if (!req.body.members) {
      res.status(400).send({ success: false, msg: "Please select members" });
      return;
    }

    if (req.body.members.length > parseInt(req.body.limit)) {
      res.status(400).send({ success: false, msg: `You can not select more than ${req.body.limit} members` });
      return;
    }

    await Member.destroy({ where: { group_id: req.body.group_id } });

    var data = [];
    const members = req.body.members;
    for(var i=0; i<members.length; i++){
        data.push({
            group_id: req.body.group_id,
            user_id: members[i]
        })
    }

    await Member.bulkCreate(data);

    res.status(200).send({ success: true, msg: 'Members added successfully' });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

// // post controller update Cht group
const updateChatGroup = async (req, res) => {
  try {
    if (parseInt(req.body.limit) < parseInt(req.body.l_limit)) {
      await Member.destroy({ where: { group_id: req.body.id } });
    }

    let groupUpdateData;
    if (req.file !== undefined) {
      groupUpdateData = {
        name: req.body.name,
        limit: req.body.limit,
        image: req.file.filename,
      };
    } else {
      groupUpdateData = {
        name: req.body.name,
        limit: req.body.limit,
      };
    }

    await Group.update(groupUpdateData, { where: { id: req.body.id } });

    res.status(200).send({ success: true, msg: 'Chat Group updated successfully' });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};


// post controller delete chat group
const deleteChatGroup = async (req, res) => {
  try {
    await Group.destroy({ where: { id: req.body.id } });
    await Member.destroy({ where: { group_id: req.body.id } });

    res.status(200).send({ success: true, msg: 'Chat Group deleted successfully' });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};





// // get controller share group
const shareGroup = async (req, res) => {
  try {
    const groupData = await Group.findByPk(req.params.id);

    if (!groupData) {
      res.render('error', { message: '404 not found' });
    } else if (req.session.user === undefined) {
      res.render('error', { message: 'You need to login to access the Share URL!' });
    } else {
      const totalMembers = await Member.count({ where: { group_id: req.params.id } });
      const available = groupData.limit - totalMembers;
      const isOwner = groupData.creator_id === req.session.user.id ? true : false;
      const isJoined = await Member.count({ where: { group_id: req.params.id, user_id: req.session.user.id } });

      res.render('shareLink', { group: groupData, available, totalMembers, isOwner, isJoined });
    }
  } catch (error) {
    console.log(error.message);
  }
};


// // post controller join group
const joinGroup = async (req, res) => {
  try {
    await Member.create({
      group_id: req.body.group_id,
      user_id: req.session.user.id,
    });

    res.send({ success: true, msg: 'Congratulations, you have joined the group.' });
  } catch (error) {
    res.send({ success: false, msg: error.message });
  }
};


// // get controller group chat
const groupChats = async (req, res) => {
  try {
    const myGroup = await Group.findAll({
      where: { creator_id: req.session.user.id },
      include: [{ model: Member, as: 'Members' }],
    });

    const joinedGroups = await Member.findAll({
      where: { user_id: req.session.user.id },
      include: [{ model: Group, as: 'group' }],
    });

    res.render('chat-group', { myGroup: myGroup, joinedGroups: joinedGroups });
  } catch (error) {
    console.log(error.message);
  }
};



const saveGroupChat = async (req, res) => {
  try {
    const { sender_id, group_id, message,senderName, } = req.body;

    const chat = await GroupChat.create({
      sender_id,
      group_id,
      message,
      senderName,
    });

    res.status(200).send({ success: true, chat });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

async function loadGroupChat(req, res) {
  try {
    const { group_id } = req.body;

    const groupChats = await GroupChat.findAll({
      where: {
        group_id:group_id,
      },
    });

    res.status(200).send({ success: true, chats: groupChats });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
    console.log(error);
  }
}
// //---------------------------------------group chats delete and update--------------------------------
  // post controller deleteChat
  async function deleteGroupChatMsg(req, res) {
    try {
      const { id } = req.body;
  
      await GroupChat.destroy({
        where: {
          id: id,
        },
      });
  
      res.status(200).send({ success: true });
    } catch (error) {
      res.status(400).send({ success: false, msg: error.message });
    }
  }
  


  // post controller updateChat
  async function updateGroupChat(req, res) {
    try {
      const { id, message } = req.body;
  
      const [updatedRows] = await GroupChat.update(
        { message },
        {
          where: {
            id: parseInt(id),
          },
        }
      );
  
      if (updatedRows > 0) {
        res.status(200).send({ success: true });
      } else {
        res.status(400).send({ success: false, msg: "Chat not found" });
      }
    } catch (error) {
      res.status(400).send({ success: false, msg: error.message });
    }
  }

module.exports = {
    registerLoad,
    register,
    loadLogin,
    login,
    loguot,
    loadDashboard,
    saveChat,
    deleteChat,
    updateChat,
    loadGroups,
    createGroup,
    getMembers,
    addMembers,
    updateChatGroup,
    deleteChatGroup,
    shareGroup,
    joinGroup,
    groupChats,
    saveGroupChat,
    loadGroupChat,
    deleteGroupChatMsg,
    updateGroupChat
}