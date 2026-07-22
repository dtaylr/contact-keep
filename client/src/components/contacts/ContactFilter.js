import React, { useContext, useRef, useEffect } from 'react';
import ContactContext from '../../context/contact/contactContext';
import { trackEvent } from '../../utils/analytics';

const ContactFilter = () => {
  const contactContext = useContext(ContactContext);
  const text = useRef('');
  const hasTrackedFilter = useRef(false);

  const { filterContacts, clearFilter, filtered } = contactContext;

  useEffect(() => {
    if (filtered === null) {
      text.current.value = '';
    }
  });

  const onChange = e => {
    if (text.current.value !== '') {
      filterContacts(e.target.value);
      if (!hasTrackedFilter.current) {
        trackEvent('contact_filter_used', {
          queryLength: e.target.value.length
        });
        hasTrackedFilter.current = true;
      }
    } else {
      clearFilter();
      hasTrackedFilter.current = false;
    }
  };

  return (
    <form>
      <input
        ref={text}
        data-cy='contact-filter'
        type='text'
        placeholder='Filter Contacts...'
        onChange={onChange}
      />
    </form>
  );
};

export default ContactFilter;
