import React, { useEffect, useState } from 'react';
import { FaFacebookSquare, FaLock, FaWhatsappSquare } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import '../css/Dashboard.css';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../services/getBaseUrl';
import axios from 'axios';
import Spinner from '../components/Spinner';
import AttendanceCalendar from '../components/Attendence';

const Dashboard = () => {
    const { setKarmaPoints, referralsData, setReferralsData, shareLink, karmaPoints, liveUsersCount, user, token, socket } = useAuth();
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [isStepsVisible, setIsStepsVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attendance,setAttendance]=useState(user?.attendence)

    useEffect(() => {
        if (user._id && token) {
            getReferrals()
        }
    }, [])

    const [leftLevel, setLeftLevel] = useState(0)
    const [rightLevel, setRightLevel] = useState(1)
    const [nextTarget, setNextTarget] = useState(10)
    const [nextVoucher, setNextVoucher] = useState(7)

    const getReferrals = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API_URL}/api/user/referrals`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.data.success) {
                setReferralsData(res.data.users)
                setKarmaPoints(res.data.points)
            }
            else {
                toast.error(res.data.error)
            }
        } catch (error) {
            console.error("error to get referrals data: ", error)
            if (error.response.data.error === "No Referrals Found") {
                return
            } else {
                toast.error(error.response.data.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleToggleFooter = () => {
        setIsFooterVisible(prev => !prev);
    };

    function formatDate(isoDate) {
        const date = new Date(isoDate);

        const day = date.getDate().toString().padStart(2, '0'); // Ensures 2 digits
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        toast('Link copied to clipboard!');
    };

    const handleShare = (platform) => {
        const shareUrl = encodeURIComponent(shareLink);
        const shareText = encodeURIComponent("Check out this link!");
        let url = '';

        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${shareText}%20${shareUrl}`;
                break;
            case 'instagram':
                url = `instagram://`;
                alert("Copy this link to share on Instagram: " + shareLink);
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`;
                break;
            default:
                console.error('Unsupported platform');
                return;
        }

        if (url) {
            window.open(url, '_blank');
        }
    };

    const setPointer = (points) => {
        // console.log(points);
        if (points >= 10 && points <= 50) {
            setLeftLevel(1);
            setRightLevel(2);
            setNextTarget(50);
            setNextVoucher(14);
        }
        else if (points > 50) {
            setLeftLevel(2);
            setRightLevel(3);
            setNextTarget(100);
            setNextVoucher(21);
        }
        else if (points >= 50 && points <= 100) {
            setLeftLevel(3);
            setRightLevel(4);
            setNextTarget(200);
            setNextVoucher(28);
        }
        else if (points >= 100 && points <= 200) {
            setLeftLevel(4);
            setRightLevel(5);
            setNextTarget(400);
            setNextVoucher(35);
        }
        else {
            setLeftLevel(0);
            setRightLevel(1);
            setNextTarget(10);
            setNextVoucher(7);
        }
    };

    useEffect(() => {
        setPointer(karmaPoints);
    }, [karmaPoints]);

    useEffect(() => {

        function updateAttendance (date){
            setAttendance(()=>attendance.push(date))
        }

        socket.on('referrals refresh', getReferrals)
        socket.on("update profile", getReferrals)
        socket.on("attendance_marked", ({date})=>{
            console.log("date: ",date)
            updateAttendance(date)
        })
        
        return () => {
            socket.off("referrals refresh", getReferrals);
            socket.off("update profile", getReferrals);
            socket.off("attendance_marked", updateAttendance);
        };
    }, [socket])

    return (
        <div>
            {
                loading ? (
                    <Spinner />
                ) : (
                    <div className="container py-5">
                        <div className="row">
                            <div className="col-12">
                                <div className="card text-center">
                                    <div className="card-header">
                                        Referral Link
                                    </div>
                                    <div className="card-body">
                                        <div className='d-flex justify-content-between flex-column flex-sm-row'>
                                            <p className="card-text">Share & Win up to 12 Months of Yoga Vouchers.</p>
                                            <p className='cursor-pointer fwz-bold btn btn-danger' onClick={() => setIsStepsVisible(!isStepsVisible)}>See Steps</p>
                                        </div>

                                        {isStepsVisible &&
                                            <div>
                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    <div className="d-flex justify-content-center align-items-center bg-primary text-white"
                                                        style={{ borderRadius: '50%', height: '30px', width: '30px', fontSize: '18px', fontWeight: 'bold' }}>
                                                        1
                                                    </div>
                                                    <p className="mb-0 text-start">
                                                        Click on the Copy Button below to copy your personalized referral link.
                                                    </p>
                                                </div>

                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    <div className="d-flex justify-content-center align-items-center bg-secondary text-white"
                                                        style={{ borderRadius: '50%', height: '30px', width: '30px', fontSize: '18px', fontWeight: 'bold' }}>
                                                        2
                                                    </div>
                                                    <p className="mb-0 text-start">
                                                        Share it with your Friends / Family members.
                                                    </p>
                                                </div>

                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    <div className="d-flex justify-content-center align-items-center bg-success text-white"
                                                        style={{ borderRadius: '50%', height: '30px', width: '30px', fontSize: '18px', fontWeight: 'bold' }}>
                                                        3
                                                    </div>
                                                    <p className="mb-0 text-start">
                                                        Earn Karma Points (KP) when they join through your link.
                                                    </p>
                                                </div>
                                            </div>
                                        }

                                        <div className="url_box d-flex">
                                            <input type="text" className='form-control text-center' value={shareLink} readOnly />
                                            <button className='btn btn-danger' onClick={handleCopyLink}>Copy</button>
                                        </div>
                                        <div className='d-flex justify-content-between align-items-center flex-md-row flex-column'>
                                            <p className='mb-0 mt-3 text-start '>{liveUsersCount} users avilable at Tanden.</p>
                                            <button className='btn btn-danger mt-3' onClick={handleToggleFooter}>Share Now</button>
                                        </div>
                                    </div>
                                    {
                                        isFooterVisible && (
                                            <div className="card-footer text-body-secondary">
                                                <div className='social_ul'>
                                                    <p><a href="#"><FaWhatsappSquare onClick={() => handleShare('whatsapp')} /></a></p>
                                                    <p><a href="#"><FaFacebookSquare onClick={() => handleShare('facebook')} /></a></p>
                                                    <p><a href="#"><FaInstagramSquare onClick={() => handleShare('instagram')} /></a></p>
                                                    <p><a href="#"><FaXTwitter onClick={() => handleShare('twitter')} /></a></p>
                                                    <p><a href="#"><FaTelegramPlane onClick={() => handleShare('telegram')} /></a></p>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div >
                            </div >


                            <div className='mt-4 px-0 px-sm-5'>
                                <AttendanceCalendar attendance={user.attendence}/>
                             </div>   

                            <div className="col-12 mt-4">
                                <div className="row" style={{ height: "100%" }}>
                                    <div className="col-12">
                                        <div className="progress_box rounded">
                                            <h6 className='pro_head'>Register</h6>

                                            <div className='d-flex justify-content-center align-items-center position-relative'>
                                                <div className="form-check position-absolute start-0 z-1">
                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked />
                                                </div>
                                                <div className="progress position-relative" style={{ height: '30px' }}>
                                                    <div
                                                        className="progress-bar bg-danger"
                                                        role="progressbar"
                                                        style={{ width: `${(karmaPoints / nextTarget) * 100}%` }}
                                                        aria-valuenow={karmaPoints}
                                                        aria-valuemin="0"
                                                        aria-valuemax={nextTarget}
                                                    ></div>
                                                    <div className="position-absolute" style={{ left: `${(karmaPoints / nextTarget) * 100 - 2}%`, top: "-25px" }}>
                                                        <b>{karmaPoints}/{nextTarget}</b>
                                                    </div>
                                                </div>
                                                <div className="form-check position-absolute end-0">
                                                    <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" checked />
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <p className="level mb-0">Level {leftLevel}</p>
                                                <p className="level mb-0">Level {rightLevel}</p>

                                            </div>


                                            <div className='d-flex justify-content-center'>
                                                <button className='btn btn-danger' onClick={() => handleShare('whatsapp')} >Referral Now</button>
                                            </div>

                                            <hr />

                                            <div className='d-flex flex-row flex-md-row justify-content-between align-items-center border p-3 rounded mb-2'>
                                                <div className="mb-3 mb-md-0 ">
                                                    Level {rightLevel}<br />
                                                    {nextTarget} Karma Points
                                                </div>
                                                <div className="mb-3 mb-md-0 "><FaLock /></div>
                                                <h5 className="text-end text-md-end">
                                                    {nextVoucher} days voucher
                                                </h5>
                                            </div>

                                            <div className='d-flex flex-row flex-md-row justify-content-between align-items-center border p-3 rounded'>
                                                <div className="mb-3 mb-md-0 ">
                                                    Level {rightLevel + 1}<br />
                                                    {nextTarget + nextTarget} Karma Points
                                                </div>
                                                <div className="mb-3 mb-md-0 "><FaLock /></div>
                                                <h5 className="text-end text-md-end">
                                                    {nextVoucher + 7} days voucher
                                                </h5>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >


                        {/* Table CSS */}
                        < div className="row mt-4" >
                            <div className="col-12">
                                <div className="table-responsive rounded">
                                    <table className="table border table-striped-columns">
                                        <thead>
                                            <tr>
                                                <th scope="col">S.No</th>
                                                <th scope="col">Date</th>
                                                <th scope="col">Username</th>
                                                <th scope="col">Whatsapp Verified</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {referralsData && referralsData.length > 0 ? (
                                                referralsData.map((user, index) => (
                                                    <tr key={user._id}>
                                                        <td>{index + 1}</td>
                                                        <td>{formatDate(user.createdAt)}</td>
                                                        <td>{user.username}</td>
                                                        <td>{user.isEmailVerified ? "Yes" : "No"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center">No referrals data Found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div >
                    </div >
                )
            }
        </div >
    );
}

export default Dashboard;
