export interface Employee {
  id: number;
  name: string;
  department: string;
  location: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  salary: number;
}

export const employees: Employee[] = [
  { id: 101, name: 'An Nguyen', department: 'Engineering', location: 'Hanoi', status: 'Active', salary: 1850 },
  { id: 102, name: 'Binh Tran', department: 'Marketing', location: 'Da Nang', status: 'Active', salary: 1450 },
  { id: 103, name: 'Chi Le', department: 'Finance', location: 'HCMC', status: 'On Leave', salary: 1720 },
  { id: 104, name: 'Dung Pham', department: 'Engineering', location: 'HCMC', status: 'Active', salary: 2100 },
  { id: 105, name: 'Giang Vo', department: 'Sales', location: 'Hanoi', status: 'Inactive', salary: 1300 },
  { id: 106, name: 'Ha Do', department: 'Finance', location: 'Da Nang', status: 'Active', salary: 1950 },
  { id: 107, name: 'Khanh Bui', department: 'Sales', location: 'HCMC', status: 'Active', salary: 1580 },
  { id: 108, name: 'Linh Ho', department: 'Marketing', location: 'Hanoi', status: 'On Leave', salary: 1490 },
  { id: 109, name: 'Minh Dang', department: 'Engineering', location: 'HCMC', status: 'Active', salary: 2450 },
  { id: 110, name: 'Nam Phan', department: 'Operations', location: 'Da Nang', status: 'Active', salary: 1520 },
  { id: 111, name: 'Oanh Ly', department: 'Operations', location: 'Hanoi', status: 'Inactive', salary: 1380 },
  { id: 112, name: 'Phuc Ngo', department: 'Sales', location: 'HCMC', status: 'Active', salary: 1680 },
  { id: 113, name: 'Quynh Mai', department: 'Finance', location: 'Hanoi', status: 'Active', salary: 2050 },
  { id: 114, name: 'Son Vu', department: 'Engineering', location: 'Da Nang', status: 'On Leave', salary: 1880 },
  { id: 115, name: 'Trang Truong', department: 'Marketing', location: 'HCMC', status: 'Active', salary: 1770 },
  { id: 116, name: 'Uy Nguyen', department: 'Operations', location: 'Hanoi', status: 'Active', salary: 1620 },
  { id: 117, name: 'Vy Le', department: 'Sales', location: 'Da Nang', status: 'Active', salary: 1420 },
  { id: 118, name: 'Yen Tran', department: 'Finance', location: 'HCMC', status: 'Inactive', salary: 1600 }
];
