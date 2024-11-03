import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';

const SelfTest = () => {
    const [loading, setLoading] = useState(true);

    const handleLoad = () => {
        setLoading(false);
    };

    return (
        <div className="container py-5 min-h-100" style={{ height: "100vh", width: "100", padding: "0", margin: "0" }}>
            {loading && (
                <div className='w-full text-center'>
                    <Spinner />
                </div>
            )}
            <iframe
                className="w-100 h-100"
                src="https://tandenspine.io/mri/"
                style={{ height: "100%", width: "100%", border: "none" }}
                onLoad={handleLoad}
            ></iframe>
        </div>
    );
};

export default SelfTest;
