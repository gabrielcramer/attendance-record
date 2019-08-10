const Config = require('gitlike-config');
const { appName } = require('./statics');

const config = new Config({
    name: appName
});

module.exports = {
    config
}