'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['401', '400']);

module.exports = {
    description: 'Merge item',
    tags: ['api', 'admin', 'mod'],
    validate: {
        headers: RequestSchema.tokenRequired,
        payload: RequestSchema.mergeItemsPayload
    },
    handler: async function (request, reply) {

        const credentials = await this.db.users.findOne({ id: request.auth.credentials.id });
        if (credentials.role === 'user') {
            throw Boom.unauthorized('Not permitted use this feature');
        }

        const item_id = request.payload.item_id;

        await this.db.list_items.update({ item_id: item_id[1] },{ item_id: item_id[0] });
        await this.db.item_owners.update({ item_id: item_id[1] },{ item_id: item_id[0] });
        await this.db.item_tags.destroy({ item_id: item_id[1] });
        await this.db.items.destroy({ id: item_id[1] });

        return reply({ message: 'Items Merged' });
    },
    response: {
        status: {
            200: Schema.message_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
