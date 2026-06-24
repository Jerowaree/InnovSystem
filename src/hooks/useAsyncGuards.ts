"use client";

import { useEffect, useRef } from "react";

function isAbortControllerError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useAsyncGuards() {
  const isMountedRef = useRef(true);
  const controllersRef = useRef<Set<AbortController>>(new Set());

  useEffect(() => {
    isMountedRef.current = true;
    const controllers = controllersRef.current;

    return () => {
      isMountedRef.current = false;

      for (const controller of controllers) {
        controller.abort();
      }

      controllers.clear();
    };
  }, []);

  const createAbortController = () => {
    const controller = new AbortController();
    controllersRef.current.add(controller);

    controller.signal.addEventListener(
      "abort",
      () => {
        controllersRef.current.delete(controller);
      },
      { once: true }
    );

    return controller;
  };

  const finalizeAbortController = (controller: AbortController) => {
    controllersRef.current.delete(controller);
  };

  const runIfMounted = (callback: () => void) => {
    if (!isMountedRef.current) {
      return;
    }

    callback();
  };

  return {
    createAbortController,
    finalizeAbortController,
    isAbortControllerError,
    isMountedRef,
    runIfMounted,
  };
}
