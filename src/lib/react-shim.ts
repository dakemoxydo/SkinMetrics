// Shim for React 19 useSyncExternalStore compatibility
import * as React from 'react';

// @ts-ignore
if (typeof React.useSyncExternalStore !== 'function') {
  // @ts-ignore
  React.useSyncExternalStore = function <State>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => State,
    getServerSnapshot?: () => State
  ): State {
    const state = getSnapshot();
    return state;
  };
}

export default React;
