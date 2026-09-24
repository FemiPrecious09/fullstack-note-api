exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('documents', {
    extracted_text: { type: 'text' },
    summary: { type: 'text' },
    tags: { type: 'text[]' },
    extraction_error: { type: 'text' },
  })
};

exports.down = (pgm) => {
  pgm.dropColumns('documents', ['extracted_text', 'summary', 'tags', 'extraction_error'])
};