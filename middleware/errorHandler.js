const notFound = (req, res) => {
  res.status(404).json({ msg: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  console.error(err.message);

  res.status(status).json({
    msg: status === 500 ? 'Server Error' : err.message
  });
};

module.exports = {
  notFound,
  errorHandler
};
