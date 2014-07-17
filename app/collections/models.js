// using autoform, simple-schema, and Collections2 packages to validate inserts
// against schema to ensure data integrity
Matches = new Meteor.Collection('matches');

// here we are creating a SimpleSchema because date_time is in the Collection,
// but not in the form
MatchFormSchema = new SimpleSchema({
  ro: {
    type: String,
    label: 'Player 1*',
    custom: function () {
      if (this.value == this.field('bo').value) {
        return "samePlayer";
      }
    }
  },
  bo: {
    type: String,
    label: 'Player 2*',
    custom: function () {
      if (this.value == this.field('ro').value) {
        return "samePlayer";
      }
    }
  },
  rs: {
    type: Number,
    label: 'Player 1 Score*',
    min: 0,
    custom: function() {
      var thisScore = this.value;
      var theirScore = this.field('bs').value;
      return checkScore(thisScore, theirScore);
    }
  },
  bs: {
    type: Number,
    label: 'Player 2 Score*',
    min: 0,
    custom: function() {
      var thisScore = this.value;
      var theirScore = this.field('rs').value;
      return checkScore(thisScore, theirScore);
    }
  }
});

Players = new Meteor.Collection('players', {
  schema: {
    name: {
      type: String,
      label: 'Name*',
      min: 2,
      custom: function() {
        var id = Players.findOne({name: this.value});
        if (id) {
          // player already in database, no need to add again
          console.log('id already exists: ' + id._id);
          return "alreadyExists";
        }
      }
    },
    date_time: {
      type: Number
    },
    rating: {
      type: Number,
      min: 0
    },
    wins: {
      type: Number,
      min: 0
    },
    losses: {
      type: Number,
      min: 0
    }
  }
});

MatchFormSchema.messages({
  "samePlayer": "Players can not be the same",
  "winBy2": "Winner must win by at least 2 points",
  "sameScore": "Game cannot end in a tie",
  "playTo11": "Winner must have at least 11 points",
  "illegalOvertime": "Winner can't win by more than 2 points if opponent has at least 10 points"
});

Players.simpleSchema().messages({
  "alreadyExists": "Player already exists"
});

var checkScore = function(thisScore, theirScore) {
  if(thisScore == theirScore) {
    // no ties
    return "sameScore";
  } else if(thisScore > theirScore && thisScore < 11) {
    // winner must be 11 or greater
    return "playTo11";
  } else if(thisScore > theirScore && thisScore < theirScore + 2) {
    // must win by 2
    return "winBy2";
  } else if(thisScore > theirScore && theirScore >= 10 && thisScore - theirScore != 2) {
    // if the losing score is 10 or higher, winning score can only be 2 points higher
    return "illegalOvertime";
  } 
}