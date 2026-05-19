const BASE_Z = 100;
let counter = BASE_Z;

export const getNextZIndex = () => {
  return ++counter;
};

export const TASKBAR_Z = 9999;
export const OVERLAY_Z = 9998;
