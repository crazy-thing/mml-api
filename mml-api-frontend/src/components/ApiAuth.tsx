import { useState } from 'react';
import { authenticateApiKey } from '../util/auth';
import '../styles/ApiAuth.scss';

interface ApiAuthProps {
    setAuthenticated: (authenticated: any) => void;
}

const ApiAuth = ({ setAuthenticated }: ApiAuthProps) => {
    const [apiKey, setApiKey] = useState<string>('');

    const handleApiKeyChange = (e: any) => {
        setApiKey(e.target.value);
    };

    const handleSubmit = async () => {
        const result = (await authenticateApiKey(apiKey, `${import.meta.env.VITE_IP}`)) ?? false;
        if (result) {
            setAuthenticated(true);
            localStorage.setItem('apiKey', apiKey);
        }
    };



  return (
    <div className='api__auth'>
        <p className='api__auth-header'> Enter API Key </p>
        <input
            className='api__auth-input'
            type='text'
            value={apiKey}
            onChange={handleApiKeyChange}
            required
        />

        <button className='api__auth-button' onClick={() => handleSubmit()}>
            Submit
        </button>
    </div>
  )
};

export default ApiAuth;