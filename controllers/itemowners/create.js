'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['409','401', '404']);

module.exports = {
    description: 'Add owner x item relation',
    tags: ['api', 'mod'],
    validate: {
        payload: Schema.itemowner,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        // -------------------- Variables --------------------------------------------- //
        const { username, item_id } = request.payload;
        let item = null;
        let relation = null;
        let user = null;
        const credentials = request.auth.credentials;
        if (credentials.role === 'user') {
            throw Boom.unauthorized('Not permitted use this feature');
        }

        // -------------------- Checks if payload exists in Tables -------------------- //
        // Searches users table by id
        user = await this.db.users.findOne({ username });
        // Searches items table by id
        item = await this.db.items.findOne({ id: item_id });

        /**
         * Checks if user/item exists in their table and throws an error if they do not.
         */
        if (!user) {
            throw Boom.notFound('User does not exist!');
        }
        else if (!item) {
            throw Boom.notFound('Item does not exist!');
        }

        // -------------------- Checks if owner/item relation already exists in table -- //
        // Searches item_owners table for relation of username and item_id
        relation = await this.db.item_owners.findOne({ username, item_id });

        /**
         * Checks if user/item relation exists in table and throws an error if they do.
         * Otherwise, inserts relation into table
         */
        if (relation) {
            throw Boom.conflict(`${username} is already an owner of that item!`);
        }
        else {
            await this.db.item_owners.insert({ username, item_id });
        }

        return reply({ data: request.payload }).code(201);
    },
    response: {
        status: {
            201: {
                data: Schema.itemowner
            }
        }
    },

    plugins: {
        'hapi-swagger': swagger
    }
};
