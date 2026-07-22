const VALID_TYPES = ['personal', 'professional'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMPORT_ROWS = 100;

const normalizeEmail = email =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const normalizeRow = row => ({
  name: typeof row.name === 'string' ? row.name.trim() : '',
  email: normalizeEmail(row.email),
  phone: typeof row.phone === 'string' ? row.phone.trim() : '',
  type: typeof row.type === 'string' && row.type.trim() ? row.type.trim() : 'personal'
});

const buildMissingRequiredFields = row => {
  const missing = [];
  if (!row.name) missing.push('name');
  if (!row.email) missing.push('email');
  return missing;
};

const validateImportRows = (rows, existingContacts = []) => {
  const existingEmails = new Set(existingContacts.map(contact => normalizeEmail(contact.email)));
  const seenImportEmails = new Set();
  const duplicateEmails = new Set();

  const result = {
    validRows: [],
    invalidRows: [],
    duplicates: [],
    missingRequiredFields: [],
    summary: {
      totalRows: rows.length,
      validRows: 0,
      invalidRows: 0,
      duplicateRows: 0,
      missingRequiredRows: 0
    }
  };

  rows.forEach((rawRow, index) => {
    const rowNumber = index + 1;
    const row = normalizeRow(rawRow || {});
    const errors = [];
    const missingFields = buildMissingRequiredFields(row);

    if (missingFields.length) {
      errors.push(`Missing required field: ${missingFields.join(', ')}`);
      result.missingRequiredFields.push({
        rowNumber,
        fields: missingFields
      });
    }

    if (row.email && !EMAIL_PATTERN.test(row.email)) {
      errors.push('Email must be valid');
    }

    if (!VALID_TYPES.includes(row.type)) {
      errors.push('Type must be personal or professional');
    }

    if (row.email && existingEmails.has(row.email)) {
      errors.push('Duplicate email already exists');
      duplicateEmails.add(row.email);
      result.duplicates.push({
        rowNumber,
        email: row.email,
        source: 'existing-contact'
      });
    }

    if (row.email && seenImportEmails.has(row.email)) {
      errors.push('Duplicate email in import file');
      duplicateEmails.add(row.email);
      result.duplicates.push({
        rowNumber,
        email: row.email,
        source: 'import-file'
      });
    }

    if (row.email) {
      seenImportEmails.add(row.email);
    }

    if (errors.length) {
      result.invalidRows.push({
        rowNumber,
        row,
        errors
      });
      return;
    }

    result.validRows.push({
      rowNumber,
      row
    });
  });

  result.summary.validRows = result.validRows.length;
  result.summary.invalidRows = result.invalidRows.length;
  result.summary.duplicateRows = result.duplicates.length;
  result.summary.missingRequiredRows = result.missingRequiredFields.length;
  result.summary.uniqueDuplicateEmails = duplicateEmails.size;

  return result;
};

module.exports = {
  MAX_IMPORT_ROWS,
  validateImportRows
};
