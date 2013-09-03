var api = require('../api')
var hyperglue = require('hyperglue')
var fs = require('fs')

module.exports = function (req, res, next, id) {
  api.get(id, function (err, apiRes, item) {
    if (err) return next(err)
    if (apiRes.statusCode == 404) return next()
    // TODO handle unknown type
    var schema = req.schemas[item.type]
    var inputMap = {
      'boolean': function (name, value) {
        var data = {id: name + 'Input'}
        if (value) data.checked = 'checked'
        return hyperglue('<input type="checkbox">', {input: data})
      },
      'date': function (name, value) {
        return hyperglue('<input type="date">', {
          input: {
            id: name + 'Input',
            value: value
          }
        })
      },
      'text': function (name, value) {
        return hyperglue('<textarea></textarea>', {
          textarea: {
            id: name + 'Input',
            _text: value
          }
        })
      }
    }
    res.render('item.html', {
      title: item.main,
      '.item-name': item.main,
      '.raw': JSON.stringify(item, null, 2),
      '.field': schema.fields.map(function (field) {
        var renderInput = inputMap[field.type] || function (name, value) {
          return hyperglue('<input type="text">', {
            input: {
              id: name + 'Input',
              value: value
            }
          })
        }
        return {
          label: {
            'for': field.name + 'Input',
            _text: field.name
          },
          '.input': {
            _html: renderInput(field.name, item[field.name]).innerHTML
          }
        }
      })
    })
  })
}
