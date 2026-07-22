import React, { useContext } from 'react';
import ContactContext from '../../context/contact/contactContext';

const ContactInsights = () => {
  const contactContext = useContext(ContactContext);
  const contacts = contactContext.contacts || [];
  const totalContacts = contacts.length;
  const professionalContacts = contacts.filter(
    contact => contact.type === 'professional'
  ).length;
  const personalContacts = contacts.filter(
    contact => contact.type === 'personal'
  ).length;
  const contactsWithEmail = contacts.filter(contact => contact.email).length;

  const insights = [
    {
      label: 'Total Contacts',
      value: totalContacts,
      helper: totalContacts === 1 ? 'active record' : 'active records',
      testId: 'insight-total'
    },
    {
      label: 'Professional',
      value: professionalContacts,
      helper: 'work relationships',
      testId: 'insight-professional'
    },
    {
      label: 'Personal',
      value: personalContacts,
      helper: 'personal relationships',
      testId: 'insight-personal'
    },
    {
      label: 'Email Coverage',
      value:
        totalContacts === 0
          ? '0%'
          : `${Math.round((contactsWithEmail / totalContacts) * 100)}%`,
      helper: `${contactsWithEmail} with email`,
      testId: 'insight-email-coverage'
    }
  ];

  return (
    <section className='insights-grid' data-cy='contact-insights'>
      {insights.map(insight => (
        <article className='insight-card' data-cy={insight.testId} key={insight.label}>
          <span>{insight.label}</span>
          <strong>{insight.value}</strong>
          <small>{insight.helper}</small>
        </article>
      ))}
    </section>
  );
};

export default ContactInsights;
