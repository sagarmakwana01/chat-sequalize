

(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);
//------------------------------------------- start dynamic Chat app script-------------
  
function getCookie(name){
	let match = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return match? decodeURIComponent(match[1]) : undefined;
}

var userData = JSON.parse(getCookie('user'))
var sender_id = userData.id;
var receiver_id;
var global_group_id;
var socket = io('/user-namespace', {
	auth: {
		token: userData.id 
	}
})
$(document).ready(function () {

	$('.user-list').click(function () {
		var userId = $(this).attr('data-id')
		receiver_id = userId;
		$('.start-head').hide();
		$('.chat-section').show();
		socket.emit('existsChat',{sender_id:sender_id,receiver_id:receiver_id})
	})
})
// update user online
socket.on('getOnlineUser', function (data) {
	$('#' + data.user_id + '-status').text('Online')
	$('#' + data.user_id + '-status').removeClass('offline-status')
	$('#' + data.user_id + '-status').addClass('online-status')
})
// update user offline
socket.on('getOfflineUser', function (data) {
	$('#' + data.user_id + '-status').text('Offline')
	$('#' + data.user_id + '-status').removeClass('online-status')
	$('#' + data.user_id + '-status').addClass('offline-status')
});

// chet save of user
// $('#chat-form').submit(function (event) {
// 	event.preventDefault();

// 	var message = $('#message').val();

// 	$.ajax({
// 		url: '/saveChat',
// 		type: 'POST',
// 		data: { sender_id:sender_id, receiver_id: receiver_id, message: message },
// 		success: function (response) {
// 			// console.log(response)
// 			if (response.success) {
// 				// console.log(response)
// 				$('#message').val('')
// 				let chat = response.data.message;
// 				let html = `<div class="current-user-chat" id='`+response.data.id+`'>
// 				<h5><span>`+ chat + `</span>
// 					<i class="fa fa-trash" aria-hidden="true" data-id='`+response.data.id+`' data-toggle="modal" data-target="#deleteChatModel"></i>
// 					<i class="fa fa-edit" aria-hidden="true" data-id='`+response.data.id+`' data-msg='`+chat+`' data-toggle="modal" data-target="#editChatModel"></i>
// 					</h5>
// 				 </div> `;
// 				$('#chat-container').append(html)
// 				socket.emit('newChat', response.data)
// 				scrollChat()
// 			} else {
// 				alert(data.msg)
// 			}

// 		}
// 	})
// })
// socket.on('loadNewChat',function(data){
// 	if(sender_id==data.receiver_id && receiver_id==data.sender_id){

// 		let html =`<div class="distance-user-chat" id='`+data.id+`'>
// 					<h5><span>`+ data.message + `</span></h5>
// 					 </div> `;
// 					 $('#chat-container').append(html)
// 	}
// 	scrollChat()
// })


var chatMode = 'send';

$(document).on('click','.fa-edit',function(){
	$('#edit-message-id').val($(this).attr('data-id'));
	$('#message').val($(this).attr('data-msg'));
	chatMode = 'edit';
});

$('#chat-form').submit(function (event) {
	event.preventDefault();
	var message = $('#message').val();
	if (message.trim() === '') {
        alert('Message field cannot be empty!');
        return;
    }
	if(chatMode == 'send') {
		$.ajax({
			url: '/saveChat',
			type: 'POST',
			data: { sender_id: sender_id, receiver_id: receiver_id, message: message,senderName:userData.name},
			success: function (response) {
				if (response.success) {	
					// console.log(response.data);
					// console.log(response.data.senderName);
					$('#message').val('');
					let chat = response.data.message;
					let html = `<div class="current-user-chat" id='`+response.data.id+`'>
								<h5><p>`+ response.data.senderName+`</p> <span>`+ chat + `</span>
									<i class="fa fa-trash" aria-hidden="true" data-id='`+response.data.id+`' data-toggle="modal" data-target="#deleteChatModel"></i>
									<i class="fa fa-edit" aria-hidden="true" data-id='`+response.data.id+`' data-msg='`+chat+`' data-toggle="modal" data-target="#editChatModel"></i> 

								</h5>
							</div> `;
					socket.emit('newChat', response.data);
					$('#chat-container').append(html);
					scrollChat();
				} else {
					alert(data.msg);
				}
			}
		});
	} else if(chatMode == 'edit') {
		var id =$('#edit-message-id').val();
		$.ajax({
			type: 'POST',
			url: '/updateChat',
			data: {id:id, message:message},
			success: function(res){
				if(res.success == true){
					$('#message').val('');
					$('#'+id).find('span').text(message);
					$('#'+id).find('.fa-edit').attr('data-msg',message);
					socket.emit('chatUpdated',{id:id,message:message});
					chatMode = 'send';
				}else{
					alert(res.msg);
				}
			}
		});
	}
});



