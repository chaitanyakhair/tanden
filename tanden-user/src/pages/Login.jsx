import { useState } from 'react'
import tanden from '../assets/tanden.jpg'
import '../css/Login.css'
// import { FaWhatsapp } from "react-icons/fa";
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL, domain } from '../services/getBaseUrl';
import { useAuth } from '../context/AuthContext';
import data from '../data/CountryData.json'
import CustomCountryDropdown from '../components/CustomDropdown';

const Login = () => {
    const { setUser, setReferralsData, setShareLink, setKarmaPoints, setToken, liveUsersCount, socket } = useAuth();

    const navigate = useNavigate()
    const params = useParams();
    const { code } = params;

    // alert(code)

    const [loginData, setLoginData] = useState({
        phoneNumber: "",
        name: "",
        countryCode: "+91"
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!loginData.phoneNumber) {
            toast.error("Please Provide Phone No. First")
            return;
        }
        if (loginData.phoneNumber.length < 10) {
            toast.error("Please Provide 10 Phone No.")
            return;
        }
        if (!loginData.name) {
            toast.error("Please Provide Name First")
            return;
        }
        if (!loginData.countryCode) {
            toast.error("Please Select Country Code")
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/user/login`, { ...loginData, code }, {
                headers: {
                    'Content-Type': "application/json"
                }
            })

            if (res.data.success && res.data.message==="Login successfull") {
                toast.success("You Loged In successfully");
                socket.emit('new_user', res.data.user._id)
                socket.emit('live users changed', res.data.count)
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

    // const checkLogin = () => {
    //     if (user._id) {
    //         navigate('/')
    //     }
    // }

    const handleInputChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value })
    }

    // useEffect(() => {
    //     checkLogin()
    // }, [navigate, user])

    return (

        <>
            <section>
                <div className="container login_main_container">
                    <div className="row py-5 align-items-center">
                        <div className="col-12">
                            <img src={tanden} alt='yoga img' className='w-100 h-auto rounded' />
                        </div>
                        <div className="col-12">
                            <div className="row">
                                <div className="col-12">
                                    <form action="#">
                                        <div className="form_container">
                                            <div className="mb-3">
                                                <input type="text" className="form-control" id="name" placeholder="Enter Your Name" value={loginData.name} onChange={handleInputChange} name='name' />
                                            </div>
                                            <div className="mb-3">
                                                <div className="row">
                                                    <div className="col-5 col-sm-3">
                                                        <CustomCountryDropdown
                                                            data={data}
                                                            value={loginData.countryCode}
                                                            onChange={(e) => setLoginData({ ...loginData, countryCode: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="col-7 col-sm-9">
                                                        <input type="number" className="form-control" id="number" placeholder="WhatsApp Number" value={loginData.phoneNumber} onChange={handleInputChange} name='phoneNumber' maxLength={10} onInput={(e) => e.target.value = e.target.value.slice(0, 10)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3 text-end">
                                                <p className='small_text'>* Please Enter WhatsApp Number Only</p>
                                            </div>

                                            <div className="text-center">
                                                <button type="submit" className="btn btn-danger d-block w-100 common_btn" onClick={handleSubmit}>Continue To Dashboard</button>
                                                <p className='last_text mt-3'><b>{liveUsersCount}</b> have registered already!</p>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Login