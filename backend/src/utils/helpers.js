export const isOnlineSession = (mode) => mode === "online";

export const canJoinSession = (booking) =>
  booking.mode === "online" && booking.status === "ongoing";