socket.on('loadNewChat',function(data){
	if(sender_id==data.receiver_id && receiver_id==data.sender_id){
		
	

	function showNotification() {
			const notification = new Notification(data.senderName, {
			  body: data.message,
			  icon: `http://localhost:4000/images/${userData.image}`
			  
			});
		  }
		  
		//   console.log(Notification.permission);
		  
		  if (Notification.permission === "granted") {
			if (document.visibilityState === "visible") {
			  // Receiver's browser window is open, do not show notification
			  console.log("Receiver's browser is open, notification not shown");
			} else {
			  // Receiver's browser window is closed or minimized, show notification
			  showNotification();
			}
		  } else if (Notification.permission !== "denied") {
			Notification.requestPermission().then(permission => {
			  if (permission === "granted") {
				if (document.visibilityState === "visible") {
				  // Receiver's browser window is open, do not show notification
				  console.log("Receiver's browser is open, notification not shown");
				} else {
// 				  Receiver's browser window is closed or minimized, show notification
				  showNotification();
				}
			  }
			});
		  }
		  
		  document.addEventListener("visibilitychange", function() {
			if (Notification.permission === "granted" && document.visibilityState === "visible") {
			  console.log("Receiver's browser is open, notification not shown");
			}
		  });

		let html =`<div class="distance-user-chat" id='`+data.id+`'>
					<h5><p>`+data.senderName+`</p><span>`+ data.message + `</span></h5>
					 </div> `;
					 $('#chat-container').append(html)
	}
	scrollChat()
})


socket.on('chatMessageUpdated',function(data){
	$('#'+data.id).find('span').text(data.message)
	
	})



//loas old chats
socket.on('loadChats',function(data){
	$('#chat-container').html('')

	var chats = data.chats;
	let html = '';

	for(let x = 0; x < chats.length; x++){
		let addClass = '';
		if(chats[x]['sender_id']==sender_id){
			addClass = 'current-user-chat';
		}else{
			addClass = 'distance-user-chat';
		}
		html+=`<div class='`+addClass+`'id='`+chats[x]['id']+`' >
			<h5> <p>`+chats[x]['senderName']+`</p><span>`+chats[x]['message']+`</span>`;
				if(chats[x]['sender_id']==sender_id){
					html+=`	
					
					    <i class="fa fa-trash" aria-hidden="true" data-id='`+chats[x]['id']+`' data-toggle="modal" data-target="#deleteChatModel"></i>
						<i class="fa fa-edit" aria-hidden="true" data-id='`+chats[x]['id']+`' data-msg='`+chats[x]['message']+`' data-toggle="modal" data-target="#editChatModel"></i> 
					

					`
				}
			   html+=`
				</h5>
			</div>
			`;
	}
	$('#chat-container').append(html);
	scrollChat()
})

function scrollChat(){
	$('#chat-container').animate({
		scrollTop: $('#chat-container').offset(). top + $('#chat-container')[0].scrollHeight      
	  },0)
}


$(document).on('click', function(event) {
	if ($(event.target).hasClass('fa-trash')) {
	  let msg = $(event.target).parent().text();
	//   console.log(msg);
	  $('#delete-message').text(msg);
	  $('#delete-message-id').val($(event.target).attr('data-id'));
	}
  });
  

$('#delete-chat-form').submit(function(event){
event.preventDefault();
var id =$('#delete-message-id').val();
$.ajax({
	type: 'POST',
	url: '/deleteChat',
	data: {id: id},
	success: function(res){
		if(res.success == true){
			$('#'+id).remove();
			$('#deleteChatModel').modal('hide');
			socket.emit('chatDeleted', id);
		}else{
			alert(res.msg);
		}
	}
})
})

socket.on('chatMessageDeleted',function(id){
$('#'+id).remove();
});

