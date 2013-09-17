var api = require('../api')
var fs = require('fs')

function defaultValidator (value) {
  return true;
}

var validatorMap = {
};

function defaultSave (item, field, value) {
  item[field] = String(value);
}

// TODO Handle complex field types
var saveMap = {
  'boolean': function (item, field, value) {
    item[field] = !!value;
  }
};

module.exports = function (req, res, next, id) {
  var item = JSON.parse(req.parsedBody.raw);
  var schema = req.schemas[item.type];
  //console.log(req.parsedBody)
  schema.item.forEach(function (fieldName) {
    var field = schema.fields[fieldName];
    var validator = validatorMap[field.type] || defaultValidator;
    var save = saveMap[field.type] || defaultSave;
    var value = req.parsedBody[fieldName];
    if (validator(value)) {
      save(item, fieldName, value);
      if (schema.main === fieldName) save(item, 'main', value);
    } else {
      // Render the form and display error
    }
  });
  console.log(item)
  //return res.end()
  api.put(id, item, function (err, apiRes, newItem) {
    if (err) return next(err)
    res.statusCode = 303
    res.setHeader('location', '/' + id)
    res.end()
  })
}
