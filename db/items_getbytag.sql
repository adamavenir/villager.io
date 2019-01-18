SELECT 
items.id,
items.name,
items.type,
items.location,
items.start_date,
items.end_date
FROM
item_tags
JOIN items ON items.id = item_tags.item_id
WHERE 
item_tags.tag_name = $(name)