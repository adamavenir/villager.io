SELECT count(list_items.id) 
FROM list_items
WHERE list_items.item_id = ${id}
