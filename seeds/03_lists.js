'use strict';

exports.seed = function seed( knex, Promise ) {

    const tableName = 'lists';

    const rows = [
        {
            id: '1a9d09e7-a27e-414d-9417-01ea01669a59',
            name: 'Nerd clubs',
            owner: 'Robfrikaans',
            description: 'I am very creative'
        },
        {
            id: 'e129cc9e-460e-4e52-9573-92e3ff0007ef',
            name: 'starred',
            owner: 'Randolphin'
        },
        {
            id: 'c06f747f-81cd-4033-8752-d284cd1c1706',
            name: 'starred',
            owner: 'modérateur'
        },
        {
            id: '269fffd8-a550-4871-8af2-db6eda3d6fb4',
            name: 'Best Restaurants',
            owner: 'Robfrikaans'
        },
        {
            id: '8865b22c-a732-4381-9ba6-e9bc32fc9b99',
            name: 'starred',
            owner: 'Robfrikaans'
        }

    ];

    return (
        knex( tableName )
            .del()
            .then(() => {

                return (
                    knex.insert( rows )
                        .into( tableName )
                );
            })
    );
};
