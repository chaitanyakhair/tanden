import React, { useEffect, useState } from 'react';
import { FaFacebookSquare } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import '../css/Dashboard.css';
import toast from 'react-hot-toast';
import api, { API_URL, domain } from '../services/getBaseUrl';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Spinner from '../components/Spinner';

const Referral = () => {
    const { user,token, setUser, setReferralsData,setKarmaPoints,socket,liveUsersCount } = useAuth();
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState({})
    const [userData, setUserData] = useState({});
    const [shareLink, setShareLink] = useState('')

    const handleToggleFooter = () => {
        setIsFooterVisible(prev => !prev);
    };

    useEffect(() => {
        getData(user)
        // setUserData(user);
    }, []);

    const getData = async (user) => {
        setLoading(true)
        if (!user) return;
        try {
            const res = await axios.get(`${API_URL}/api/user/profile/${user._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.data.success) {
                setUserData(res.data.user)
                setUser(res.data.user)
                setShareLink(`${domain}/login/${res.data.user.refers.code}#register`)
            }
            else {
                toast.error(res.data.error)
            }
        } catch (error) {
            console.error(error)
            setUserData({})
        }
        finally {
            setLoading(false)
        }
    }

    const getReferrals = async () => {
        setLoading(true)
        const token = JSON.parse(localStorage.getItem('auth'))
        try {
            const res = await axios.get(`${API_URL}/api/user/referrals`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.data.success) {
                setReferrals(res.data.users)
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
        }
        finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        getReferrals()
    }, [])

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

    function formatDate(isoDate) {
        const date = new Date(isoDate);

        const day = date.getDate().toString().padStart(2, '0'); // Ensures 2 digits
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    useEffect(() => {
        socket.on('referrals refresh', getReferrals)
        socket.on("update profile",getReferrals)
        return () => {
            socket.off("referrals refresh", getReferrals);
            socket.off("update profile", getReferrals);
        };
    }, [socket])

    return (
        <div>
            <div className="container py-5">
                <div className="row">
                    <div className="col-12">
                        <div className="card text-center">
                            <div className="card-header">
                                Referral Link
                            </div>
                            <div className="card-body">
                                <p className="card-text">Share & Win up to 12 Months of Yoga Vouchers.</p>
                                <div className="url_box d-flex">
                                    <input type="text" className='form-control text-center' value={shareLink} readOnly />
                                    <button className='btn btn-danger' onClick={handleCopyLink}>Copy</button>
                                </div>
                                <div className='d-flex justify-content-between align-items-center flex-md-row flex-column'>
                                    <p className='mb-0 mt-3 text-start'>{liveUsersCount} users are avilable at Tanden</p>
                                    <button className='btn btn-danger mt-3' onClick={handleToggleFooter}>Share Now</button>
                                </div>
                            </div>
                            {isFooterVisible && (
                                <div className="card-footer text-body-secondary">
                                    <div className='social_ul'>
                                        <p><FaFacebookSquare onClick={() => handleShare('facebook')} /></p>
                                        <p><FaInstagramSquare onClick={() => handleShare('instagram')} /></p>
                                        <p><FaXTwitter onClick={() => handleShare('twitter')} /></p>
                                        <p><FaTelegramPlane onClick={() => handleShare('telegram')} /></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Table CSS */}
                <div className="row mt-4">
                    {
                        loading?(
                            <div style={{marginTop:"-150px"}}>
                                <Spinner/>
                            </div>
                    ):(
                            <div className="col-12">
                        <div className="table-responsive rounded">
                            <table className="table border table-striped-columns">
                                <thead>
                                    <tr>
                                        <th scope="col">S.No</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">Username</th>
                                        <th scope="col">Verified</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals && referrals.length > 0 ? (
                                        referrals.map((user, index) => (
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
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default Referral;
