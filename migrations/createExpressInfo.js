db.users.find().snapshot().forEach(function(e) {
  db.users.update({ _id: e._id. { $set: {
    express_info: {
      addr: e.addr,
      school: e.school,
      receiver: e.real_name,
      phone: e.phone_number,
    },
  }}});
});
