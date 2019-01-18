'use strict';

const Schema = require('../../lib/responseSchema');

const swagger = Schema.generate([]);

module.exports = {
    description: 'list tags',
    tags: ['api', 'tags'],
    auth: false,
    handler: async function (request, reply) {

        const listTags = await this.db.tags.find();

        return reply({ data: listTags });
    },
    response: {
        status: {
            200: Schema.tags_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