// $(document).on('click','.fa-edit',function(){
// $('#edit-message-id').val($(this).attr('data-id'));
// $('#update-message').val($(this).attr('data-msg'));
// })

// $('#update-chat-form').submit(function(event){
// event.preventDefault();
// var id =$('#edit-message-id').val();
// var msg =$('#update-message').val();
// $.ajax({
// 	type: 'POST',
// 	url: '/updateChat',
// 	data: {id:id, message:msg},
// 	success: function(res){
// 		if(res.success == true){
// 			$('#editChatModel').modal('hide');
// 			$('#'+id).find('span').text(msg)
// 			$('#'+id).find('.fa-edit').attr('data-msg',msg)

// 			socket.emit('chatUpdated',{id:id,message:msg});
// 		}else{
// 			alert(res.msg);
// 		}
// 	}
// });
// });

// socket.on('chatMessageUpdated',function(data){
// $('#'+data.id).find('span').text(data.message)

// })
//------------------------------------------- end dynamic Chat app script-------------

//------------------------------------------- start group dynamic Chat app script-------------
//add members 
$('.addMember').click(function(){
	var id = $(this).attr('data-id')
	var limit = $(this).attr('data-limit');
	$('#group_id').val(id);
	$('#limit').val(limit);

	$.ajax({
		url:'/get-members',
		type: 'POST',
		data:{group_id:id},
		success: function(res){
			console.log(res);
			if(res.success==true){
				let users = res.data;
				console.log(users);
				 let userData='';
				 for(let i = 0; i < users.length; i++){
					let isMemberOfGroup = users[i]['Members'].length > 0?true:false;
                    userData+=`
					<tr>
					<td>
					 	<input type="checkbox" `+(isMemberOfGroup? 'checked':'')+` name="members" value="`+users[i]['id']+`"/>
					</td>
					<td>`+users[i]['name']+`</td>
					</tr>
					`
                 }
				 $('.addMembersInTable').html(userData)
            }else{
				alert(res.msg);
			}
        }
	});
})

// add members submit code
$('#add-member-form').submit(function(event){
	event.preventDefault();

	var formData = $(this).serialize();
	$.ajax({
		url:'/addMember',
        type: 'POST',
        data: formData,
        success: function(res){
			if(res.success == true){
				$('#memberModal').modal('hide');
				$('#add-member-form')[0].reset();
				alert(res.msg)
		}else{
			$('#add-member-error').text(res.msg)
			setTimeout(()=>{
				$('#add-member-error').text('')
			},3000);
		}
	}
	});
})

// update group

$('.updateMember').click(function(){
	var obj = JSON.parse($(this).attr('data-obj'))
	// console.log(obj)
	$('#update_group_id').val(obj.id)
	$('#l_limit').val(obj.limit)
	$('#group_name').val(obj.name)
	$('#group_limit').val(obj.limit)


})


$('#updateChatGroupForm').submit(function(e) {
	e.preventDefault();

	$.ajax({
		url:'/update-chat-group',
        type: 'POST',
        data: new FormData(this),
		contentType: false,
        cache: false,
		processData:false,
        success: function(res){
			// console.log(res);
			alert(res.msg);
			if(res.success){
                location.reload();
            }
		}
	})
})

// delete chetGroup

$('.deleteGroup').click(function(){
    $('#delete_group_id').val($(this).attr('data-id'));
    $('#delete_group_name').text($(this).attr('data-name'));
});

$('#deleteChatGroupForm').submit(function(e){
	e.preventDefault();
	 var formData = $(this).serialize();

	 $.ajax({
		url:'/delete-chat-group',
        type: 'POST',
        data: formData,
		success: function(res){
			alert(res.msg);
			if(res.success){
                location.reload();
            }
		}
	 })
})

// // copy shareable link

$('.copy').click(function(){
  $(this).prepend('<span class="copied_text">Copied</span>')
  var group_id = $(this).attr('data-id');

  var url = window.location.
  host + '/share-group/' +group_id;
  var temp = $("<input>")
  $("body").append(temp);
  temp.val(url).select();
  document.execCommand("copy");
  temp.remove();
  setTimeout(()=>{
	$('.copied_text').remove();
  },2000)
})

//----------join group scripts--------------------------------

