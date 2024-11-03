import { useEffect, useState } from 'react';
import '../css/Resources.css'
import { useLocation } from 'react-router-dom';
import api, { API_URL } from '../services/getBaseUrl';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Accordion, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import Spinner from '../components/Spinner';

const Resources = () => {

  const { token, socket } = useAuth()
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [videos, setVideos] = useState([])
  const [filteredVideos, setFilteredVideos] = useState([])
  const [filter, setFilter] = useState('All')


  const getVideos = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API_URL}/api/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (data.success) {
        setVideos(data.data)
        setFilteredVideos(data.data)
      }
    } catch (error) {
      console.error("error in fetching videos: " + error)
      toast.error(error.response.data.error)
    }
    finally {
      setLoading(false)
    }
  }

  const handleSetFilterVideos = (category) => {
    setFilter(category)
    if (category === 'All') {
      setFilteredVideos(videos)
      return;
    }
    const data = videos.filter((item) => {
      return item.category === category
    })
    setFilteredVideos(data)
  }

  const handleSearchText = (text) => {
    setSearchText(text)
    if (!text) {
      setFilteredVideos(videos)
      return
    }
    const regex = new RegExp(text, "i");

    const data = videos.filter((video) => {
      if (regex.test(video.description) || regex.test(video.source) || regex.test(video.title)) return video
    })
    setFilteredVideos(data)
  }

  useEffect(() => {
    getVideos()
  }, [])

  useEffect(() => {
    socket.on("video list refreshed", () => {
      getVideos()
    })
    return () => {
      socket.off("video list refreshed", getVideos);
    };
  }, [socket])

  return (
    <div>
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            {/* <ul className="nav nav-pills mb-3 d-flex" id="pills-tab" role="tablist">
              <li className="nav-item w-50" role="presentation">
                <button className={!hash ? "nav-link active nav_tabs" : "nav-link"} style={{ width: "100%" }} id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">Videos</button>
              </li>
              <li className="nav-item w-50" role="presentation">
                <button className={hash === "#FAQ" ? "nav-link active nav_tabs" : "nav-link"} style={{ width: "100%" }} id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">
                  FAQ
                </button>
              </li>
            </ul> */}
            <div className="tab-content" id="pills-tabContent">

              {/* Videos Section */}
              <div className={"tab-pane fade show active"} id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" tabindex="0">
                <input type="search" placeholder='Search Your Video Here...' className='form-control' value={searchText} onChange={e => handleSearchText(e.target.value)} />

                {/* Filter Tabs */}

                <p className='mt-3 mb-0'>Filter</p>
                <div className="filter_wrapper" style={{ overflow: "auto" }}>
                  <ul className="nav nav-pills my-3 filter_tab" id="pills-tab" role="tablist" style={{ width: "max-content" }}>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => handleSetFilterVideos('All')}>All</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => handleSetFilterVideos('Liver')}>Liver</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => handleSetFilterVideos('Cervical')}>Cervical</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => handleSetFilterVideos('Shoulder')}>Shoulder</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => handleSetFilterVideos('Back Pain')}>Back Pain</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => handleSetFilterVideos('Leg Pain')}>Leg Pain</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => handleSetFilterVideos('Knee Pain')}>Knee Pain</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => handleSetFilterVideos('Vertigo')}>Vertigo</button>
                    </li>
                  </ul>
                </div>
                <p className='mt-3 mb-0'>Showing result for <span className='fw-bold'>{searchText ? 'All' : filter}</span></p>

                {
                  loading ? (
                    <div style={{ marginTop: "-150px" }}>
                      <Spinner />
                    </div>
                  ) : (
                    <div className="row flex-column g-4 mt-2">
                      {
                        filteredVideos && filteredVideos.length > 0 &&
                        filteredVideos.map((item) =>
                          <div className="col" key={item._id}>
                            <div className="card card_box">
                              <iframe width="320" height="180" src={item.source} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                              <div className="card-body">
                                <h5 className="card-title">{item.title}</h5>
                                <p className="card-text">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      }{
                        !filteredVideos && filteredVideos.length < 0 &&
                        <div>No Video Found</div>
                      }
                    </div>
                  )
                }
              </div>


              {/* FAQs Section */}

            </div>
          </div>
          <div className="col-6"></div>
          <div className="col-6"></div>
        </div>
      </div>
    </div >
  )
}

export default Resources