const list = (req, res) => {
  res.render('admin/pages/user_list', {
    titlePage: 'Quản lý người dùng'
  });
};

module.exports = {
  list
};
