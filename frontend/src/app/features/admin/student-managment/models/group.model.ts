export interface GroupResponse {
  id: number;
  name: string;
  capacity: number;
  enrolledStudents: number;
  availableSeats: number;
  classId: number;
  classCode: string;
}

export interface AddGroupRequest {
  name: string;
  capacity: number;
  classId: number;
}

export interface GroupStatsResponse {
  totalGroups: number;
  totalCapacity: number;
  activeEnrollments: number;
}

export interface AcademicClassOption {
  id: number;
  code: string;
}
