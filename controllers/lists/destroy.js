'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['400', '401', '404']);

module.exports = {
    description: 'Delete list',
    tags: ['api', 'lists'],
    validate: {
        params: RequestSchema.idParam,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const credentials = request.auth.credentials;
        const list = await this.db.lists.findOne({ id: request.params.id });

        if (!list) {
            throw Boom.notFound('List was not found.');
        }

        if (credentials.username !== list.owner && credentials.role !== 'admin') {
            throw Boom.unauthorized('Unauthorized to delete list.');
        }

        list.items = await this.db.list_items.by_list_id({ id: list.id });

        await this.db.lists.destroy({ id: list.id });

        return reply(null).code(204);
    },
    response: {
        status: {
            204: Schema.null_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
