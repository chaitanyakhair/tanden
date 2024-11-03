import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/getBaseUrl';
import { useAuth } from '../context/AuthContext';
import { Button, Spinner, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Meetings = () => {
    const navigate = useNavigate()
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [meetings, setMeetings] = useState([]);
    const [isMeetNotStarted, setIsMeetNotStarted] = useState(false);
    const [isInvalidPlan, setIsInvalidPlan] = useState(false);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/meetings/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                setMeetings(data.data);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
            toast.error('Error fetching meetings.');
        } finally {
            setLoading(false);
        }
    };

    const joinMeeting = async (meet) => {
        if (!meet._id) {
            toast.error("Meeting not found");
            return;
        }
        if (!isMeetingActive(meet.meetdate)) {
            setIsMeetNotStarted(true); // Open the "Meet not started" dialog
            return;
        }
        if (user.paymentType !== meet.category) {
            setIsInvalidPlan(true); // Open the "Invalid plan" dialog
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/meetings/join/${meet._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.data.success) {
                window.open(res.data.url);
            }
        } catch (error) {
            console.error("Failed to join meet: " + error);
            toast.error("Failed to join meet");
        }
    };

    const isMeetingActive = (meetdate) => {
        const now = new Date();
        const meetingDate = new Date(meetdate);
        return meetingDate <= now;
    };

    const handleClose = () => {
        setIsMeetNotStarted(false);
        setIsInvalidPlan(false);
    };

    return (
        <div className="container mt-4">
            {loading ? (
                <div className="text-center">
                    <Spinner />
                </div>
            ) : (
                <div className="row">
                    {meetings.map((meeting) => (
                        <div className="col-md-4 mb-4" key={meeting._id}>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{meeting.meetname}</h5>
                                    <p className="card-text">
                                        <strong>Date:</strong> {new Date(meeting.meetdate).toLocaleString()}
                                    </p>
                                </div>
                                <div className="card-footer text-center">
                                    <Button 
                                        onClick={() => joinMeeting(meeting)}
                                    >
                                        Join
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Meet Not Started */}
            <Modal show={isMeetNotStarted} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Meeting Not Started</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    The meeting hasn't started yet. Please wait until the scheduled time.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal for Invalid Plan */}
            <Modal show={isInvalidPlan} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>upgrade Your Plan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your current plan does not allow you to join this meeting. Please upgrade your plan to join.
                    <div className='text-center mt-4'>
                        <Button onClick={()=>navigate('/payment')}>Upgrade</Button>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Meetings;
