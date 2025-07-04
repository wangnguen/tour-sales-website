const moment = require('moment');
const Contact = require('../../models/contact.model');

const list = async (req, res) => {
  const find = {
    deleted: false
  };

  // Loc theo ngay tao
  const dataFilter = {};

  if (req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf('date').toDate();
    dataFilter.$gte = startDate;
  }
  if (req.query.endDate) {
    const endDate = moment(req.query.endDate).endOf('date').toDate();
    dataFilter.$lte = endDate;
  }
  if (Object.keys(dataFilter).length > 0) {
    find.createdAt = dataFilter;
  }
  // Het loc theo ngay tao

  // Tim kiem
  if (req.query.keyword) {
    const keywordRegex = new RegExp(req.query.keyword, 'i');
    find.email = keywordRegex;
  }
  // Het tim kiem

  // Phan trang
  const limitItems = 5;
  let page = 1;
  if (req.query.page) {
    const currentPage = parseInt(req.query.page);
    if (currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Contact.countDocuments(find).lean();
  const totalPage = Math.max(Math.ceil(totalRecord / limitItems), 1);
  if (page > totalPage) {
    page = totalPage;
  }
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Het phan trang

  const contactList = await Contact.find(find)
    .sort({
      createdAt: 'desc'
    })
    .limit(limitItems)
    .skip(skip);

  for (const item of contactList) {
    item.createdAtFormat = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
  }

  res.render('admin/pages/contact_list', {
    titlePage: 'Thông tin liên hệ',
    contactList: contactList,
    pagination
  });
};

const changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;
    switch (option) {
      case 'delete':
        if (!req.permissions.includes('contact-delete')) {
          res.json({
            code: 'error',
            message: 'Không có quyền sử dụng tính năng này !'
          });
          return;
        }
        await Contact.updateMany(
          {
            _id: { $in: ids }
          },
          {
            deleted: true,
            deletedBy: req.account.id,
            deletedAt: Date.now()
          }
        );
        req.flash('success', 'Xoá liên lạc thành công !');
        break;
    }
    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Id không hợp lệ !'
    });
  }
};

const deletePatch = async (req, res) => {
  if (!req.permissions.includes('contact-delete')) {
    res.json({
      code: 'error',
      message: 'Không có quyền sử dụng tính năng này !'
    });
    return;
  }

  try {
    const id = req.params.id;
    await Contact.updateOne(
      {
        _id: id
      },
      {
        deleted: true,
        deletedBy: req.account.id,
        deletedAt: Date.now()
      }
    );
    req.flash('success', 'Xoá liên lạc thành công');
    res.json({
      code: 'success'
    });
  } catch (error) {
    res.json({
      code: 'error',
      message: 'Không có quyền sử dụng tính năng này !'
    });
  }
};

module.exports = {
  list,
  changeMultiPatch,
  deletePatch
};
