import React from 'react';
import Contacts from '../contacts/Contacts';
import ContactForm from '../contacts/ContactForm';
import ContactFilter from '../contacts/ContactFilter';
import ContactImportDryRun from '../contacts/ContactImportDryRun';

const Home = () => {
  return (
    <div className='grid-2'>
      <div>
        <ContactForm />
        <ContactImportDryRun />
      </div>
      <div>
        <ContactFilter />
        <Contacts />
      </div>
    </div>
  );
};

export default Home;
