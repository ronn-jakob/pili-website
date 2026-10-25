import { useContext } from 'react';
import { OperatorToursContext } from './OperatorToursContext';

export function useOperatorTours() {
  const context = useContext(OperatorToursContext);

  if (!context) {
    throw new Error('useOperatorTours must be used inside OperatorToursProvider');
  }

  return context;
}
