SELECT lists.*, array_to_json(ARRAY_AGG(items.*)) AS items
FROM lists
LEFT JOIN list_items
  ON lists.id = list_items.list_id
LEFT JOIN items
  ON list_items.item_id = items.id
GROUP BY lists.id