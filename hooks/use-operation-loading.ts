import { useState, useCallback } from 'react';

type OperationType = 'create-folder' | 'upload-file' | 'delete-item' | 'move-item' | 'rename-item';

interface OperationState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
}

interface LoadingState {
  [key: string]: OperationState;
}

export function useOperationLoading() {
  const [operations, setOperations] = useState<LoadingState>({});

  const startOperation = useCallback((operationId: string, type: OperationType) => {
    setOperations(prev => ({
      ...prev,
      [operationId]: { isLoading: true, error: null, type }
    }));
  }, []);

  const updateProgress = useCallback((operationId: string, progress: number) => {
    setOperations(prev => {
      if (!prev[operationId]) return prev;
      return {
        ...prev,
        [operationId]: { ...prev[operationId], progress }
      };
    });
  }, []);

  const completeOperation = useCallback((operationId: string) => {
    setOperations(prev => {
      const newState = { ...prev };
      delete newState[operationId];
      return newState;
    });
  }, []);

  const failOperation = useCallback((operationId: string, error: string) => {
    setOperations(prev => ({
      ...prev,
      [operationId]: { isLoading: false, error }
    }));
  }, []);

  const getOperationState = useCallback((operationId: string) => {
    return operations[operationId] || { isLoading: false, error: null };
  }, [operations]);

  const resetOperation = useCallback((operationId: string) => {
    setOperations(prev => {
      const newState = { ...prev };
      delete newState[operationId];
      return newState;
    });
  }, []);

  return {
    operations,
    startOperation,
    updateProgress,
    completeOperation,
    failOperation,
    getOperationState,
    resetOperation
  };
}