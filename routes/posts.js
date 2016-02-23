var express = require('express');
var router = express.Router();
var neo4j = require('neo4j');
var neo4jDB = new neo4j.GraphDatabase(process.env.GRAPH_DB_URL);

//
//  Helper
//
var restrictAccess = function(req, res, next){
  var userID = req.cookies.userID;
  if (!userID){
    return res.redirect('/users/login');
  }
  
  
  next();
};



/* POST /posts/create.json */
router.post('/create.json', restrictAccess, function(req, res ,next){
  var userID = req.cookies.userID;
  var body = req.body['post']['body'];
  
  // insert into Neo4j
  var query = [
    'MATCH (u:User)',
    'WHERE ID(u) = {userID}',
    'CREATE ',
    '(p:Post {newPost}),',
    '(f:Feed {objectName: {objectName}, description: {description} }),',
    '(u)-[:wrote]->(p),',
    '(u)-[:createdActivity]->(f)',
    'RETURN p,u,f'
  ].join('\n');
  var params = {
    userID: Number(userID),
    objectName: "Post",
    description: "Wrote a new post",
    newPost: {
      body: body
    }
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, 
    function(err, postedData){
      if (err) throw err;
    
      console.log(params);
      console.log(userID);
      console.log(body);
      console.log(postedData);
    
      res.status(200).json({postedData: postedData});
  });

});

/* GET /posts/user-posts.json */
router.get('/user-posts.json', function(req, res, next){
  var userID = req.cookies.userID;
  
// MATCH (p:Post), (u:User)
// WHERE (ID(u) = 6)
// AND ((u)-[:wrote]->(p))
// RETURN p
  var query = [
    'MATCH (p:Post), (u:User)',
    'WHERE (ID(u) = {userID})',
    'AND ((u)-[:wrote]->(p))',
    'RETURN p, u'
  ].join('\n');
  var params = {
    userID: Number(userID)
  };
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, function(err, postsData){
    if (err) throw err;
    
    console.log(postsData);
    
    return res.status(200).json({postsData: postsData});
  });

});

module.exports = router;