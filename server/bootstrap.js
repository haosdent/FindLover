// if the database is empty on server start, create some sample data.
Meteor.startup(function(){
    /*if (Users.find().count() === 0) {
	var users = [
	    {
		name: 'user1',
		passwd: 'user1'
	    },
	    {
		name: 'user2',
		passwd: 'user2'
	    },
	    {
		name: 'user3',
		passwd: 'user3'
	    }
	];

	for (var i = 0, l = users.length; i < l; i++) {
	    Users.insert(users[i]);
	}
    };

    if(Rooms.find().count() === 0){
	var rooms = [
	    {
		name: 'room1'
	    },
	    {
		name: 'room2'
	    },
	    {
		name: 'room3'
	    }
	];

	for (i = 0, l = rooms.length; i < l; i++) {
	    Rooms.insert(rooms[i]);
	}
    };*/
});
