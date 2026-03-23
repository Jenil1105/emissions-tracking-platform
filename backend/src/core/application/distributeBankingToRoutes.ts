type RouteBalance = {
  routeId: string;
  year: number;
  cbBefore: number;
};

export type RouteBalanceAfterBanking = RouteBalance & {
  bankingAdjustment: number;
  cbAfterBanking: number;
};

export function distributeBankingToRoutes(
  balances: RouteBalance[],
  availableBanked: number
): RouteBalanceAfterBanking[] {
  let remainingBanked = Math.max(availableBanked, 0);

  const sortedDeficits = [...balances]
    .filter((balance) => balance.cbBefore < 0)
    .sort((left, right) => left.cbBefore - right.cbBefore);

  const bankingByRouteId = new Map<string, number>();

  for (const deficit of sortedDeficits) {
    if (remainingBanked <= 0) {
      break;
    }

    const requiredToNeutralize = Math.abs(deficit.cbBefore);
    const applied = Math.min(requiredToNeutralize, remainingBanked);

    bankingByRouteId.set(deficit.routeId, applied);
    remainingBanked -= applied;
  }

  return balances.map((balance) => {
    const bankingAdjustment = bankingByRouteId.get(balance.routeId) ?? 0;

    return {
      ...balance,
      bankingAdjustment,
      cbAfterBanking: balance.cbBefore + bankingAdjustment,
    };
  });
}
