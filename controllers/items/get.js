'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['404']);

module.exports = {
    description: 'Returns item by id',
    tags: ['api', 'items' ,'public'],
    auth: false,
    validate: {
        params: RequestSchema.idParam
    },
    handler: async function (request, reply) {

        const foundItem = await this.db.items.byid({ id: request.params.id });

        if (!foundItem) {
            throw Boom.notFound();
        }

        const starsCount = await this.db.items.countingstars({ id: foundItem.id });
        const listCount = await this.db.items.countinglists({ id: foundItem.id });

        foundItem.starred_number = Number(starsCount.count);
        foundItem.list_number = Number(listCount.count);

        const links = await this.db.linked_items.getlinks({ id: foundItem.id },['name']);
        foundItem.linked_items = links.linked_item;

        return reply({ data: foundItem });
    },
    response: {
        status: {
            200: Schema.item_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
