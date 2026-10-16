export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WORKER: 'worker',
};

export const MENU_PERMISSIONS = {
  dashboard: ['admin', 'manager', 'worker'],
  analytics: ['admin'],
  spisaniya: ['admin', 'manager'],
  stoplist: ['admin', 'manager'],
  priemzk: ['admin', 'manager', 'worker'],
  bluda: ['admin', 'manager'],
  monit: ['admin', 'manager', 'worker'],
  priemps: ['admin', 'manager'], // <-- ИСПРАВЛЕНО: теперь совпадает с Sidebar
};