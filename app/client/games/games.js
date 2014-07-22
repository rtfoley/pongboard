Template.game_form.helpers({
  players: function() {
    var p = [];
    var uTemp = Players.find({}, {sort: {name: 1}});
    uTemp.forEach(function(u) {
      var ret = { 
        value: u._id, 
        label: u.name
      };
      p.push(ret);
    });
    return p;
  },
  
});

Template.edit_game.helpers({
  loading: function() {
    return Session.equals("recalculating", true);
  }
});

Template.game_list.helpers({
  matches: function() {
    return Matches.find({}, {sort: {date_time: -1}});
  },
  matchCount: function() {
    return Matches.find({}).count();
  }
});

Template.game_form.events = {
  'click button.cancel': function () {
    history.back();
  },
  
  'click button.delete': function () {
    Session.set("recalculating", true);
    Meteor.call('deleteMatch', this.game._id, function(err, response) {
      history.back();
      Session.set("recalculating", false);
    });
  }
};

Template.recent_games.helpers({
  matches: function() {
    return Matches.find({}, {sort: {date_time: -1}, limit: 10});
  }
});

// Form hooks
AutoForm.hooks({
  gameForm: {
    // add timestamp to match
    before: {
      insert: function(doc, template) {
        doc.date_time = Date.now();
        return doc;
      }
    },
    onSuccess: function(operation, result, template) {
      if(operation=="update") {
        AutoForm.resetForm(gameForm);
        history.back();
      }
    }
  }
});