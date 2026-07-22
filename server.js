const express = require('express');
const helmet = require('helmet');
const connectDB = require('./config/db');
const path = require('path');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { appConfig } = require('./config/env');

const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use(helmet());
app.use(express.json({ extended: false, limit: '10kb' }));
app.use(requestLogger);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'contact-keep',
    uptime: process.uptime()
  });
});

app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/dist'));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
  );
}

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(appConfig.port, () =>
    console.log(`Server started on port ${appConfig.port}`)
  );
}

module.exports = app;
