import { useState, useEffect, useRef } from 'react';
import { RiMenu2Fill, RiCloseFill } from "react-icons/ri";
import '../css/Sidebar.css';
import { FaAngleDown } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { API_URL } from '../services/getBaseUrl';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const Sidebar = () => {
  const { setUser, karmaPoints, user, token, setReferralsData, setKarmaPoints, socket } = useAuth();
  // console.log(user)
  const [isOpen, setIsOpen] = useState(false);
  const [isQrCodeVisible, setIsQrCodeVisible] = useState(false);
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false); // Controls DayPicker visibility
  const [formData, setFormData] = useState({
    username: user?.username || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || ''
  });

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    // alert("ren")
    if (formData.country) {
      getStates();
    }
  }, [formData.country,getCountries]);

  useEffect(() => {
    if (formData.state) {
      fetchCities();
    }
  }, [formData.state]);


  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])

  const dateInputRef = useRef(null);

  const handleInputClick = () => {
    setShowPicker(true);
  };

  const handleBlur = (event) => {
    if (event.relatedTarget !== dateInputRef.current) {
      setShowPicker(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'country') {
      setFormData(prev => ({ ...prev, state: '', city: '' }));
      getStates()
    } else if (name === 'state') {
      setFormData(prev => ({ ...prev, city: '' }));
      fetchCities()
    }
  };

  // Close the sidebar if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current && !sidebarRef.current.contains(event.target) &&
        toggleRef.current && !toggleRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSidebarToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleCloseSidebar = () => {
    setIsOpen(false);
  };

  const handleToggleQrCode = () => {
    setIsQrCodeVisible(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      // const {data}=api.post('/')
      // if(data.success){
      localStorage.removeItem('currentUser')
      localStorage.removeItem('auth')
      setUser({})
      toast.error("Logout Successful")
      // }
    } catch (error) {
      console.error("error in logout: " + error)
      toast.error("Logout Failed")
    }
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.city || !formData.gender || !formData.dob) {
      toast.error("Please Fill All Details First")
      return;
    }
    try {

      const { data } = await axios.put(`${API_URL}/api/user/update/${user._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (data.success) {
        toast.success("Profile Updated Successfully")
        setUser(data.user)
        setReferralsData(data.referal)
        setKarmaPoints(data.user.refers.points)
        localStorage.setItem("currentUser", JSON.stringify(data.user))
        socket.emit("update profile", data.user.referBy)
      }

    } catch (error) {
      console.error("error in profile updation: " + error)
      toast.error("Profile Updated Failed")
    }
  }

  const fetchCities = async () => {
    try {
      const { data } = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', {
        "country": formData.country,
        "state": formData.state,
      })

      if (!data.error) {
        setCities(data.data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getStates = async() => {

    const country = countries.find((item) => item.name === formData.country);
    if (country) {
      setStates(country.states);
    }else{
      getCountries()
    }
  }

  async function getCountries (){
    try {
      let data = await fetch('https://countriesnow.space/api/v0.1/countries/states')
      data = await data.json()
      setCountries(data.data)
    } catch (error) {
      console.error("error in getting countries: ", error)
    }
  };

  return (
    <div>
      <section>
        <div className="container py-2 position-relative">

          <div className='d-flex justify-content-between align-items-center'>
            <div ref={toggleRef}><RiMenu2Fill className='open_menu' onClick={handleSidebarToggle} /></div>
            <p className='mb-0 text-danger fw-bold'><span>{karmaPoints}</span> Karma Points</p>
          </div>



          <div className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
            <div className='close_sidebar'>
              <RiCloseFill className='close_menu' onClick={handleCloseSidebar} />
            </div>
            <div className='sidebar_ul'>
              <div className="user_profile">
                <FaUserCircle className='profile_svg' />
                <p className='d-flex align-items-center justify-content-center' data-bs-toggle="modal" data-bs-target="#staticBackdrop">View Profile&nbsp;&nbsp;<FaAngleRight /></p>
              </div>
              <p>
                <a href="#" className='dropdown_link' onClick={handleToggleQrCode}>
                  My QR Code
                  <span><FaAngleDown /></span>
                </a>
              </p>
              <div className={`close_qr_code ${isQrCodeVisible ? 'visible' : ''}`}>
                <div className='qr_box'>
                  <p>Personal Invite QR Code</p>
                  <p>Ask your friends to scan and gift 14 Days of FREE ONLINE YOGA</p>
                  <img src={`${API_URL}/${user.qrcode}`} alt='QR Code' className='w-100 h-auto' />
                </div>
              </div>
              <p onClick={() => setIsOpen(false)}><Link to="/">Home</Link></p>
              <p onClick={() => setIsOpen(false)}><Link to="/referral">My Referral</Link></p>
              <p onClick={() => setIsOpen(false)}><Link to="/videos">Videos</Link></p>
              <p onClick={() => setIsOpen(false)}><Link to='/meetings'>Meetings</Link></p>
              <p onClick={() => setIsOpen(false)}><Link to={{ pathname: "/faq" }}>FAQ</Link></p>
              <p onClick={() => setIsOpen(false)}><Link to='/mri'>Self Test</Link></p>
              {/* <p onClick={() => setIsOpen(false)}><Link to='/webhook'>Test Webhhok</Link></p> */}
              <p onClick={() => setIsOpen(false)}><Link to='/payment'>Payment</Link></p>
              <p onClick={handleLogout}><a href="#">Logout</a></p>
            </div>

            {/* <div className="extra_options sidebar_ul">
            <p><a href="#">FAQs</a></p>
            <p onClick={handleLogout}>Logout</p>
          </div> */}
          </div>

          {/* Modal */}
          <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="staticBackdropLabel">{user.username}</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <h4 className='fw-bold'>Personal Details</h4>
                  <form>
                    <div className="my-3">
                      <label htmlFor="name" className="form-label">Name<sup className='text-danger'>*</sup></label>
                      <input type="name" className="form-control" id="name" placeholder='Username' name="username" value={formData.username} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Birth Year<sup className='text-danger'>*</sup>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder='YYYY'
                        name="dob"
                        value={formData.dob ? format(formData.dob, 'yyyy-MM-dd') : ''}
                        onClick={handleInputClick}
                        onChange={(e) => e.preventDefault()}
                        ref={dateInputRef}
                        onBlur={handleBlur}
                      />
                      {showPicker && (
                        <div onBlur={handleBlur}>
                          <DayPicker
                            mode="single"
                            selected={formData.dob}
                            onSelect={(date) => {
                              setFormData({ ...formData, dob: date });
                              setShowPicker(false); // Hide DayPicker after selection
                            }}
                            fromYear={1900} // Set earliest selectable year
                            toYear={new Date().getFullYear()} // Set the latest selectable year as the current year
                            captionLayout="dropdown" // Shows dropdowns to select month/year
                          />
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Gender<sup className='text-danger'>*</sup></label>
                      <select className='form-select' name="gender" value={formData?.gender} onChange={handleChange}>
                        <option selected value="">Select Your Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="not_want">Don not want to disclose</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Select Country</label>
                      {
                        countries && countries.length > 0 &&
                        <select className='form-select' name="country" value={formData.country} onChange={handleChange}>
                          <option value="">Select Country</option>
                          {countries.map((item, index) => (
                            <option key={index} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      }
                    </div>
                    <div>
                      <label className="form-label" >Select State</label>
                      {
                        <select className='form-select' name="state" value={formData.state} onChange={handleChange}>
                          <option value="">Select State</option>
                          {states.map((state, index) => (
                            <option key={index} value={state.name}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      }
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">City<sup className='text-danger'>*</sup></label>
                      {/* <input type="name" className="form-control" id="name" placeholder='Enter Your City' name="city" value={formData.city} onChange={handleChange} /> */}
                      <select className='form-select' name="city" value={formData.city} onChange={handleChange}>
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                          <option key={index} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button onClick={handleSubmit} className="btn btn-danger">Update</button>
                </div>
              </div>
            </div>
          </div>


        </div >

      </section >




    </div >
  );
}

export default Sidebar;
