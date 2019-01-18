SELECT 
lists.id,
lists.name,
lists.description,
array_agg(list_items.item_id) as items
FROM lists
LEFT JOIN list_items ON lists.id = list_items.list_id
WHERE lists.owner = $(owner)
GROUP BY lists.id