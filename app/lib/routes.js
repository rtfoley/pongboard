// something is not working anymore with respect to the loadingTemplate
// and the waitOn hook, there is a lot of discussion about this here:
// https://github.com/EventedMind/iron-router/issues/265
// functionality changed after Meteor 0.8/iron-router 0.7
// waitOn should not go in the global configure since you shouldn't wait
// on all of the subscriptions for every route, but it is here for now
// to try to figure out what is going on
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('players'),
            Meteor.subscribe('matches')];
  }
});

// in the post above, it was suggested to call if(this.ready()) in the data
// hook to actually get the loadingTemplate to work, so this is being done
// for the home route below
Router.map(function() {
  this.route('home', {
    path: '/',
    layoutTemplate: 'layout',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches')];
    }
  });

  this.route('add_game', {
    path: '/add_game',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches')];
    }
  });
  
  this.route('add_player', {
    path: '/add_player',
    waitOn: function() {
      return [Meteor.subscribe('players')];
    }
  });

  this.route('rankings', {
    path: '/rankings',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches')];
    }
  });
  
  this.route('game_list', {
    path: '/game_list',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches')];
    }
  });
  
  this.route('player_list', {
    path: '/players',
    waitOn: function() {
      return [Meteor.subscribe('players')];
    }
  });
  
  this.route('player_page', {
    path: '/players/:_id',
    waitOn: function() {
      return [Meteor.subscribe('players')];
    },
    data: function() { 
      return Players.findOne(this.params._id);
    }
  });

  this.route('about', {
    path: '/about'
  });

  // route with name 'notFound' that for example matches
  // '/non-sense/route/that-matches/nothing' and automatically renders
  // template 'notFound'
  // HINT: Define a global not found route as the very last route in your router
  this.route('notFound', {
    path: '*'
  });
});