$('.join-now').click(function(){
	$(this).text('Wait...');
	$(this).attr('disabled','disabled');

	var group_id = $(this).attr('data-id')

	$.ajax({
		url:'/join-group',
        type: 'POST',
        data:{group_id:group_id},
        success: function(res){
			alert(res.msg)
			if(res.success){
				location.reload();
			}else{	
				$(this).text('Join now');
				$(this).removeAttr('disabled');
			}
		}
	})

})

// // ------------------------ group chattings------------------------
function scrollGroupChat(){
	$('#group-chat-container').animate({
		scrollTop: $('#group-chat-container').offset(). top + $('#group-chat-container')[0].scrollHeight      
	  },0)
}

$('.group-list').click(function(){
	$('.group-start-head').hide();
	$('.group-chat-section').show();
	global_group_id = $(this).attr('data-id')
	loadGroupChats()
});

// $('#group-chat-form').submit(function (event) {
// 	event.preventDefault();

// 	var message = $('#group-message').val();

// 	$.ajax({
// 		url: '/group-chat-save',
// 		type: 'POST',
// 		data: { sender_id: sender_id, group_id: global_group_id, message: message },
// 		success: function (response) {
// 			// console.log(response.chat)
// 			if (response.success) {
// 				// console.log(response.chat.id)
// 				$('#group-message').val('')
// 				let message = response.chat.message;
// 				let html = `<div class="current-user-chat" id='`+response.chat.id+`'>
// 				<h5><span>`+ message + `</span>
// 					<i class="fa fa-trash" aria-hidden="true" data-id='`+response.chat.id+`' data-toggle="modal" data-target="#deleteGroupChatModel"></i>
// 					<i class="fa fa-edit" aria-hidden="true" data-id='`+response.chat.id+`' data-msg='`+message+`' data-toggle="modal" data-target="#editGroupChatModel"></i>
// 					</h5>
// 				 </div> `;
// 				$('#group-chat-container').append(html)
// 				socket.emit('newGroupChat', response.chat)
// 				scrollGroupChat()
// 			} else {
// 				alert(data.msg)
// 			}

// 		}
// 	})
// })
// socket.on('loadNewGroupChat', function (data) {
// 	if(global_group_id == data.group_id) {
// 		let html =  `<div class="distance-user-chat" id='`+data.id+`'>
// 	     	<h5><span>`+ data.message + `</span> </h5>
// 		 </div> `;
// 		 $('#group-chat-container').append(html);
// 		 scrollGroupChat();
// 	}
// })

$(document).on('click','.fa-edit',function(){
	var id = $(this).attr('data-id');
	var msg = $(this).attr('data-msg');

	$('#edit-group-message-id').val(id);
	$('#group-message').val(msg);

	// Set the action variable to 'edit'
	action = 'edit';
});

var action = 'send';

$('#group-chat-form').submit(function (event) {
	event.preventDefault();
	var message = $('#group-message').val();
	if (message.trim() === '') {
        alert('Message field cannot be empty!');
        return;
    }
	if (action == 'send') {
		// Send a new chat message
		$.ajax({
			url: '/group-chat-save',
			type: 'POST',
			data: { sender_id: sender_id, group_id: global_group_id, message: message,senderName:userData.name },
			success: function (response) {
				if (response.success) {
					console.log(response)
					$('#group-message').val('')
					let message = response.chat.message;
					let html = `<div class="current-user-chat" id='`+response.chat.id+`'>
					<h5><p>`+ response.chat.senderName + `</p><span>`+ message + `</span>
						<i class="fa fa-trash" aria-hidden="true" data-id='`+response.chat.id+`' data-toggle="modal" data-target="#deleteGroupChatModel"></i>
						<i class="fa fa-edit" aria-hidden="true" data-id='`+response.chat.id+`' data-msg='`+message+`' ></i>
						</h5>
					 </div> `;
					$('#group-chat-container').append(html)
					socket.emit('newGroupChat', response.chat)
					scrollGroupChat()
				} else {
					alert(data.msg)
				}
			}
		})
	} else if (action == 'edit') {
		// Update the existing chat message
		var id = $('#edit-group-message-id').val();
		$.ajax({
			type: 'POST',
			url: '/updateGroupChat',
			data: {id:id, message:message},
			success: function(res){
				if(res.success == true){
					$('#group-message').val('')
					// $('#editGroupChatModel').modal('hide');
					$('#'+id).find('span').text(message)
					$('#'+id).find('.fa-edit').attr('data-msg',message)
	
					socket.emit('groupChatUpdated',{id:id,message:message});
				}else{
					alert(res.msg);
				}
			}
		});
	}

	// Reset the action variable to 'send'
	action = 'send';
});


