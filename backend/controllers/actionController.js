const ActionLog = require('../models/ActionLog');

const getRecentActions = async (req, res) => {
  const actions = await ActionLog.find()
    .sort({ timestamp: -1 })
    .limit(20)
    .populate('user', 'username')
    .populate('task', 'title');

  res.json(actions);
};

module.exports = { getRecentActions };
