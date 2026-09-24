exports.up = (pgm) => {
  pgm.addConstraint('note', 'note_profile_title_unique', 'UNIQUE(profile_id, title)');
  pgm.addConstraint('documents', 'documents_profile_title_unique', 'UNIQUE(profile_id, title)');
};

exports.down = (pgm) => {
  pgm.dropConstraint('note', 'note_profile_title_unique');
  pgm.dropConstraint('documents', 'documents_profile_title_unique');
};