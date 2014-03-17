var settings = require('./settings')
var wf = require('wavefarm')

module.exports = wf({url: settings.apiUrl})
