import { useContext } from 'react';
import TravelerAuthContext from './TravelerAuthContext';

function useTravelerAuth() {
  const context = useContext(TravelerAuthContext);

  if (!context) {
    throw new Error(
      'useTravelerAuth must be used within a TravelerAuthProvider.',
    );
  }

  return context;
}

export default useTravelerAuth;
