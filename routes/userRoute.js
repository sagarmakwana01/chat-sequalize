const express = require('express')
const path = require('path')
const route = express()
const bodyParser = require('body-parser')
const session = require('express-session')
route.use(bodyParser.json());
const { SESSION_SECRET } = process.env;
route.use(session(
    {secret: SESSION_SECRET ,
        resave: false,
        saveUninitialized: false,
    }));
const sequelize = require('../util/database');
const cookieParser = require('cookie-parser');
route.use(cookieParser());
route.use(bodyParser.urlencoded({extended:false}))

route.set('view engine','ejs');
route.set('views','views')

route.use(express.static('public'));

const multer = require('multer')

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, path.join(__dirname,'../public/images'))
    },
    filename: function(req, file, cb){
        const name = Date.now() +'-' + file.originalname;
        cb(null, name)
    }
})

const upload = multer({ storage:storage})

const userController = require('../controller/userController')
const auth = require('../middlewares/auth')

route.get('/register',auth.isLogout,userController.registerLoad)
route.post('/register',upload.single('image'),userController.register)

route.get('/',auth.isLogout,userController.loadLogin)
route.post('/',userController.login)
route.get('/logout',auth.isLogin,userController.loguot)

route.get('/dashboard',auth.isLogin,userController.loadDashboard)
route.post('/saveChat',userController.saveChat)
route.post('/deleteChat',userController.deleteChat)
route.post('/updateChat',userController.updateChat)
route.get('/groups',auth.isLogin,userController.loadGroups)
route.post('/groups',upload.single('image'),userController.createGroup)

route.post('/get-members',auth.isLogin,userController.getMembers)
route.post('/addMember',auth.isLogin,userController.addMembers)


route.post('/update-chat-group',auth.isLogin,upload.single('image'),userController.updateChatGroup)
route.post('/delete-chat-group',auth.isLogin,userController.deleteChatGroup)
route.get('/share-group/:id',userController.shareGroup)
route.post('/join-group',userController.joinGroup)

route.get('/group-chat',auth.isLogin,userController.groupChats)
route.post('/group-chat-save',auth.isLogin,userController.saveGroupChat)
route.post('/load-group-chats',auth.isLogin,userController.loadGroupChat)

route.post('/deleteGroupChat',userController.deleteGroupChatMsg)
route.post('/updateGroupChat',userController.updateGroupChat)





route.get('*',function(req,res){
    res.redirect('/')
})


module.exports = route;