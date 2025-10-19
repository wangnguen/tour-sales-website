const Contact = require('../../models/contact.model');

const contact = async (req, res) => {
  res.render('client/pages/contact', {
    titlePage: 'Liên Hệ'
  });
};

const createPost = async (req, res) => {
  const { email } = req.body;

  const existEmail = await Contact.findOne({
    email: email
  });

  if (existEmail) {
    res.json({
      code: 'error',
      message: 'Email của bạn đã được đăng ký!'
    });
    return;
  }

  const newRecord = new Contact(req.body);
  await newRecord.save();

  req.flash('success', 'Cảm ơn bạn đã đăng ký nhận tin tức!');

  res.json({
    code: 'success'
  });
};

const feedbackPost = async (req, res) => {
  console.log(req.body);
  res.json({ code: 'success', message: 'Cảm ơn bạn đã phản hồi!' });
};

module.exports = { contact, createPost, feedbackPost };
