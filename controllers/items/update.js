'use strict';

const { forEach } = require('p-iteration');
const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['401', '404', '400', '409']);

module.exports = {
    description: 'Update item',
    tags: ['api', 'items'],
    validate: {
        params: RequestSchema.idParam,
        payload: Schema.updateitem,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const item = await this.db.items.findOne({ id: request.params.id });

        if (!item) {
            throw Boom.notFound('Item not found');
        }

        const tags = request.payload.tags;
        const linked_items = request.payload.linked_items;

        const credentials = request.auth.credentials;
        const temp = request.payload;

        if (credentials.role === 'user') {
            const item_owners = await this.db.item_owners.validate({ item_id: request.params.id, username: credentials.username });
            if (!item_owners) {
                throw Boom.unauthorized('Not permitted to edit item');
            }
        }

        if (temp.location) {
            item.location = temp.location;
        }

        if (temp.start_date) {
            item.start_date = temp.start_date;
        }

        if (temp.end_date) {
            item.end_date = temp.end_date;
        }

        if (temp.type){
            item.type = temp.type;
        }

        if (temp.name) {
            item.name = temp.name;

            const inTable = await this.db.items.find({ name: temp.name, id: { $ne: request.params.id } });

            if (inTable[0]) {
                throw Boom.conflict(`Item already exists with name.`);
            }
        }

        switch (item.type) {
            case 'event':
                if (!item.start_date) {
                    throw Boom.badRequest('Event must have a start date');
                }

                break;
            case 'place':
            case 'group':
            case 'activity':
                if (item.start_date || item.end_date) {
                    throw Boom.badRequest('Only event can have start and end dates');
                }

                break;
            default:
                // throw Boom.badRequest('Item must be "event", "place", "activity", or "group"');
                // break;
        }

        let placeLinked = false;

        if (linked_items) {
            await forEach(linked_items, async (linkedItem) => {

                const foundItem = await this.db.items.findOne({ id: linkedItem });

                if (!foundItem) {
                    throw Boom.notFound('Attempting to link item that does not exist');
                }

                if (foundItem.type === 'place') {
                    placeLinked = true;
                }

                if (item.type === 'place') {
                //error checking
                    throw Boom.badRequest('Can\'t link place to other Items');
                }

                if (item.type === 'activity') {
                //error checking
                    if (foundItem.type !== 'place') {
                        throw Boom.badRequest('Can\'t link activity to anything but Place');
                    }
                }

                if (item.type === 'group') {
                //error checking
                    if (foundItem.type !== 'place') {
                        throw Boom.badRequest('Can\'t link group to anything but Place');
                    }
                }

                if (item.type === 'event') {
                    //error checking
                    if (foundItem.type === 'event' | foundItem.type === 'activity') {
                        throw Boom.badRequest('Can\'t link Event to Item type');
                    }
                }
            }
            );

            if (item.type === 'event') {
                //error checking
                if (!placeLinked) {
                    throw Boom.badRequest('No place linked to event');
                }
            }

        }

        await this.db.items.updateOne({ id: request.params.id }, item);

        const returnedItem = await this.db.items.byid({ id: request.params.id });

        if (tags) {
            // remove duplicates and ignore instead of throwing error
            const uniqueTags = [...new Set(tags)];

            await this.db.item_tags.destroy({ item_id: returnedItem.id });

            await forEach(uniqueTags, async (tag) => {

                const check_tags = await this.db.tags.findOne({ name: tag });
                if (!check_tags) {
                    throw Boom.badRequest(`Tag ${tag} does not exist`);
                }

                await this.db.item_tags.insert({ item_id: returnedItem.id, tag_name: tag });
            });
        }

        if (linked_items) {
            // remove duplicates and ignore instead of throwing error
            const uniqueLinks = [...new Set(linked_items)];

            await this.db.linked_items.destroy({ item_id: returnedItem.id });

            await forEach(uniqueLinks, async (link_item) => {

                await this.db.linked_items.insert({ item_id: returnedItem.id, linked_item_id: link_item });
            });
        }

        const returned_links = await this.db.linked_items.getlinks({ id: returnedItem.id });
        const returned_tags = await this.db.tags.gettags({ id: returnedItem.id });
        returnedItem.linked_items = returned_links.linked_items;
        returnedItem.tags = returned_tags.tags;
        return reply({ data: returnedItem });
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
