export const PERMISSIONS = {
  READ_USER: "read_user",
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",

  READ_POST: "read_post",
  CREATE_POST: "create_post",
  UPDATE_POST: "update_post",
  DELETE_POST: "delete_post",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,

    PERMISSIONS.CREATE_POST,
    PERMISSIONS.UPDATE_POST,
    PERMISSIONS.UPDATE_POST,
    PERMISSIONS.DELETE_POST,
  ],
  user: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.READ_POST,
    PERMISSIONS.UPDATE_POST,
    PERMISSIONS.DELETE_POST,
  ],
};
