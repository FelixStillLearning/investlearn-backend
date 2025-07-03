const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'buy_stock', 'sell_stock', 'create_portfolio', 'update_portfolio', 'delete_portfolio', 'join_challenge', 'complete_module', 'login', 'register', 'kyc_upload', 'risk_assessment_submit', 'admin_action']
  },
  entityType: {
    type: String,
    enum: ['User', 'Portfolio', 'Transaction', 'Payment', 'LearningModule', 'Challenge', 'Badge', 'System']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Flexible field for storing relevant data about the action
  },
  ipAddress: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
