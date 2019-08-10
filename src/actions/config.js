const { config } = require('../config');

function handleConfig(configName, configValue) {
    if (configName) {
        if (configValue) {
            config.setGlobal(configName, configValue);
        }
        console.log(config.get(configName));
    } else {
        console.log(config.readGlobalConfig());
    }
}

module.exports = {
    handleConfig
}