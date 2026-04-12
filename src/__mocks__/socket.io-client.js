export const io = () => {
  const handlers = {};
  return {
    on: (evt, fn) => { handlers[evt] = fn; },
    emit: (evt, payload) => { if (handlers[evt]) handlers[evt](payload); },
    disconnect: () => {}
  };
};
export default { io };
