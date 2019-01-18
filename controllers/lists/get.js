'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['404']);

module.exports = {
    description: 'Returns items in list by id',
    tags: ['api', 'lists', 'public'],
    validate: {
        params: RequestSchema.idParam
    },
    auth: false,
    handler: async function (request, reply) {

        const list = await this.db.lists.findOne({ id: request.params.id });

        if (!list) {
            throw Boom.notFound('List was not found.');
        }
        else {
            list.items = await this.db.list_items.by_list_id({ id: list.id });
        }

        return reply({ data: list });
    },
    response: {
        status: {
            200: Schema.list_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
