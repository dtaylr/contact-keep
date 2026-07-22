import React, { useContext } from 'react';
import Contacts from '../contacts/Contacts';
import ContactForm from '../contacts/ContactForm';
import ContactFilter from '../contacts/ContactFilter';
import ContactImportDryRun from '../contacts/ContactImportDryRun';
import ContactInsights from '../contacts/ContactInsights';
import AuthContext from '../../context/auth/authContext';

const Home = () => {
  const authContext = useContext(AuthContext);
  const firstName =
    authContext.user && authContext.user.name
      ? authContext.user.name.split(' ')[0]
      : 'there';

  return (
    <main className='workspace' data-cy='contact-workspace'>
      <section className='workspace-hero'>
        <div>
          <p className='eyebrow'>Private contact workspace</p>
          <h1>Good to see you, {firstName}</h1>
          <p className='workspace-copy'>
            Keep the people who matter organized, searchable, and ready for
            follow-up.
          </p>
        </div>
      </section>

      <ContactInsights />

      <div className='workspace-grid'>
        <div className='workspace-column'>
          <ContactForm />
          <ContactImportDryRun />
        </div>
        <div className='workspace-column'>
          <section className='panel contacts-panel'>
            <div className='panel-heading'>
              <div>
                <p className='eyebrow'>Directory</p>
                <h2>Contacts</h2>
              </div>
            </div>
            <ContactFilter />
            <Contacts />
          </section>
        </div>
      </div>
    </main>
  );
};

export default Home;
