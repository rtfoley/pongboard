// using autoform, simple-schema, and Collections2 packages to validate inserts
// against schema to ensure data integrity
Matches = new Meteor.Collection('matches');
Players = new Meteor.Collection('players');
// just singles ratings
SinglesRatings = new Meteor.Collection('singles_ratings');

var playerNames = function() {
  // if the value does not exist, then let's just return so that the optional
  // fields are handled correctly
  if (!this.value) {
    return;
  }
  // now try to find the player in our Collection
  var player = Players.findOne({name: this.value});
  // if player not found, or for some reason the name is not found, then return
  // a custom message
  if (!player || !player.name) {
    return 'nameNotFound';
  }
};

// custom messages
SimpleSchema.messages({
  'nameNotFound': 'Player name does not currently exist.'
});

// here we are creating a SimpleSchema because date_time is in the Collection,
// but not in the form
MatchFormSchema = new SimpleSchema({
  ro: {
    type: String,
    label: 'Player 1*',
    min: 2,
    custom: playerNames
  },
  bo: {
    type: String,
    label: 'Player 2*',
    min: 2,
    custom: playerNames
  },
  rs: {
    type: Number,
    label: 'Side 1 Score*',
    min: 0
  },
  bs: {
    type: Number,
    label: 'Side 2 Score*',
    min: 0
  }
});

PlayerFormSchema = new SimpleSchema({
  player_name: {
    type: String,
    label: 'Name*',
    min: 2
  },
  rating: {
    type: Number,
    label: 'Initial Rating*',
    allowedValues: [250, 750, 1250, 1750, 2250]
  }
});