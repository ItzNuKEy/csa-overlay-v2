const getBoostBarWidth = (boostAmount: number, maxWidth: number): number => {
    return (boostAmount / 100) * maxWidth
};

const getBoostBarCircumference = (boostAmount: number, maxArcCircumference: number): number => {
  return maxArcCircumference * (1 - boostAmount / 100);
};

const getBoostBarOffset = (boostAmount: number, arcLength: number): number => {
  return arcLength - (boostAmount / 100) * arcLength;
};

export const BoostService = {
    getBoostBarCircumference,
    getBoostBarWidth,
    getBoostBarOffset,
};