import React, { useState, useContext, useEffect } from 'react';
import ContactContext from '../../context/contact/contactContext';

const ContactForm = () => {
  const contactContext = useContext(ContactContext);

  const { addContact, updateContact, clearCurrent, current } = contactContext;

  useEffect(() => {
    if (current !== null) {
      setContact(current);
    } else {
      setContact({
        name: '',
        email: '',
        phone: '',
        type: 'personal'
      });
    }
  }, [contactContext, current]);

  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'personal'
  });

  const { name, email, phone, type } = contact;

  const onChange = e =>
    setContact({ ...contact, [e.target.name]: e.target.value });

  const onSubmit = e => {
    e.preventDefault();
    if (current === null) {
      addContact(contact);
    } else {
      updateContact(contact);
    }
    clearAll();
  };

  const clearAll = () => {
    clearCurrent();
  };

  return (
    <section className='panel'>
      <div className='panel-heading'>
        <div>
          <p className='eyebrow'>Contact record</p>
          <h2>{current ? 'Edit Contact' : 'Add Contact'}</h2>
        </div>
      </div>
      <form onSubmit={onSubmit} className='contact-form'>
        <input
          data-cy='contact-name'
          type='text'
          placeholder='Name'
          name='name'
          value={name}
          onChange={onChange}
        />
        <input
          data-cy='contact-email'
          type='email'
          placeholder='Email'
          name='email'
          value={email}
          onChange={onChange}
        />
        <input
          data-cy='contact-phone'
          type='text'
          placeholder='Phone'
          name='phone'
          value={phone}
          onChange={onChange}
        />
        <div className='type-selector' data-cy='contact-type-selector'>
          <label>
            <input
              data-cy='contact-type-personal'
              type='radio'
              name='type'
              value='personal'
              checked={type === 'personal'}
              onChange={onChange}
            />
            Personal
          </label>
          <label>
            <input
              data-cy='contact-type-professional'
              type='radio'
              name='type'
              value='professional'
              checked={type === 'professional'}
              onChange={onChange}
            />
            Professional
          </label>
        </div>
        <div className='form-actions'>
          <input
            data-cy='contact-submit'
            type='submit'
            value={current ? 'Update Contact' : 'Add Contact'}
            className='btn btn-primary btn-block'
          />
          {current && (
            <button
              className='btn btn-light btn-block'
              data-cy='contact-clear'
              onClick={clearAll}
              type='button'
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

export default ContactForm;
