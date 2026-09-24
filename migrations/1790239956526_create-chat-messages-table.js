exports.up = (pgm) => {
  pgm.createTable('chat_message', {
    id: 'id',
    resource_type: { type: 'text', notNull: true },
    resource_id: { type: 'text', notNull: true },
    role: { type: 'text', notNull: true },
    content: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('chat_message', ['resource_type', 'resource_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('chat_message');
};