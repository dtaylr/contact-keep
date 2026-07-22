import React, { useState } from 'react';
import axios from 'axios';
import { trackEvent } from '../../utils/analytics';

const SAMPLE_CONTACTS = [
  {
    name: 'Grace Hopper',
    email: 'grace@example.com',
    phone: '555-0101',
    type: 'professional'
  },
  {
    name: '',
    email: 'missing-name@example.com',
    type: 'personal'
  },
  {
    name: 'Duplicate Email',
    email: 'grace@example.com',
    type: 'professional'
  }
];

const ContactImportDryRun = () => {
  const [payload, setPayload] = useState(
    JSON.stringify(SAMPLE_CONTACTS, null, 2)
  );
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadSample = () => {
    setPayload(JSON.stringify(SAMPLE_CONTACTS, null, 2));
    setReport(null);
    setError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setReport(null);

    let contacts;
    try {
      contacts = JSON.parse(payload);
    } catch (err) {
      setError('Import data must be valid JSON.');
      return;
    }

    if (!Array.isArray(contacts)) {
      setError('Import data must be a JSON array.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/contacts/import/dry-run', {
        contacts
      });
      setReport(res.data);
      trackEvent('contact_import_dry_run_completed', {
        totalRows: res.data.summary.totalRows,
        validRows: res.data.summary.validRows,
        invalidRows: res.data.summary.invalidRows,
        duplicateRows: res.data.summary.duplicateRows
      });
    } catch (err) {
      setError(
        err.response && err.response.data
          ? err.response.data.msg || 'Import dry run failed.'
          : 'Import dry run failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='import-panel my-2'>
      <h2 className='text-primary'>Import Dry Run</h2>
      <form onSubmit={onSubmit}>
        <textarea
          data-cy='import-payload'
          name='import-payload'
          value={payload}
          onChange={e => setPayload(e.target.value)}
          rows='10'
        />
        <div className='import-actions'>
          <input
            data-cy='import-submit'
            type='submit'
            value={loading ? 'Validating...' : 'Validate Import'}
            className='btn btn-primary'
            disabled={loading}
          />
          <button
            data-cy='import-sample'
            type='button'
            className='btn btn-light'
            onClick={loadSample}
          >
            Sample
          </button>
        </div>
      </form>

      {error && (
        <div data-cy='import-error' className='alert alert-danger'>
          {error}
        </div>
      )}

      {report && (
        <div data-cy='import-report' className='import-report'>
          <div className='import-summary'>
            <span data-cy='import-total'>Total {report.summary.totalRows}</span>
            <span data-cy='import-valid'>Valid {report.summary.validRows}</span>
            <span data-cy='import-invalid'>
              Invalid {report.summary.invalidRows}
            </span>
            <span data-cy='import-duplicates'>
              Duplicates {report.summary.duplicateRows}
            </span>
          </div>

          {report.missingRequiredFields.length > 0 && (
            <div data-cy='import-missing-fields'>
              <h4>Missing Required Fields</h4>
              <ul className='list'>
                {report.missingRequiredFields.map(item => (
                  <li key={`missing-${item.rowNumber}`}>
                    Row {item.rowNumber}: {item.fields.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.duplicates.length > 0 && (
            <div data-cy='import-duplicate-list'>
              <h4>Duplicates</h4>
              <ul className='list'>
                {report.duplicates.map(item => (
                  <li key={`${item.source}-${item.rowNumber}`}>
                    Row {item.rowNumber}: {item.email} ({item.source})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.invalidRows.length > 0 && (
            <div data-cy='import-invalid-list'>
              <h4>Invalid Rows</h4>
              <ul className='list'>
                {report.invalidRows.map(item => (
                  <li key={`invalid-${item.rowNumber}`}>
                    Row {item.rowNumber}: {item.errors.join('; ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ContactImportDryRun;
