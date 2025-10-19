const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.redirect(`/auth/login`);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email } = decoded;

    const existAccount = await User.findOne({
      _id: id,
      email: email,
      status: 'active'
    });

    if (!existAccount) {
      res.clearCookie('token');
      res.redirect(`/auth/login`);
      return;
    }

    req.account = existAccount;
    res.locals.account = existAccount;

    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect(`/auth/login`);
  }
};

const attachUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      req.account = null;
      res.locals.account = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email } = decoded;

    const existAccount = await User.findOne({
      _id: id,
      email,
      status: 'active'
    });

    if (!existAccount) {
      res.clearCookie('token');
      req.account = null;
      res.locals.account = null;
      return next();
    }

    req.account = existAccount;
    res.locals.account = existAccount;
    next();
  } catch (error) {
    res.clearCookie('token');
    req.account = null;
    res.locals.account = null;
    next();
  }
};

module.exports = { verifyToken, attachUser };
