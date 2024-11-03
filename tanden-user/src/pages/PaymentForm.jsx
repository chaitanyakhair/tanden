import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { API_URL } from '../services/getBaseUrl';
import toast from 'react-hot-toast';
import { useState } from 'react';
import '../css/PaymentForm.css'; // For custom styling
import CustomCountryDropdown from '../components/CustomDropdown';
import data from '../data/CountryData.json'

// Zod schema for form validation
const schema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  buyer_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .length(10, "Phone number must be 10 digits"),
});

const PaymentForm = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema),
  });

  const [paymentToken, setPaymentToken] = useState('');
  const [amount, setAmount] = useState('');
  const [plan, setPlan] = useState('');
  const [countryCode, setCountryCode] = useState('');

  const selectPlan = (selectedPlan, selectedAmount) => {
    setPlan(selectedPlan);
    setAmount(selectedAmount);
  };

  const onSubmit = async (data) => {
    if (!plan || !amount) {
      toast.error("Please select a plan")
      return
    }
    if (!countryCode) {
      toast.error("Please select country")
      return
    }
    if (!paymentToken) {
      toast.error("Please Generate Token");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/payments/create-payment`, {
        ...data,
        amount,
        countryCode,
        plan,
        token: paymentToken,
      });

      const paymentUrl = response.data.data;
      reset();
      setPaymentToken('');
      window.open(paymentUrl, '_blank');
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  };

  const generateToken = async () => {
    const phoneNumber = getValues('phone');
    try {
      const { data } = await axios.post(`${API_URL}/api/payments/generate-token`, {
        phoneNumber, countryCode
      });
      if (data.success) {
        toast.success("Token generated successfully");
        setPaymentToken(data.data);
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      toast.error(error.response.data.error);
    }
  };

  return (
    <Container className="mt-4">
      <h3 className="text-center mb-4">Choose Your Plan</h3>
      <Row className="justify-content-center gap-2">
        {/* Basic Plan Card */}
        <Col>
          <Card className={`plan-card ${plan === 'Silver' ? 'selected' : ''}`}>
            <Card.Body className="text-center">
              <Card.Title>Silver Plan</Card.Title>
              <Card.Text>Access to basic features</Card.Text>
              <h3 className="price">₹99</h3>
              <Button variant="outline-primary" onClick={() => selectPlan('Silver', 99)}>
                Choose
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Pro Plan Card */}
        <Col>
          <Card className={`plan-card ${plan === 'Gold II' ? 'selected' : ''}`}>
            <Card.Body className="text-center">
              <Card.Title>Gold II Plan</Card.Title>
              <Card.Text>Access to advanced features</Card.Text>
              <h3 className="price">₹17,999</h3>
              <Button variant="outline-primary" onClick={() => selectPlan('Gold II', 17999)}>
                Choose
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Enterprise Plan Card */}
        <Col>
          <Card className={`plan-card ${plan === 'Gold I' ? 'selected' : ''}`}>
            <Card.Body className="text-center">
              <Card.Title>Gold I Plan</Card.Title>
              <Card.Text>Full access with priority support</Card.Text>
              <h3 className="price">₹23,999</h3>
              <Button variant="outline-primary" onClick={() => selectPlan('Gold I', 23999)}>
                Choose
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Form Fields */}
      <Form onSubmit={handleSubmit(generateToken)} className="mt-4">
        <Row className="justify-content-center">
          <Col md={6}>
            {/* Purpose Field */}
            <Form.Group className="mb-3" controlId="formPurpose">
              <Form.Label>Purpose</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter purpose"
                {...register('purpose')}
                isInvalid={!!errors.purpose}
              />
              <Form.Control.Feedback type="invalid">
                {errors.purpose?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Buyer Name Field */}
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                {...register('buyer_name')}
                isInvalid={!!errors.buyer_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.buyer_name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Email Field */}
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                {...register('email')}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Phone Field */}

            <div>
              <label>Select Country</label>
              <CustomCountryDropdown
                data={data}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              />
            </div>

            {/* Phone Field */}
            <Form.Group className="mb-3" controlId="formPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                {...register('phone')}
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Generate Token Button */}
            <Button variant="primary" type="submit" className="w-100 mb-2" disabled={paymentToken ? true : false}>
              Generate Token
            </Button>

            {/* Pay Now Button */}
            <Button variant="primary" className="w-100" onClick={() => onSubmit(getValues())} disabled={paymentToken ? false : true}>
              Pay Now
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default PaymentForm;
