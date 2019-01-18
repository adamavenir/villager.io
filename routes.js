'use strict';

const Controllers = require('keyfob').load({ path: './controllers', fn: require });

module.exports = [
    //admin
    { method: 'PUT', path: '/{username}/role', config: Controllers.admin.updaterole },
    { method: 'GET', path: '/users', config: Controllers.admin.listusers }, //for testing

    //Authentication
    { method: 'POST', path: '/login', config: Controllers.auth.login },
    { method: 'GET', path: '/logout', config: Controllers.auth.logout },

    //mod
    { method: 'PUT', path: '/merge', config: Controllers.admin.mergeitems },

    //tags
    { method: 'GET', path: '/tags', config: Controllers.tags.list },
    { method: 'POST', path: '/tags', config: Controllers.tags.create },
    { method: 'DELETE', path: '/tags', config: Controllers.tags.destroy },
    { method: 'PUT', path: '/tags/{name}', config: Controllers.tags.update },

    //items
    { method: 'GET', path: '/items', config: Controllers.items.list },
    { method: 'GET', path: '/items/days/{days}', config: Controllers.items.getbydate },
    { method: 'GET', path: '/items/{id}', config: Controllers.items.get },
    { method: 'GET', path: '/items/tags/{name}', config: Controllers.items.listbytag },
    { method: 'POST', path: '/items', config: Controllers.items.create },
    { method: 'PUT', path: '/items/{id}', config: Controllers.items.update },
    { method: 'DELETE', path: '/items/{id}', config: Controllers.items.destroy },

    //item_owners
    { method: 'GET', path: '/item_owners/{id}', config: Controllers.itemowners.list },
    { method: 'POST', path: '/item_owners', config: Controllers.itemowners.create },
    { method: 'DELETE', path: '/item_owners', config: Controllers.itemowners.destroy },

    //users
    { method: 'POST', path: '/users', config: Controllers.users.create },
    { method: 'GET', path: '/users/profile', config: Controllers.users.get_profile },
    { method: 'GET', path: '/users/{username}', config: Controllers.users.get },
    { method: 'GET', path: '/users/{username}/lists', config: Controllers.users.get_lists },
    { method: 'GET', path: '/users/{username}/starred', config: Controllers.users.get_starred_items },
    { method: 'PUT', path: '/users/{username}', config: Controllers.users.update },
    { method: 'DELETE', path: '/users/{username}', config: Controllers.users.destroy },

    //lists
    { method: 'GET', path: '/lists/{id}', config: Controllers.lists.get },
    { method: 'GET', path: '/lists', config: Controllers.lists.list },
    { method: 'POST', path: '/lists', config: Controllers.lists.create },
    { method: 'PUT', path: '/lists/{id}', config: Controllers.lists.update },
    { method: 'DELETE', path: '/lists/{id}', config: Controllers.lists.destroy },

    //list items
    { method: 'POST', path: '/lists/listitems', config: Controllers.listitems.create },
    { method: 'DELETE', path: '/lists/listitems', config: Controllers.listitems.destroy },

    //starred_items
    { method: 'POST', path: '/starred_items', config: Controllers.starreditems.create },
    { method: 'DELETE', path: '/starred_items', config: Controllers.starreditems.destroy }

];
