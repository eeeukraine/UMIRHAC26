export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WORKER: 'worker',
};

// Матрица доступов: какие роли могут видеть пункт меню
export const MENU_PERMISSIONS = {
  dashboard: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER],
  analytics: [ROLES.ADMIN], // Только админ
  spisaniya: [ROLES.ADMIN, ROLES.MANAGER],
  stoplist: [ROLES.ADMIN, ROLES.MANAGER],
  priemzk: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER], // Заказы
  bluda: [ROLES.ADMIN, ROLES.MANAGER],
  monit: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WORKER], // Склад
  priemps: [ROLES.ADMIN, ROLES.MANAGER], // Поставки
};