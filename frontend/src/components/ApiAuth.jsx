import React, { useState } from 'react';
import Button from './Button';
import { authenticateApiKey } from '../util/auth';
import '../styles/ApiAuth.scss';

const ApiAuth = ({ setAuthenticated }) => {
    const [apiKey, setApiKey] = useState('');

    const handleApiKeyChange = (e) => {
        setApiKey(e.target.value);
    };

    const handleSubmit = async () => {
        var result = await authenticateApiKey(apiKey, `${import.meta.env.VITE_IP}`);
        setAuthenticated(result);
        if (result) {
            localStorage.setItem('api-key', apiKey);
        }
        // save in cookie or local storage
    };

  return (
    <div className='api-auth'>
        <p className='api-auth-header'> Enter API Key </p>
        <input
            className='api-auth-input'
            type='text'
            value={apiKey}
            onChange={handleApiKeyChange}
            required
        />
        <Button
            onClick={handleSubmit}
            text={"Verify"}
            style={{background: "var(--button-primary)", width: "120px", height: "40px", borderRadius: "2px" }}
        />
    </div>
  )
};

export default ApiAuth;