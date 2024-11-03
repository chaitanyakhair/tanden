import React, { useState } from 'react';
import axios from 'axios'; // or use fetch if you prefer
import { API_URL } from '../services/getBaseUrl';
import toast from 'react-hot-toast';

const TestWebhook = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleApiCall = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Replace 'https://your-api-url.com' with the actual API endpoint
      const response = await axios.post(`${API_URL}/api/user/verify-whatsapp`, { phoneNumber });
      
      if(response.data.success){
        toast.success("Message send")
      }
      setMessage(response.data.message || 'API call was successful!');
    } catch (error) {
      setMessage('Error making API call.');
      console.error('API call error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Enter Phone Number</h2>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        style={{ padding: '10px', width: '300px' }}
      />
      <button
        onClick={handleApiCall}
        disabled={loading}
        style={{
          padding: '10px 20px',
          marginLeft: '10px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Loading...' : 'Submit'}
      </button>
      
      {message && <p>{message}</p>}
    </div>
  );
};

export default TestWebhook;
