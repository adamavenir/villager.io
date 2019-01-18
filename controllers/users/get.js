'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['404']);

module.exports = {
    description: 'Returns a user by username',
    tags: ['api', 'users', 'public'],
    auth: false,
    validate: {
        params: RequestSchema.usernameParam
    },
    handler: async function (request, reply) {

        const user = await this.db.users.get_public_by_username({ username: request.params.username });
        const user_id = await this.db.users.findOne({ username: request.params.username },['id']);
        if (!user) {
            throw Boom.notFound();
        }

        const favorite_list = await this.db.list_items.by_list_id({ id: user_id.id });
        return reply({ data: { user, favorite_list } });
    },
    response: {
        status: {
            200: Schema.get_user_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
