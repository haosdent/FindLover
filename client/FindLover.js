// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.
Rooms = new Meteor.Collection("rooms");
Users = new Meteor.Collection("users");

// Init Session
Session.init = function(){
    // ID of currently entered room
    Session.set('room_id', null);

    // ID of current user
    Session.set('user_id', null);

    // Init login tip message.
    Session.set('login_tip', 'No Login!');

    // Init create room tip message.
    Session.set('create_room_tip', 'Pls login first!');

    // ID of currently selected room
    Session.set('select_room_id', null);
};

Session.init();

////////// User //////////

Template.user.tip = function(){
    return Session.get('login_tip');
};

Template.user.events({
    'submit .login': function(evt){
	// prevent default event on <form>.
	evt.preventDefault();

	var form = evt.target,
	    sel = {name: form.name.value, passwd: form.passwd.value},
	    user = Users.findOne(sel);
	Session.init();
	if(user && user._id){
	    Session.set('user_id', user._id);
	    Session.set('room_id', user.room_id);
	    Session.set('login_tip', user.name + 'Login Successfully!');
	}else{
	    Session.set('login_tip', 'Login Failed!');
	};
    },
    'submit .create': function(evt){
	// prevent default event on <form>.
	evt.preventDefault();

	var form = evt.target,
	    user = {name: form.name.value, passwd: form.passwd.value, sex: form.sex.checked},
	    userId;
	userId = Users.insert(user);
	Session.init();
	if(userId){
	    Session.set('user_id', userId);
	    Session.set('login_tip', user.name + 'Login Successfully!');
	}else{
	    Session.set('login_tip', 'Login Failed!');
	};
    }
});

////////// Rooms //////////

Template.rooms.tip = function(){
    return Session.get('create_room_tip');
};

Template.rooms.rooms = function(){
    return Rooms.find({}, {sort: {name: 1}});
};

Template.rooms.selected = function(){
    return Session.equals('select_room_id', this._id) ? true : false;
};

Template.rooms.entered = function(){
    return Session.equals('room_id', this._id) ? true : false;
};

Template.rooms.events({
    'submit .create': function(evt){
	// prevent default event on <form>.
	evt.preventDefault();

	var form = evt.target,
	    userId = Session.get('user_id'),
	    user = Users.findOne({_id: userId}),
	    room;
	if(userId){
	    room = {name: form.name.value, owner: userId, type: user.sex};
	    var roomId = Rooms.insert(room);
	    Session.set('create_room_tip', room.name + ' Create Successfully!');
	    Router.setRoom(roomId);
	}else{
	    Session.set('create_room_tip', 'Pls login first!');
	};
    },
    'click .room': function(evt){ // select list
	Session.set('select_room_id', this._id);
    },
    'click .enter': function(evt){
	Router.setRoom(this._id);
    },
    'click .leave': function(evt){
	Router.unsetRoom();
    }
});

////////// Users //////////

Template.users.users = function(){
    var roomId = (Session.get('room_id') || Session.get('select_room_id'));
    var sel = {room_id: roomId};
    return Users.find(sel, {sort: {name: 1}});
};

////////// Tracking selected list in URL //////////

var RoomRouter = Backbone.Router.extend({
    routes: {
	':room_id/enter': 'enterRoom',
	':room_id/leave': 'leaveRoom',
	':room_id/remove': 'removeRoom'
    },
    enterRoom: function(roomId) {
	var userId = Session.get('user_id'),
	    user = Users.findOne({_id: userId}),
	    room = Rooms.findOne({_id: roomId});
	Rooms.remove({_id: {$ne: roomId}, owner: userId});
	if(user._id == room.owner || user.sex != room.type){
	    Session.set('room_id', roomId);
	    if(userId){
		Users.update({_id: userId}, {$set: {room_id: roomId}});
	    };
	};
    },
    leaveRoom: function(roomId){
	Session.set('room_id', null);
	var userId = Session.get('user_id');
	if(userId){
	    Users.update({_id: userId}, {$set: {room_id: null}});
	};
    },
    removeRoom: function(roomId){
	Rooms.remove({_id: roomId});
    },
    setRoom: function(roomId){
	//this.navigate(roomId + '/enter', true);
	this.enterRoom(roomId);
    },
    unsetRoom: function(){
	var roomId = Session.get('room_id'),
	    userId = Session.get('user_id'),
	    room = Rooms.findOne({_id: roomId});

	//this.navigate(roomId + '/leave', true);
	this.leaveRoom(roomId);
	if(!room.owner || room.owner == userId){
	    //this.navigate(roomId + '/remove', true);
	    this.removeRoom(roomId);
	};
    }
});

Router = new RoomRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
