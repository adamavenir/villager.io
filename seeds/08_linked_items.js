'use strict';

exports.seed = function seed(knex, Promise) {

    const tableName = 'linked_items';
    const rows = [
        {
            item_id: 'c22355cb-4eaf-4bda-a066-5b978b9c3cc0',
            linked_item_id: '36908dc7-f097-4d4a-9491-76d3c9336e1e'
        },
        {
            item_id: '33e0bebb-6e75-403f-b55d-b4e47b33638c',
            linked_item_id: '36908dc7-f097-4d4a-9491-76d3c9336e1e'
        },
        {
            item_id: 'a4270fcf-db4e-4eac-b96f-669e96c3f000',
            linked_item_id: '1479e99f-7b35-49c1-ad2d-ed1686c36b4d'
        }

    ];

    return (
        knex(tableName)
            .del()
            .then(() => {

                return (
                    knex.insert( rows )
                        .into( tableName )
                );
            })
    );


};
