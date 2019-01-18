SELECT
    items.*, 
    array_agg(item_tags.tag_name) AS tags
FROM
    items
LEFT JOIN
    item_tags
ON
    items.id = item_tags.item_id
WHERE
    (${item_type} IS NULL OR items.type = ${item_type})
    AND
    (${item_name} IS NULL OR items.name ILIKE ${item_name})
GROUP BY
    items.id
