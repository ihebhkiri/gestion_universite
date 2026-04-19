export interface User {
  id: number;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  isEnabled: boolean;
}
export interface Page<T> {
  content: T[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number; // current page
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
export interface UpdateUserRequset{
  id : number ;
  email : string ;
  roleNames : string[] ;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  roleNames: string[];
}
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}
export interface BulkStatusChangeRequest {
  ids: number[];
  status: boolean;

}