socket.on('loadNewGroupChat', function (data) {
	if(global_group_id == data.group_id) {
		let html =  `<div class="distance-user-chat" id='`+data.id+`'>
	     	<h5><p>`+ data.senderName + `</p><span>`+ data.message + `</span> </h5>
		 </div> `;
		 $('#group-chat-container').append(html);
		 scrollGroupChat();
	}
})


socket.on('groupChatMessageUpdated',function(data){
	$('#'+data.id).find('span').text(data.message)
	
	})

function loadGroupChats(){
	$.ajax({
		url:'/load-group-chats',
        type: 'POST',
        data:{group_id:global_group_id},
        success: function(res){
			// console.log(res.chats)
			if(res.success){
				// console.log(res.chats)
				var chats = res.chats;
				var html = '';

				for(let i = 0; i < chats.length; i++){

					let className = 'distance-user-chat' 

					if(chats[i]['sender_id'] == sender_id){
                        className ='current-user-chat'
                    }

					// html += `<div class="`+className+`" id="`+chats[i]['id']+`">
                    // <h5><span>`+chats[i]['message']+`</span>
                    //     </h5>
                    //  </div> `;


					html+=`<div class='`+className+`'id='`+chats[i]['id']+`' >
					<h5><p>`+ chats[i]['senderName'] + `</p> <span>`+chats[i]['message']+`</span>`;
						if(chats[i]['sender_id']==sender_id){
							html+=` <i class="fa fa-trash" aria-hidden="true" data-id='`+chats[i]['id']+`' data-toggle="modal" data-target="#deleteGroupChatModel"></i>
							<i class="fa fa-edit" aria-hidden="true" data-id='`+chats[i]['id']+`' data-msg='`+chats[i]['message']+`'></i>
		
							`
						}
					   html+=`
						</h5>
					</div>
					`;

				}
				$('#group-chat-container').html(html);
				scrollGroupChat()
			}else{
				alert(res.msg)
			}
		}
	})
}

// delete chat work

$(document).on('click', function(event) {
	if ($(event.target).hasClass('fa-trash')) {
	  let msg = $(event.target).parent().text();
	//   console.log(msg);
	  $('#delete-group-message').text(msg);
	  $('#delete-message-group-id').val($(event.target).attr('data-id'));
	}
  });

	$('#delete-group-chat-form').submit(function(event){
		event.preventDefault();
		var id =$('#delete-message-group-id').val();
		$.ajax({
			type: 'POST',
			url: '/deleteGroupChat',
			data: {id:id},
			success: function(res){
				if(res.success == true){
					$('#'+id).remove();
					$('#deleteGroupChatModel').modal('hide');
					socket.emit('groupChatDeleted', id);
				}else{
					alert(res.msg);
				}
			}
		})
		})

socket.on('GroupchatMessageDeleted',function(id){
	$('#'+id).remove();
});

// edit Group chat work

// $(document).on('click','.fa-edit',function(){
// 	$('#edit-group-message-id').val($(this).attr('data-id'));
// 	$('#update-group-message').val($(this).attr('data-msg'));
// 	})

	
// $('#update-group-chat-form').submit(function(event){
// 	event.preventDefault();
// 	var id =$('#edit-group-message-id').val();
// 	var msg =$('#update-group-message').val();
// 	$.ajax({
// 		type: 'POST',
// 		url: '/updateGroupChat',
// 		data: {id:id, message:msg},
// 		success: function(res){
// 			if(res.success == true){
// 				$('#editGroupChatModel').modal('hide');
// 				$('#'+id).find('span').text(msg)
// 				$('#'+id).find('.fa-edit').attr('data-msg',msg)
	
// 				socket.emit('groupChatUpdated',{id:id,message:msg});
// 			}else{
// 				alert(res.msg);
// 			}
// 		}
// 	});
// 	});
	
	// socket.on('groupChatMessageUpdated',function(data){
	// $('#'+data.id).find('span').text(data.message)
	
	// })
