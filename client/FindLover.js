// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.
Rooms = new Meteor.Collection("rooms");
Users = new Meteor.Collection("users");

// ID of currently selected room
Session.set('room_id', null);

// ID of current user
Session.set('user_id', null);

// Init login tip message.
Session.set('login_tip', 'No Login!');

// Init create room tip message.
Session.set('create_room_tip', 'Pls login first!');

////////// Login //////////

Template.login.tip = function(){
    return Session.get('login_tip');
};

Template.login.events({
    'submit .login': function(evt){
	// prevent default event on <form>.
	evt.preventDefault();

	var form = evt.target,
	    sel = {name: form.name.value, passwd: form.passwd.value},
	    user = Users.findOne(sel);
	if(user && user._id){
	    Session.set('user_id', user._id);
	    Session.set('login_tip', user.name + 'Login Successfully!');
	}else{
	    Session.set('login_tip', 'Login Failed!');
	};
    }
});

////////// Rooms //////////

Template.rooms.rooms = function(){
  return Rooms.find({}, {sort: {name: 1}});
};

Template.rooms.selected = function(){
  return Session.equals('room_id', this._id) ? 'selected' : '';
};

Template.rooms.events({
    'submit .create': function(evt){
	// prevent default event on <form>.
	evt.preventDefault();

	var form = evt.target, userId = Session.get('user_id'), room;
	if(userId){
	    room = {name: form.name.value, owner: userId};
	    var roomId = Rooms.insert(room);
	    Session.set('create_room_tip', room.name + ' Create Successfully!');
	    Router.setRoom(roomId);
	}else{
	    Session.set('create_room_tip', 'Pls login first!');
	};
    },
    'mousedown .room': function(evt) { // select list
	Router.setRoom(this._id);
    },
    'click .room': function(evt) {
	// prevent clicks on <a> from refreshing the page.
	evt.preventDefault();
    }
});

////////// Users //////////

Template.users.users = function(){
    var roomId = Session.get('room_id');
    var sel = {room_id: roomId};
    return Users.find(sel, {sort: {name: 1}});
};

////////// Tracking selected list in URL //////////

var RoomRouter = Backbone.Router.extend({
  routes: {
      ":room_id": "enterRoom"
  },
  enterRoom: function(roomId) {
      Session.set("room_id", roomId);
      var userId = Session.get('user_id');
      if(userId){
	  Users.update({_id: userId}, {$set: {room_id: roomId}});
      };
  },
  setRoom: function(roomId) {
      this.navigate(roomId, true);
  }
});

Router = new RoomRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
