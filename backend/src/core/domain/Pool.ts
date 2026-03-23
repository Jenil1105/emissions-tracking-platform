export type PoolMember = {
  routeId: string;
  cbBefore: number;
  cbAfter: number;
};

export type Pool = {
  id: number;
  year: number;
  members: PoolMember[];
};
