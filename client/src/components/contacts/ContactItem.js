import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ContactContext from '../../context/contact/contactContext';

const ContactItem = ({ contact }) => {
  const contactContext = useContext(ContactContext);
  const { deleteContact, setCurrent, clearCurrent } = contactContext;

  const { _id, name, email, phone, type } = contact;

  const onDelete = () => {
    deleteContact(_id);
    clearCurrent();
  };
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <article className='contact-card' data-cy='contact-item'>
      <div className='contact-card-header'>
        <div>
          <h3 data-cy={`contact-name-${_id}`}>{name}</h3>
          <span
            data-cy={`contact-type-${_id}`}
            className={
              'badge ' +
              (type === 'professional' ? 'badge-success' : 'badge-primary')
            }
          >
            {formattedType}
          </span>
        </div>
      </div>
      <ul className='contact-meta'>
        {email && (
          <li data-cy={`contact-email-${_id}`}>
            <i className='fas fa-envelope-open' /> <span>{email}</span>
          </li>
        )}
        {phone && (
          <li data-cy={`contact-phone-${_id}`}>
            <i className='fas fa-phone' /> <span>{phone}</span>
          </li>
        )}
      </ul>
      <div className='contact-actions'>
        <button
          className='btn btn-dark btn-sm'
          data-cy={`edit-contact-${_id}`}
          onClick={() => setCurrent(contact)}
        >
          Edit
        </button>
        <button
          className='btn btn-danger btn-sm'
          data-cy={`delete-contact-${_id}`}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </article>
  );
};

ContactItem.propTypes = {
  contact: PropTypes.object.isRequired
};

export default ContactItem;
