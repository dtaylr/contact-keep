const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Contact = require('../models/Contact');
const {
  MAX_IMPORT_ROWS,
  validateImportRows
} = require('../services/contactImport');

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// @route     GET api/contacts
// @desc      Get all users contacts
// @access    Private
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route     POST api/contacts/import/dry-run
// @desc      Validate contact import rows without saving data
// @access    Private
router.post('/import/dry-run', auth, async (req, res) => {
  const rows = req.body && req.body.contacts;

  if (!Array.isArray(rows)) {
    return res.status(400).json({ msg: 'contacts must be an array' });
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return res
      .status(400)
      .json({ msg: `Import dry run is limited to ${MAX_IMPORT_ROWS} rows` });
  }

  try {
    const existingContacts = await Contact.find({ user: req.user.id }).select(
      'email'
    );
    const report = validateImportRows(rows, existingContacts);

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route     POST api/contacts
// @desc      Add new contact
// @access    Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').notEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('type', 'Contact type must be personal or professional')
        .optional()
        .isIn(['personal', 'professional'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id
      });

      const contact = await newContact.save();

      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route     PUT api/contacts/:id
// @desc      Update contact
// @access    Private
router.put(
  '/:id',
  [
    auth,
    [
      check('email', 'Please include a valid email')
        .optional()
        .isEmail(),
      check('type', 'Contact type must be personal or professional')
        .optional()
        .isIn(['personal', 'professional'])
    ]
  ],
  async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid contact id' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    const contactFields = {};
    if (name) contactFields.name = name;
    if (email) contactFields.email = email;
    if (phone) contactFields.phone = phone;
    if (type) contactFields.type = type;

    try {
      let contact = await Contact.findById(req.params.id);

      if (!contact) return res.status(404).json({ msg: 'Contact not found' });

      if (contact.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { $set: contactFields },
        { returnDocument: 'after' }
      );

      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route     DELETE api/contacts/:id
// @desc      Delete contact
// @access    Private
router.delete('/:id', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid contact id' });
  }

  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: 'Contact not found' });

    // Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Contact removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
