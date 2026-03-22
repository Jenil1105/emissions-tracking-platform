export type PoolMember = {
  shipId: string;
  routeId: string;
  cbBefore: number;
  cbAfter: number;
};

export type Pool = {
  id: number;
  year: number;
  members: PoolMember[];
};
