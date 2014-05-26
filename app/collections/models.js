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

MatchFormSchema.messages({
  "samePlayer": "Players can not be the same",
  "illegalWin": "Winner must win by at least 2 points",
  "sameScore": "Game cannot end in a tie"
});

var checkScore = function(thisScore, theirScore) {
  if(thisScore > theirScore && thisScore < theirScore + 2) {
    return "illegalWin";
  } else if(thisScore == theirScore) {
    return "sameScore";
  }
}