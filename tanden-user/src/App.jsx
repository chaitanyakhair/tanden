import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect,  Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import { API_URL, domain } from './services/getBaseUrl';
import axios from 'axios';
// import SetupAxiosInterceptors from './services/axiosInterceptor';
import Sidebar from './components/Sidebar';
import Spinner from './components/Spinner';  // Fallback Spinner component
import PaymentForm from './pages/PaymentForm';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Meetings from './pages/Meetings';
import TestWebhook from './pages/TestWebhook';
import VerifyWhatsApp from './components/VerifyWhatsapp';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Referral = lazy(() => import('./pages/Referral'));
const Resources = lazy(() => import('./pages/Resources'));
const Faqs = lazy(() => import('./pages/Faqs'));
const SelfTest = lazy(() => import('./pages/SelfTest'));

function DynamicRoute() {
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#register') {
      console.log(`Register for user with id: ${id}`);
    }
  }, [id, location.hash]);

  return <Login />;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user._id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const { user, setLiveUsersCount, socket, token, setUser, setKarmaPoints, setShareLink } = useAuth();

  const verifyUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/user/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        setUser(data.user);
        setKarmaPoints(data.user.refers.points);
        setShareLink(`${domain}/login/${data.user.refers.code}#register`);
        socket.emit('new_user', data.user._id);
      }
    } catch (error) {
      console.error("error in verify user " + error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('auth');
      if (user._id) {
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    const getLiveUsersCount = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/user/live-users-count`);
        if (data.success) {
          setLiveUsersCount(data.count);
        }
      } catch (error) {
        if (
          error.response.data.error === "User not found." ||
          error.response.data.error === "Invalid token." ||
          error.response.data.error === "Token has expired."
        ) {
          toast.error('Session Expired');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('auth');
        }
        console.error("error in getting live users: " + error);
        toast.error(error.response.data.error);
      }
    };
    verifyUser();
    getLiveUsersCount();
  }, []);

  useEffect(() => {
    const handleLiveUsersSet = (data) => {
      setLiveUsersCount(data);
    };

    socket.on("live users set", handleLiveUsersSet);

    return () => {
      socket.off("live users set", handleLiveUsersSet);
    };
  }, [socket]);

  return (
    <div className='container' style={{
      maxWidth:'600px'
    }}>
      <BrowserRouter>
        {user._id && <Sidebar />}
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={user._id ? <Navigate to="/" replace /> : <Login />}
            />
            <Route path="/login/:code" element={<DynamicRoute />} />
            <Route
              path="/referral"
              element={
                <ProtectedRoute>
                  <Referral />
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <ProtectedRoute>
                  <Faqs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mri"
              element={
                <ProtectedRoute>
                  <SelfTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/webhook"
              element={
                <ProtectedRoute>
                  <TestWebhook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings"
              element={
                <ProtectedRoute>
                  <Meetings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                  <PaymentForm />
              }
            /> 
            <Route
              path="/verify-whatsapp"
              element={
                  <VerifyWhatsApp />
              }
            /> 
            <Route
              path="/payment/success"
              element={
                  <PaymentSuccess />
              }
            />
            <Route
              path="/payment/failure"
              element={
                  <PaymentFailure />
              }
            />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
