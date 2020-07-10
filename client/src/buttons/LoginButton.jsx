import React, { useState, useEffect} from 'react';
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
    
      >
        {isLoading ? 'Loading' : 'LOGIN'}
      </Button>
 
    );
  }

  
export default LoginButton;