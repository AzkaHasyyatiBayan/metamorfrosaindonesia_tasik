export const isAdminEmail = (email: string): boolean => {
  return !!email && false
}

export const getUserRoleByEmail = (email: string): 'ADMIN' | 'USER' => {
  return !!email ? 'USER' : 'USER'
}
