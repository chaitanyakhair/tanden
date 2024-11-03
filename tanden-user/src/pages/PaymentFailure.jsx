import '../css/PaymentFailure.css'
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    // You can redirect users to the payment page or another page to retry payment.
    navigate('/payment'); // Change this route as per your app
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Container className="payment-failure-page text-center py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div className="failure-icon my-4">
            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="mb-4">Payment Failed!</h2>
          <p className="lead mb-5">Unfortunately, your payment was not successful. Please try again or contact support.</p>

          <Button variant="danger" onClick={handleRetry} className="mb-3 me-2">
            Retry Payment
          </Button>
          <Button variant="secondary" onClick={handleGoBack} className="mb-3">
            Go to Homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentFailure;
