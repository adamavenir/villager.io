'use strict';

const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate([]);

module.exports = {
    description: 'Returns all items by tag',
    tags: ['api', 'items','public'],
    auth: false,
    validate: {
        params: RequestSchema.tagParam
    },
    handler: async function (request, reply) {

        const name = request.params.name;
        const founditems = await this.db.items.getbytag({ name });

        return reply({ data: founditems });
    },
    response: {
        status: {
            200: Schema.simple_items_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
