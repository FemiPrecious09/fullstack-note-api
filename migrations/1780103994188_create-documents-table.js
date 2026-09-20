/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
 pgm.createExtension('pgcrypto', {ifNotExists: true})
 pgm.createTable('documents',{
  id: {type: 'uuid', serial: true, primaryKey:true, default: pgm.func('gen_random_uuid()')},
  profile_id: {type: 'uuid', notNull: true, references: 'profile(public_id)', onDelete: 'CASCADE'},
  title: {type:'text', notNull: true},
  original_filename: { type: 'text', notNull: true },
  mime_type: { type: 'text', notNull: true },
  size_bytes: { type: 'bigint', notNull: true },
  storage_key: { type: 'text', notNull: true },
  status: { type: 'text', notNull: true, default: 'pending' },
  created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
 })
 pgm.createIndex('documents', 'profile_id')
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
 pgm.dropTable('documents')
};
