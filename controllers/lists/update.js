'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['400','401']);

module.exports = {
    description: 'Add list',
    tags: ['api', 'lists'],
    validate: {
        payload: RequestSchema.listPayload,
        params: RequestSchema.idParam
    },
    handler: async function (request, reply) {

        const credentials = request.auth.credentials;
        if (credentials.role !== 'admin' || credentials.role !== 'mod') {
            const foundlist = await this.db.lists.findOne({ id: request.params.id });
            if (foundlist.owner !== credentials.username) {
                throw Boom.unauthorized('Not permitted to edit item');
            }
        }

        const list = request.payload;
        list.owner = credentials.username;

        await this.db.lists.updateOne({ id: request.params.id }, list);

        const returnlist = await this.db.lists.byid({ id: request.params.id });

        return reply({ data: returnlist });
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
