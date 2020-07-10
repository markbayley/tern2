import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

function simulateNetworkRequest() {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
  
  function LoginButton() {
    const [isLoading, setLoading] = useState(false);
  
    useEffect(() => {
      if (isLoading) {
        simulateNetworkRequest().then(() => {
          setLoading(false);
        });
      }
    }, [isLoading]);
  
    const handleClick = () => setLoading(true);

    return (
      <Button
        variant="outline-secondary"
        size="md" 
        disabled={isLoading}
        onClick={!isLoading ? handleClick : null}
        to="https://auth-test.tern.org.au/auth/realms/tern/protocol/openid-connect/auth?client_id=account&redirect_uri=https%3A%2F%2Fauth-test.tern.org.au%2Fauth%2Frealms%2Ftern%2Faccount%2Flogin-redirect&state=0%2F8b80b485-2114-431c-b92a-1a27748ee396&response_type=code&scope=openid"
      >
      REGISTER
      </Button>
    );
  }

  
export default LoginButton;