var settings = require('./settings')
var wf = require('wavefarm')

module.exports = wf({
  host: settings.apiHost,
  port: settings.apiPort,
  withCredentials: false
})
