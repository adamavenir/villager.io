'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['404','401']);

module.exports = {
    description: 'Returns all owners of an item',
    tags: ['api', 'mod'],
    validate: {
        headers: RequestSchema.tokenRequired,
        params: RequestSchema.idParam
    },
    handler: async function (request, reply) {

        const { id } = request.params;
        const relation = await this.db.item_owners.find({ item_id: id },['username']);
        const credentials = request.auth.credentials;
        if (credentials.role === 'user') {
            throw Boom.unauthorized('Not permitted use this feature');
        }

        if (!relation[0]) {
            throw Boom.notFound();
        }

        return reply({ data: relation });
    },
    response: {
        status: {
            200: Schema.usernames_reponse
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
