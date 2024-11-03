import '../css/PaymentSuccess.css'
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Container className="payment-success-page text-center py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div className="success-icon my-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="mb-4">Payment Successful!</h2>
          <p className="lead mb-5">Thank you for your purchase. Your payment has been processed successfully.</p>

          <Button variant="success" onClick={handleGoBack} className="mb-3">
            Go to Homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;
