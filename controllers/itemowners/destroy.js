'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['404','401']);

module.exports = {
    description: 'Deletes owner/item relation from table',
    tags: ['api', 'mod'],
    validate: {
        payload: Schema.itemowner,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        // -------------------- Variables --------------------------------------------- //
        const { item_id, username } = request.payload;
        const credentials = request.auth.credentials;
        if (credentials.role === 'user') {
            throw Boom.unauthorized('Not permitted use this feature');
        }
        // -------------------- Checks if relation exists in Tables ------------------- //

        const relation = await this.db.item_owners.findOne({ username, item_id });

        /**
         * If relation does not exist, throw an error.
         * Else, remove relation from the table and output a message.
         */
        if (!relation) {
            throw Boom.notFound();
        }
        else {
            await this.db.item_owners.destroy({ username, item_id });
            return reply(null).code(204);
        }
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
