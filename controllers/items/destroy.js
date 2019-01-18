'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['401', '404', '400', '412']);

module.exports = {
    description: 'Delete item',
    tags: ['api', 'items'],
    validate: {
        params: RequestSchema.idParam,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const item = await this.db.items.findOne({ id: request.params.id });

        // Does item exist?
        if (!item) {
            throw Boom.notFound('Item not found');
        }

        const credentials = request.auth.credentials;

        if (credentials.role === 'user') {
            const item_owners = await this.db.item_owners.validate({ item_id: request.params.id, username: credentials.username });

            if (!item_owners) {
                throw Boom.unauthorized('Not permitted to edit item');
            }
        }

        const listItem = await this.db.list_items.find({ item_id: request.params.id });

        /* if Item on List, cannot delete */
        /* should this change for mods? */
        if (listItem[0]) {
            throw Boom.preconditionFailed('Unable to delete item. Item in a list.');
        }

        const ownerCount = await this.db.item_owners.find({ item_id: request.params.id });

        /* If more than one owner, cannot delete */
        /* Should this change for mods? */
        /* Maybe should offer the option to delete User as Owner */
        if ( ownerCount.length > 1) {
            throw Boom.preconditionFailed('Cannot Delete Item with additional Owner');
        }
        else {
            await this.db.items.destroy({ id: request.params.id });
            return reply(null).code(204);
        }

    },
    response: {
        status: {
            200: Schema.null_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
