var express = require('express');
var router = express.Router();
var neo4j = require('neo4j');
var neo4jDB = new neo4j.GraphDatabase(process.env.GRAPH_DB_URL);
var crypto = require('crypto');
var appSecret = process.env.APP_SECRET;


//
//  Helper
//
var restrictAccess = function(req, res, next){
  if (!req.cookies.userID){
    return res.redirect('/users/login');
  }
  
  next();
};

/* GET /users/register */
router.get('/register', function(req, res, next){  
  
  res.render('users/register', {title: 'Register'});
});

/* POST /users/register */
router.post('/register', function(req, res, next){
  var email = req.body['email'];
  var password = req.body['password'];
  var picture = req.body['picture'];
  var gender = req.body['gender'];
  
  // check if the form is not empty
  if (!email || !password){
    return res.redirect('/users/register');
  }
  
  // check if the email exists in the database
  
  // encrypt the password
  var encryptedPassword = crypto.createHmac('sha256',appSecret)
                  .update(password)
                  .digest('hex');
  
  // create an activation code
  var activationCode = crypto.createHmac('sha256',appSecret)
                  .update(String(new Date()))
                  .digest('hex');
  
  // insert the data
  var query = [
    'CREATE (user:User {newUser})',
    'RETURN user'
  ].join('\n');
  var params = {
    newUser: {
      email: email,
      encryptedPassword: encryptedPassword,
      activationCode: activationCode,
      gender: gender,
      picture: picture,
      active: true
    }
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, 
    function(err, user){
      if (err) throw err;
    
      console.log(user);
      res.redirect('/users/login');
  });
  
  res.status(200);
});

/* GET /users/login */
router.get('/login', function(req, res, next){
  
  res.render('users/login', {title: 'Login'});
});

/* POST /users/login */
router.post('/login', function(req, res, next){
  var email = req.body['email'];
  var password = req.body['password'];
  var encryptedPassword = crypto.createHmac('sha256',appSecret)
                  .update(password)
                  .digest('hex');
 
  // check if data is empty
  if (!email || !password){
    // add a message
    return res.redirect('/users/login');
  }
  

  // check if the user exists
  // MATCH (user:User {email: "username@email.com"}) RETURN user
  var query = [
    'MATCH (user:User { email: {email} })',
    'RETURN user'
  ].join('\n');
  var params = {
    email: email
  }
  
  // encrypt the password
  var encryptedPassword = crypto.createHmac('sha256',appSecret)
                  .update(password)
                  .digest('hex');

  // check if password match
  neo4jDB.cypher({
    query: query,
    params: params
  }, 
    function(err, user){
      if (err) throw err;
    
      console.log(user[0]['user']['properties']);
      // if the user exists check if is active
      
      // login the user
      var userID = user[0]['user']['_id'];
      var currentUser = user[0]['user']['properties'];
      res.cookie('userID', userID, {
        domain: 'begin-imitate.codio.io',
        maxAge: new Date(Date.now() + 9000)

      });
      res.cookie('user', currentUser, {
        domain: 'begin-imitate.codio.io',
        maxAge: new Date(Date.now() + 9000)
      });
      
      res.redirect('/');
  });
 
});

/* DELETE|GET /users/logout */
router.get('/logout', function(req, res, next){
  // delete the cookie
  res.clearCookie('userID', {
        domain: 'begin-imitate.codio.io'
      });
  res.clearCookie('user', {
        domain: 'begin-imitate.codio.io'
      });

  res.redirect('/users/login');
});

/* Post create user. */
router.post('/', restrictAccess, function(req, res, next) {
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
router.get('/new', restrictAccess, function(req, res, next) {
  res.render('users/new', {title: 'Create New User'});  
});


/* GET users listing. */
router.get('/', restrictAccess, function(req, res, next) {
  var loggedInUserID = req.cookies.userID;
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
    
    res.render('users/index', {title: 'All Users', users: users});  
  });
  
});

/* GET show a single user. */
router.get('/:id.json', restrictAccess, function(req, res, next) {
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
    
    return res.status(200).json(id=userID, user=user);
  });
});


/* GET show a single user. */
router.get('/:id', function(req, res, next) {
  var userID = req.params['id'];

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
    
    console.log(userID);
    console.log (userData);
        
    res.render('users/show', {title: '', userData: userData});  
  });
});

/* POST current user follow another user. */
router.post('/:id/follow', restrictAccess, function(req, res, next) {
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
router.get('/:id/friends/follows', restrictAccess, function(req, res, next) {
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
    console.log(users);
    
    res.render('users/following', {title: 'Following', users: users});  
  });
});


/* GET users that follow the current user. */
router.get('/:id/friends/followed', restrictAccess, function(req, res, next) {
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
    
    res.render('users/index', {title: 'Followed By', users: users});  
  });
});


/* POST current user follow another user. */
router.post('/:id/likes', restrictAccess, function(req, res, next) {
  var userID = req.param('userID');
  var websiteID = req.param('websiteID');
    
  var query = [
    'MATCH (u:User), (w:Website)',
    'WHERE (ID(u) = {id} AND ID(w) = {websiteID})',
    'CREATE',
    '(f:Feed {objectName: "Website", description: {description} }),',
    '(u)-[:like]->(w),',
    '(u)-[:createdActivity]->(f)',
    'RETURN u,w,f'
  ].join('\n');
  var params = {
    id: Number(userID),
    websiteID: Number(websiteID),
    description: "liked a website"
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, usersData){
    if (err) throw err;
    
    console.log(userID);
    console.log(websiteID);
    console.log(usersData);
    
    return res.redirect('/users/'+userID);
  });
  
});

// friends suggestions
/* GET users that follow the current user. */
router.get('/:id/friends/suggestions', restrictAccess, function(req, res, next) {
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
    
    res.render('users/index', {title: 'Suggestions', users: users});  
  });
});




module.exports = router;