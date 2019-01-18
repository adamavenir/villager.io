'use strict';

const Schema = require('../../lib/responseSchema');

const swagger = Schema.generate([]);

module.exports = {
    description: 'Returns all lists',
    tags: ['api', 'lists', 'public'],
    auth: false,
    handler: async function (request, reply) {

        const foundlists = await this.db.lists.getall();

        return reply({ data: foundlists });
    },
    response: {
        status: {
            200: Schema.lists_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
