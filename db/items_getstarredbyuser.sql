SELECT
items.id,
items.name,
items.type,
items.location,
items.start_date,
items.end_date
FROM starred_items
JOIN items ON items.id = starred_items.item_id
WHERE starred_items.username = $(username)
