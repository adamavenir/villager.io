'use strict';

const { forEach } = require('p-iteration');
const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['409']);

module.exports = {
    description: 'Add item',
    tags: ['api', 'items'],
    validate: {
        payload: Schema.additem,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const credentials = request.auth.credentials;
        const payload = request.payload;
        const linked_items = payload.linked_items;
        const tags = payload.tags;

        const inTable = await this.db.items.find({ name: payload.name });

        if (inTable[0]) {
            throw Boom.conflict(`Item already exists`);
        }

        if (request.payload.type !== 'event' && (request.payload.start_date || request.payload.end_date)) {
            throw Boom.badRequest('Only event can have start and end dates');
        }

        switch (request.payload.type) {
            case 'event':
                if (!request.payload.start_date) {
                    throw Boom.badRequest('Event must have a start date');
                }

                break;

            case 'place':
                if (request.payload.linked_items) {
                    throw Boom.badRequest('Can\'t link place to other Items');
                }

                break;

            default:
        }

        const returnedItem = await this.db.items.insert(payload);
        await this.db.item_owners.insert({ item_id: returnedItem.id, username: credentials.username });

        if (tags) {
            // remove duplicates and ignore instead of throwing error
            const uniqueTags = [...new Set(tags)];

            await forEach(uniqueTags, async (tag) => {

                const check_tags = await this.db.tags.findOne({ name: tag });
                if (!check_tags) {
                    await this.db.items.destroy({ id: returnedItem.id });
                    throw Boom.badRequest(`Tag ${tag} does not exist`);
                }

                await this.db.item_tags.insert({ item_id: returnedItem.id, tag_name: tag });
            });
        }

        let placeLinked = false;

        if ( linked_items ){
            await forEach(linked_items, async (linkedItem) => {

                const foundItem = await this.db.items.findOne({ id: linkedItem });

                if (!foundItem) {
                    await this.db.items.destroy({ id: returnedItem.id });
                    throw Boom.notFound('Attempting to link item that does not exist');
                }

                if (foundItem.type === 'place') {
                    placeLinked = true;
                }

                if (request.payload.type === 'activity') {
                    //error checking
                    if (foundItem.type !== 'place') {
                        await this.db.items.destroy({ id: returnedItem.id });
                        throw Boom.badRequest('Can\'t link activity to anything but Place');
                    }
                }

                if (request.payload.type === 'group') {
                    //error checking
                    if (foundItem.type !== 'place') {
                        await this.db.items.destroy({ id: returnedItem.id });
                        throw Boom.badRequest('Can\'t link group to anything but Place');
                    }
                }

                if (request.payload.type === 'event') {
                    //error checking
                    if (foundItem.type === 'event' | foundItem.type === 'activity') {
                        await this.db.items.destroy({ id: returnedItem.id });
                        throw Boom.badRequest('Can\'t link Event to Item type');
                    }
                }
            }
            );

            if (request.payload.type === 'event') {
                //error checking
                if (!placeLinked) {
                    await this.db.items.destroy({ id: returnedItem.id });
                    throw Boom.badRequest('Event required to be linked to Place');
                }
            }

            const uniqueLinks = [...new Set(linked_items)];

            await forEach(uniqueLinks, async (item) => {

                await this.db.linked_items.insert({ item_id: returnedItem.id, linked_item_id: item.id });
            });

            returnedItem.linked_items = linked_items;
        }

        return reply({ data: returnedItem }).code(201);
    },

    response: {
        status: {
            201: Schema.item_response
        }
    },

    plugins: {
        'hapi-swagger': swagger
    }
};
