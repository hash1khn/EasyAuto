import { useEffect } from 'react';

interface ExternalRedirectProps {
  to: string;
}

export const ExternalRedirect: React.FC<ExternalRedirectProps> = ({ to }) => {
  useEffect(() => {
    window.location.href = to;
  }, [to]);

  return null;
};