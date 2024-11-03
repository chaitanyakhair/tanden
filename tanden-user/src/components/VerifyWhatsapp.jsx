import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import '../css/VerifyWhatsapp.css';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, domain } from '../services/getBaseUrl';

const VerifyWhatsApp = () => {
  const navigate=useNavigate();
  const {socket,setUser,setToken,setReferralsData,setKarmaPoints,setShareLink}=useAuth();

  const handleWhatsAppVerify = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?phone=919266871728&text=VERIFY`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {

    const userLogin = async (data)=>{
      console.log("socket: ",data)
      try {
        const res = await axios.post(`${API_URL}/api/user/login`, { phoneNumber:data.user.phoneNumber,name:data.user.username,verificationDone:true }, {
            headers: {
                'Content-Type': "application/json"
            }
        })

        if (res.data.success && res.data.message==="Login successfull") {
            toast.success("Whatsapp verified successfully!");
            if (res.data.referBy && res.data.referBy !== null) {
                socket.emit('referrals refresh', res.data.referBy)
            }
            setUser(res.data.user)
            setToken(res.data.token)
            setReferralsData(res.data.referal)
            setKarmaPoints(res.data.user.refers.points)
            setShareLink(`${domain}/login/${res.data.user.refers.code}#register`)
            localStorage.setItem("currentUser", JSON.stringify(res.data.user))
            localStorage.setItem("auth", JSON.stringify(res.data.token))
            setTimeout(() => {
                navigate('/')
            }, 1500)
        }
        else if(res.data.success && res.data.message==="Verify Whatsapp"){
            console.log("res.data",res.data)
            toast("Please verify whatsapp to use tanden app.")
            socket.emit('new_user', res.data.user._id)
            navigate('/verify-whatsapp')
        }
        else {
            toast.error(res.data.message)
        }

    } catch (error) {
        toast.error(error.response.data.message)
        console.error(error)
    }
    }

    socket.on('whatsapp_verified', userLogin)
    return () => {
        socket.off("whatsapp_verified", userLogin);
    };
}, [socket])

  return (
    <Container className="verify-whatsapp d-flex justify-content-center align-items-center vh-100" >
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-lg border-danger">
            <Card.Body>
              <Card.Title className="text-danger" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                Access Restricted!
              </Card.Title>
              <Card.Text className="mb-4" style={{ fontSize: '16px' }}>
                You need to verify your WhatsApp number to gain full access to our web app.
              </Card.Text>
              <Button variant="danger" onClick={handleWhatsAppVerify} className="w-100">
                Verify via WhatsApp
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyWhatsApp;
