var express = require('express');
var router = express.Router();
var neo4j = require('neo4j');
var neo4jDB = new neo4j.GraphDatabase(process.env.GRAPH_DB_URL);


/* GET home page. */
router.get('/', function(req, res, next) {
  var userID = req.cookies.userID;
  
  var query = [
    'MATCH (websites:Website),',
    '(u:User)-[:createdActivity]->(feedItems:Feed),',
    '(u:User)-[:wrote]->(posts:Post)',
    'WHERE ID(u)={userID}',
    'RETURN websites, posts, feedItems'
  ].join('\n');
  var params = {
    userID: Number(userID)
  }
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, 
    function(err, resultsData){
      if (err) throw err;
    
      return res.render('index', { title: 'JAJA', resultsData: resultsData });
  });
  
});

module.exports = router;
