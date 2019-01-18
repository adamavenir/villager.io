'use strict';
// knex cli looks to this file

const Config = require('getconfig');

module.exports = Config.db;

if (Config.getconfig.env !== 'production') {
    module.exports[Config.getconfig.env] = Config.db;
}
