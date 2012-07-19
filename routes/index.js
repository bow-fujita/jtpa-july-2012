
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
}

