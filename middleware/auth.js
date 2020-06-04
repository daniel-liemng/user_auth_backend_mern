const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // check token
    const token = req.header('x-auth-token');
    if (!token) {
      return res
        .status(401)
        .json({ msg: 'No authentication token, authorization denied.' });
    }

    // verify token
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(verifiedToken);
    req.user = verifiedToken.id;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = auth;
