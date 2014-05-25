// using autoform, simple-schema, and Collections2 packages to validate inserts
// against schema to ensure data integrity
Matches = new Meteor.Collection('matches');

// here we are creating a SimpleSchema because date_time is in the Collection,
// but not in the form
MatchFormSchema = new SimpleSchema({
  ro: {
    type: String,
    label: 'Player 1*',
  },
  bo: {
    type: String,
    label: 'Player 2*',
  },
  rs: {
    type: Number,
    label: 'Player 1 Score*',
    min: 0
  },
  bs: {
    type: Number,
    label: 'Player 2 Score*',
    min: 0
  }
});

MatchFormSchema.messages({
  
});