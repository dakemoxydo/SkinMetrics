'use client';

import * as React from 'react';

if (typeof React.useSyncExternalStore !== 'function') {
  // @ts-expect-error Runtime shim for React versions without useSyncExternalStore.
  React.useSyncExternalStore = function useSyncExternalStoreShim<State>(
    _subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => State
  ): State {
    return getSnapshot();
  };
}

export { React };
