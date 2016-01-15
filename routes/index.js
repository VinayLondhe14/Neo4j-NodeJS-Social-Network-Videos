var express = require('express');
var router = express.Router();
var neo4j = require('neo4j');
var neo4jDB = new neo4j.GraphDatabase(process.env.GRAPH_DB_URL);


/* GET home page. */
router.get('/', function(req, res, next) {
  
  var query = [
    'MATCH (websites:Website)',
    'RETURN websites'
  ].join('\n');
  var params = {}
  
  neo4jDB.cypher({
    query: query,
    params: params
  }, 
    function(err, websites){
      if (err) throw err;
    
      console.log(websites);
      return res.render('index', { title: 'JAJA', websites: websites });
  });
  
});

module.exports = router;
