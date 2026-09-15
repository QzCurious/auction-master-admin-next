export interface PollingState {
  visible: boolean;
  pending: boolean;
  editing: boolean;
  picking: boolean;
}
export function shouldPoll(state: PollingState) {
  return state.visible && !state.pending && !state.editing && !state.picking;
}
