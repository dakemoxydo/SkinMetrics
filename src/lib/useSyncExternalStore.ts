'use client';

import * as React from 'react';

// Polyfill useSyncExternalStore for React 19
if (typeof React.useSyncExternalStore !== 'function') {
  // @ts-ignore
  React.useSyncExternalStore = function subscribe<State>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => State,
    _getServerSnapshot?: () => State
  ): State {
    const [state, setState] = React.useState(getSnapshot);
    
    React.useEffect(() => {
      const unsubscribe = subscribe(() => {
        setState(getSnapshot());
      });
      return unsubscribe;
    }, [subscribe, getSnapshot]);
    
    return state;
  };
}

export { React };
