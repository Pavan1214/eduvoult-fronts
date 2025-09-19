import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../utils/AnimatedPage';
import { getMyUploads, updateUserProfile, deleteUpload, updateUpload } from '../services/api';
import ImageCard from '../components/uploads/ImageCard';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    group: user?.group || '',
    year: user?.year || '1st',
  });
  
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUpload, setEditingUpload] = useState(null);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        setLoadingUploads(true);
        const { data } = await getMyUploads();
        setUploads(data);
      } catch (error) {
        console.error("Failed to fetch user uploads", error);
      } finally {
        setLoadingUploads(false);
      }
    };
    if (user) {
      fetchUploads();
    }
  }, [user]);

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append('displayName', profileData.displayName);
    formData.append('group', profileData.group);
    formData.append('year', profileData.year);
    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }
    try {
      const { data } = await updateUserProfile(formData);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setIsEditingProfile(false);
      setProfilePicFile(null);
    } catch (error) {
      alert('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUpload = async (uploadId) => {
    if (window.confirm('Are you sure you want to permanently delete this upload?')) {
      setIsLoading(true);
      try {
        await deleteUpload(uploadId);
        setUploads(uploads.filter(upload => upload._id !== uploadId));
      } catch (error) {
        alert('Failed to delete upload.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const openEditModal = (upload) => {
    setEditingUpload({ ...upload });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUpload(null);
  };
  
  const handleUploadDataChange = (e) => setEditingUpload({ ...editingUpload, [e.target.name]: e.target.value });

  const handleUpdateUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: updatedData } = await updateUpload(editingUpload._id, {
        subject: editingUpload.subject,
        group: editingUpload.group,
        year: editingUpload.year,
        semester: editingUpload.semester,
      });
      setUploads(uploads.map(up => (up._id === updatedData._id ? { ...up, ...updatedData } : up)));
      closeEditModal();
    } catch (error) {
      alert('Failed to update.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <AnimatedPage><div className="profile-page-container"><h2>Please log in to view your profile.</h2></div></AnimatedPage>;
  }

  return (
    <AnimatedPage>
      <div className="profile-page-container">
        {!isEditingProfile ? (
          <div>
            <div className="profile-header">
              <img src={user.profilePic} alt="User Avatar" className="profile-avatar" />
              <div className="profile-header-info">
                <h2>{user.displayName}</h2>
                <p>{user.group} • {user.year}</p>
              </div>
            </div>
            <button onClick={() => setIsEditingProfile(true)} className="submit-btn">Edit Profile</button>
          </div>
        ) : (
          <div>
            <h2>Edit Your Profile</h2>
            <form onSubmit={handleProfileSave} className="profile-edit-form">
              <div className="form-group">
                <label htmlFor="profilePic">Change Profile Picture</label>
                <input type="file" name="profilePic" id="profilePic" accept="image/*" onChange={(e) => setProfilePicFile(e.target.files[0])} disabled={isLoading} />
              </div>
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input type="text" name="displayName" id="displayName" value={profileData.displayName} onChange={handleProfileChange} required disabled={isLoading} />
              </div>
              <div className="form-group">
                <label htmlFor="group">Group</label>
                <input type="text" name="group" id="group" value={profileData.group} onChange={handleProfileChange} required disabled={isLoading} />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <select name="year" id="year" value={profileData.year} onChange={handleProfileChange} required disabled={isLoading}>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                </select>
              </div>
              {isLoading ? <Spinner /> : (
                <>
                  <button type="submit" className="submit-btn">Save Changes</button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="submit-btn" style={{marginTop: '1rem', backgroundColor: '#6b7280'}}>Cancel</button>
                  <button type="button" onClick={handleLogout} className="submit-btn" style={{marginTop: '1rem', backgroundColor: '#db4437'}}>Logout</button>
                </>
              )}
            </form>
          </div>
        )}

        {/* This is the section that was missing from your code */}
        <div className="user-uploads-section">
          <h2 style={{marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem'}}>Your Uploads</h2>
          {loadingUploads ? <Spinner /> : uploads.length > 0 ? (
            <div className="homepage-grid">
              {uploads.map(upload => (
                <div key={upload._id} className="grid-item">
                  <ImageCard 
                    upload={upload} 
                    onDelete={() => handleDeleteUpload(upload._id)}
                    onEdit={() => openEditModal(upload)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't uploaded any images yet.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
        {editingUpload && (
          <form onSubmit={handleUpdateUpload}>
            <h2>Edit Upload Details</h2>
            <div className="form-group">
              <label htmlFor="edit-subject">Subject</label>
              <input type="text" id="edit-subject" name="subject" value={editingUpload.subject} onChange={handleUploadDataChange} required disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="edit-group">Group</label>
              <input type="text" id="edit-group" name="group" value={editingUpload.group} onChange={handleUploadDataChange} required disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="edit-year">Year</label>
              <select name="year" id="edit-year" value={editingUpload.year} onChange={handleUploadDataChange} required disabled={isLoading}>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-semester">Semester</label>
              <input type="text" id="edit-semester" name="semester" value={editingUpload.semester} onChange={handleUploadDataChange} required disabled={isLoading}/>
            </div>
            {isLoading ? <Spinner /> : <button type="submit" className="submit-btn">Save Changes</button>}
          </form>
        )}
      </Modal>
    </AnimatedPage>
  );
};

export default ProfilePage;