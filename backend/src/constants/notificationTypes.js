const NOTIFICATION_TYPES = {
  DOCUMENT_DELETED: 'document_deleted',
  DOCUMENT_REJECTED: 'document_rejected',
  DOCUMENT_APPROVED: 'document_approved',
  DOCUMENT_UPDATED: 'document_updated',
  DOCUMENT_EXPIRED: 'document_expired',
  NEW_DOCUMENT: 'new_document',
  NEW_APPLICATION: 'new_application',
  APPLICATION_STATUS_CHANGED: 'application_status_changed',
  APPLICATION_WITHDRAWN: 'application_withdrawn',
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_REJECTED: 'application_rejected',
  NEW_USER: 'new_user',
  USER_PROFILE_UPDATED: 'user_profile_updated',
  USER_DOCUMENT_UPDATED: 'user_document_updated',
  ADMIN_ACTION_REQUIRED: 'admin_action_required',
  ADMIN_REVIEW_REQUIRED: 'admin_review_required',
  ADMIN_DOCUMENT_REVIEW: 'admin_document_review',
  ADMIN_APPLICATION_REVIEW: 'admin_application_review',
  DEADLINE: 'deadline',
  TEAM: 'team',
  SYSTEM: 'system'
};

module.exports = {
  NOTIFICATION_TYPES
}; 