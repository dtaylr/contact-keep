import React, { useContext, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ContactItem from './ContactItem';
import Spinner from '../layout/Spinner';
import ContactContext from '../../context/contact/contactContext';

const Contacts = () => {
  const contactContext = useContext(ContactContext);

  const { contacts, filtered, getContacts, loading } = contactContext;
  const visibleContacts = filtered !== null ? filtered : contacts;

  useEffect(() => {
    getContacts();
    // eslint-disable-next-line
  }, []);

  if (contacts !== null && contacts.length === 0 && !loading) {
    return (
      <div className='empty-state' data-cy='empty-contact-state'>
        <i className='fas fa-address-book' />
        <h3>Please add a contact</h3>
        <p>Your private directory will appear here as records are added.</p>
      </div>
    );
  }

  return (
    <div>
      {contacts !== null && !loading ? (
        <TransitionGroup data-cy='contact-list' className='contact-list'>
          {visibleContacts.map(contact => (
            <CSSTransition key={contact._id} timeout={500} classNames='item'>
              <ContactItem contact={contact} />
            </CSSTransition>
          ))}
        </TransitionGroup>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Contacts;
