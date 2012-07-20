
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

exports.mytemplate = function(req, res){
  res.render('mytemplate', {
      title: 'My Template'
    , param1: req.params.p
    , param2: 'hard coded'
  });
};

exports.jsonapi = function(req, res){
  var json = {
      name: 'obama'
    , job: 'president'
    , salary: req.query.salary || 'unknown'
  };
  res.send(json);
};


exports.set_session = function(req, res){
  req.session.value = req.params.value;
  res.send('value = '+req.params.value);
};

exports.get_session = function(req, res){
  res.send('session.value = '+req.session.value);
};


var mysql = require('mysql').createClient();
mysql.host = 'us-cdbr-east.cleardb.com';
mysql.user = 'xxxxxxxxxxxxxx';
mysql.password = 'xxxxxxxx';
mysql.database = 'heroku_xxxxxxxxxxxxxxx'

exports.db_select = function(req, res){
  mysql.query('SELECT * FROM table1 WHERE id = ?', [req.params.id],
    function(err, result, fields) {
      if(err) {
        res.send(500);
        throw err;
      }

      if(result.length) {
        var content = []
          , record = result.shift();

        content.push('id: '+record.id);
        content.push('name: '+record.name);
        content.push('age: '+record.age);
        res.send(content.join('<br />'));
      }
      else {
        res.send(404);
      }
    }
  );
};

