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
  
  var query = [
    'MATCH (users:User)',
    'RETURN users'
  ].join('\n');
  var params = {};
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, users){
    if (err) throw err;
    
    console.log(users);
    res.render('users_index', {title: 'All Users'});  
  });
  
});




module.exports = router;