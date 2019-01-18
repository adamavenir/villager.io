'use strict';

const Joi = require('joi');

exports.tokenRequired = Joi.object(
    { 'authorization': Joi.string().required() }
).unknown();

exports.mergeItemsPayload = Joi.object(
    { 'item_id': Joi.array().items(Joi.string().guid()) }
);

exports.updateRolePayload = {
    role: Joi.any().valid('mod', 'user', 'admin')
};

exports.usernameParam = {
    username: Joi.string().required()
};

exports.idParam = {
    id: Joi.string().guid().required()
};

exports.daysParam = {
    days: Joi.number().required()
};

exports.tagParam = Joi.object({
    name: Joi.string().required()
});

exports.itemsQuery = Joi.object({
    type: Joi.string().example('event'),
    name: Joi.string().example('Diner')
});

exports.authPayload = {
    username: Joi.string().required(),
    password: Joi.string().required()
};

exports.listItemPayload = {
    item_id: Joi.string().guid().required(),
    list_id: Joi.string().guid().required()
};

exports.listPayload = {
    name: Joi.string().required(),
    description: Joi.string()
};

exports.tagPayload = Joi.object({
    name: Joi.string().required()
});

exports.userPayload = {
    name: Joi.string().optional().example('totally not a robot').allow(null),
    username: Joi.string().required().example('seriously'),
    email: Joi.string().required().example('real@email'),
    bio: Joi.string().optional().example('I am a real person').allow(null),
    password: Joi.string().required().example('password')
};

exports.userUpdatePayload = Joi.object({
    name: Joi.string().optional().example('totally not a robot').allow(null),
    username: Joi.string().optional().example('seriously'),
    email: Joi.string().optional().example('real@email'),
    bio: Joi.string().optional().example('I am a real person').allow(null),
    password: Joi.string().disallow(Joi.ref('oldPassword')).example('password'),
    oldPassword: Joi.string().optional().example('password')
}).with('password', 'oldPassword').or('name', 'username', 'email', 'bio', 'password');

exports.starredItemPayload = {
    item_id: Joi.string().guid().required()
};
