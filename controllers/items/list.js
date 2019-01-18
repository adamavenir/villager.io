'use strict';

const { forEach } = require('p-iteration');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate([]);

module.exports = {
    description: 'Returns all items',
    tags: ['api', 'items', 'public'],
    auth: false,
    validate: {
        query: RequestSchema.itemsQuery
    },
    handler: async function (request, reply) {

        const query = {
            item_type: request.query.type,
            item_name: request.query.name
        };
        const founditems = await this.db.items.getall(query);

        await forEach(founditems, async (item) => {

            const links = await this.db.linked_items.getlinks({ id: item.id },['name']);
            item.linked_items = links.linked_item;
        });
        /* Add pagination */
        return reply({ data: founditems });
    },
    response: {
        status: {
            200: Schema.items_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
