var express = require('express');
var router = express.Router();
var neo4j = require('neo4j');
var neo4jDB = new neo4j.GraphDatabase(process.env.GRAPH_DB_URL);


/* Post create user. */
router.post('/', function(req, res, next) {
  var name = req.body['name']
  var gender = req.body['gender']
  var query = [
    'CREATE (user:User {newUser})',
    'RETURN user'
  ].join('\n');
  var params = {
    newUser: {
      name: name,
      gender: gender
    }
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, 
    function(err, user){
      if (err) throw err;
    
      console.log(user);
      res.status(200).json(user=user);
  });
  
});


/* GET create user. */
router.get('/new', function(req, res, next) {
  res.render('users_new', {title: 'Create New User'});  
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  var loggedInUserID = 2;
  var query = [
    'MATCH (users:User)',
    'WHERE NOT (ID(users) = {loggedInUserID})',
    'RETURN users'
  ].join('\n');
  var params = {
    loggedInUserID: loggedInUserID
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, users){
    if (err) throw err;
    
    res.render('users_index', {title: 'All Users', users: users});  
  });
  
});

/* GET show a single user. */
router.get('/:id.json', function(req, res, next) {
  var userID = req.param('id');
  var query = [
    'MATCH (user:User)',
    'WHERE ID(user) = {id}',
    'RETURN user'
  ].join('\n');
  var params = {
    id: Number(userID)
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, user){
    if (err) throw err;
    
    console.log(user);
    
    return res.status(200).json(id=userID,user=user);
  });
});


/* GET show a single user. */
router.get('/:id', function(req, res, next) {
  var userID = req.param('id');

  var query = [
    'MATCH (user:User), (websites:Website)',
    'WHERE (ID(user) = {id} AND (user)-[:like]->(websites))',
    'RETURN user,websites'
  ].join('\n');
  var params = {
    id: Number(userID)
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, userData){
    if (err) throw err;
        
    res.render('users_show', {title: '', userData: userData});  
  });
});

/* POST current user follow another user. */
router.post('/:id/follow', function(req, res, next) {
  var userID = req.param('userID');
  var followedUserID = req.param('follow');
  
  var query = [
    'MATCH (u1:User), (u2:User)',
    'WHERE (ID(u1) = {id} AND ID(u2) = {followedUserID})',
    'CREATE',
    '(u1)-[:follows]->(u2)',
    'RETURN u1,u2'
  ].join('\n');
  var params = {
    id: Number(userID),
    followedUserID: Number(followedUserID)
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, usersData){
    if (err) throw err;
    
    console.log(usersData);
    
    return res.redirect('/users');
  });
  
});

/* GET show followed users by a single user. */
router.get('/:id/friends/follows', function(req, res, next) {
  var userID = req.param('id');
  
  var query = [
    'MATCH (user:User), (users:User)',
    'WHERE ',
    'ID(user) = {id} ',
    'AND ',
    '(user)-[:follows]->(users)',
    'RETURN users'
  ].join('\n');
  var params = {
    id: Number(userID)
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, users){
    if (err) throw err;
    
    res.render('users_following', {title: 'Following', users: users});  
  });
});


/* GET users that follow the current user. */
router.get('/:id/friends/followed', function(req, res, next) {
  var userID = req.param('id');
  
  var query = [
    'MATCH (user:User), (users:User)',
    'WHERE ',
    'ID(user) = {id} ',
    'AND ',
    '(user)<-[:follows]-(users)',
    'RETURN users'
  ].join('\n');
  var params = {
    id: Number(userID)
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, users){
    if (err) throw err;
    
    res.render('users_index', {title: 'Followed By', users: users});  
  });
});


/* POST current user follow another user. */
router.post('/:id/likes', function(req, res, next) {
  var userID = req.param('userID');
  var websiteID = req.param('websiteID');
    
  var query = [
    'MATCH (u:User), (w:Website)',
    'WHERE (ID(u) = {id} AND ID(w) = {websiteID})',
    'CREATE',
    '(u)-[:like]->(w)',
    'RETURN u,w'
  ].join('\n');
  var params = {
    id: Number(userID),
    websiteID: Number(websiteID)
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, usersData){
    if (err) throw err;
    
    console.log(usersData);
    
    return res.redirect('/users/2');
  });
  
});

// friends suggestions
/* GET users that follow the current user. */
router.get('/:id/friends/suggestions', function(req, res, next) {
  var userID = req.param('id');

// MATCH (u:User), (f:User), (w:Website)
// WHERE (ID(u) = 2 AND (NOT ID(f) = 2) AND (u)-[:like]->(w)<-[:like]-(f))
// RETURN f

  var query = [
    'MATCH (u:User), (users:User), (w:Website)',
    'WHERE ',
    '(ID(u) = {id} AND (NOT ID(users) = {id}) AND (u)-[:like]->(w)<-[:like]-(users))',
    'RETURN users'
  ].join('\n');
  var params = {
    id: Number(userID)
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, users){
    if (err) throw err;
    
    res.render('users_index', {title: 'Suggestions', users: users});  
  });
});




module.exports = router;