// global router configuration
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
});

Router.map(function() {
  // Home
  this.route('home', {
    path: '/',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches', {sort: {date_time: -1}, limit: 10})];
    }
  });

  // Add Game
  this.route('add_game', {
    path: '/add_game',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches', {sort: {date_time: -1}, limit: 10})];
    }
  });
  
  // Add Player
  this.route('add_player', {
    path: '/add_player',
    waitOn: function() {
      return [Meteor.subscribe('players')];
    }
  });

  // Rankings
  this.route('rankings', {
    path: '/rankings',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches')];
    }
  });
  
  // Game List
  this.route('game_list', {
    path: '/game_list',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches')];
    }
  });
  
  // Player List
  this.route('player_list', {
    path: '/players',
    waitOn: function() {
      return [Meteor.subscribe('players')];
    }
  });
  
  // Individual Player Page
  this.route('player_page', {
    path: '/players/:_id',
    waitOn: function() {
      return [Meteor.subscribe('players'),
              Meteor.subscribe('matches')];
    },
    data: function() { 
      return Players.findOne(this.params._id);
    }
  });

  // About
  this.route('about', {
    path: '/about'
  });

  // Not-found Page
  this.route('notFound', {
    path: '*'
  });
});

Router.onBeforeAction('loading');