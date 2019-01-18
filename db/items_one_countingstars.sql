SELECT count(starred_items.id) 
FROM starred_items
WHERE 
starred_items.item_id = ${id}