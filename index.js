var _ = require('lodash')

function replaceChildNodes(dictionary) {
  _.forEach(dictionary, function(value, key) {
    if (_.isPlainObject(value) || _.isArray(value)) {
      return replaceChildNodes(value)
    }
    if (typeof value === 'string' && value.search(/#{([^}]+)}/) !== -1) {
      dictionary[key] = {
        'Fn::Sub': value.replace(/#{([^}]+)}/g, '${$1}')
      }
    }
  })
  return dictionary
}

class ServerlessCfVars {
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.hooks = {
      'aws:package:finalize:mergeCustomProviderResources': this.addVars.bind(this)
    }
  }

  addVars() {
    var template = this.serverless.service.provider.compiledCloudFormationTemplate
    _.forEach(template.Resources, function(resource) {
      replaceChildNodes(resource.Properties)
    })
  }
}
module.exports = ServerlessCfVars

