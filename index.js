var _ = require('lodash')

function replaceChildNodes(dictionary) {
  _.forEach(dictionary, function(value, key) {
    if (_.isPlainObject(value) || _.isArray(value)) {
      return replaceChildNodes(value)
    }
    if (typeof value === 'string' && value.search(/#{([^}]+)}/) !== -1) {
      dictionary[key] = value.replace(/#{([^}]+)}/g, '${$1}')
    }
  })
  return dictionary
}

function replaceOutputNodes(dictionary) {
  _.forEach(dictionary, function(value, key) {
    if (_.isPlainObject(value) || _.isArray(value)) {
      return replaceOutputNodes(value)
    }
    if (typeof value === 'string' && value.search(/#{([^}]+)}/) !== -1) {
      dictionary[key] = value.replace(/#{([^}]+)}/g, '${$1}')
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
    _.forEach(template.Outputs, function(output) {
      replaceOutputNodes(output)
    })
  }
}
module.exports = ServerlessCfVars

