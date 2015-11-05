var express = require('express');
var router = express.Router();

var Archive = require('../slack-archive');

var slack = new Archive('/Users/dan/Documents/pcs-docs/Slack-archives');

/* GET home page. */
router.get('/:user', function(req, res, next) {

  slack.search({username:req.params.user},function(posts,mentions) {
    console.log('post count: ',posts.length);
    console.log('mention count: ',mentions.length);
//    console.log('length: ',result.length);
    var result = posts.concat(mentions);
    res.render('d3-demo', { data: result.join(',') });
  })
});



module.exports = router;
