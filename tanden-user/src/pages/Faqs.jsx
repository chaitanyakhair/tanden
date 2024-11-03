import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Accordion, Button } from 'react-bootstrap'
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../services/getBaseUrl';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const Faqs = () => {

    const { token, socket } = useAuth()
    const [loading, setLoading] = useState(true);
    const [faqs, setFaqs] = useState([])
    const [filteredFAQS, setFilteredFAQS] = useState([])
    const [selectedFAQFilter, setSelectedFAQFilter] = useState('english');

    useEffect(() => {
        const getFaqs = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/faqs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                if (data.success) {
                    setFaqs(data.data)
                    handleFAQFilter('english', data.data);
                }
            } catch (error) {
                console.error("error in fetching faqs: " + error)
                toast.error(error.response.data.error)
            }
        }
        getFaqs()
        handleFAQFilter('english')
    }, [])


    const handleFAQFilter = (cat, faqsToFilter = faqs) => {
        setSelectedFAQFilter(cat);
        const data = faqsToFilter.filter((item) => item.lang === cat);
        setFilteredFAQS(data);
    };

    const handleLoad = () => {
        setLoading(false);
    };

    return (
        <div className="container py-5 min-h-100" style={{ height: "100vh", width: "100", padding: "0", margin: "0" }}>
            {/* <div className="container py-5">
                <div className={"tab-pane fade show active"} id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab" tabindex="0">
                    <div className='w-100 mb-3'>
                        <Button
                            className="w-50 border-red"
                            style={{ backgroundColor: selectedFAQFilter === 'english' ? 'red' : 'white', color: selectedFAQFilter === 'english' ? 'white' : 'black' }}
                            onClick={() => handleFAQFilter('english')}
                        >
                            English
                        </Button>
                        <Button
                            className="w-50 border-red"
                            style={{ backgroundColor: selectedFAQFilter === 'hindi' ? 'red' : 'white', color: selectedFAQFilter === 'hindi' ? 'white' : 'black' }}
                            onClick={() => handleFAQFilter('hindi')}
                        >
                            Hindi
                        </Button>
                    </div>
                    <Accordion defaultActiveKey="0">
                        {
                            filteredFAQS && filteredFAQS.length > 0 &&
                            filteredFAQS.map((item, index) =>
                                <Accordion.Item key={item._id} eventKey={index} flush>
                                    <Accordion.Header>{item.ques}</Accordion.Header>
                                    <Accordion.Body className='bg-secondary'>{item.ans}</Accordion.Body>
                                </Accordion.Item>
                            )
                        }
                    </Accordion>
                </div>
            </div> */}
            {loading && (
                <div className='w-full text-center'>
                    <Spinner />
                </div>
            )}
            <iframe className="w-100 h-100" src="https://tandenspine.io/faq/" style={{ height: "100%", width: "100%", border: "none" }}  onLoad={handleLoad}></iframe>
        </div>
    )
}

export default Faqs