# pongboard

Pongboard is a simple web interface for keeping track of scores and providing
some statistical information for players/matches.  This software is based on https://github.com/gui81/scorekeeper

## Quick Start

### Checkout pongboard:
    https://github.com/rtfoley/pongboard.git

### Get Meteor and Meteorite
Install [meteor.js] (https://www.meteor.com/) and install [meteorite] (http://oortcloud.github.io/meteorite/).

### Run
    cd pongboard
    mrt

### Todos
Stage 1
- [x] change foosball references to ping pong
- [x] switch "offense" and "defense" notation to "player 1" and "player 2" for team stats
- [x] home page should show a list of players by rank, and most recent games
- [x] top-anchored navbar? (no sidebar)
- [x] only show users in individual stats that have played games
- [x] game form validation: must win by 2 points, no ties
- [x] Use Moment.js for time/ date display
- [x] fix the rules page
- [x] games list page = all games, listed chronologically
- [x] update game details to highlight winner/ loser
- [x] validate that winner must be 11 or greater
- [x] validate that if loser is => 10, winner must be loser + 2
- [x] player list
- [x] player name is link to page about that player

Additional player page info:
- [x] list of player's recent games
- [x] opponents list and record against each

UI Facelift
- [x] display rank for each player on their page, and in the player tables
- [x] icons (font awesome?)

General Improvements
- [ ] admin system to edit/ delete games + players.
- [ ] fixture data for dev envrironment
- [ ] unit tests
- [ ] Player comparison matrix?

Playing Session Management
- [ ] Start a session
- [ ] End a session
- [ ] Add user to session
- [ ] Remove user from session
- [ ] Generate and show a lineup
- [ ] Skip/ bump player in lineup
