import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../utils/AnimatedPage';
import { updateUserProfile } from '../services/api';
import Spinner from '../components/common/Spinner';

const ProfileSetupPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [group, setGroup] = useState('');
  const [year, setYear] = useState('1st');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for the preview URL
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      // Create a temporary URL for the selected file and set it for preview
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append('displayName', displayName);
    formData.append('group', group);
    formData.append('year', year);
    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }

    try {
      const { data } = await updateUserProfile(formData);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      navigate('/profile');
    } catch (error) {
      console.error('Profile setup failed', error);
      alert('Profile setup failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="profile-setup-container">
        <h2>Complete Your Profile</h2>
        <form onSubmit={handleSubmit}>

          {/* This section will display the preview image */}
          {imagePreview && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <img src={imagePreview} alt="Profile Preview" className="profile-avatar" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="profilePicFile">Profile Picture</label>
            <input 
              type="file" 
              id="profilePicFile"
              accept="image/*" 
              onChange={handleImageChange}
              disabled={isLoading} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input type="text" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required disabled={isLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="group">Group (e.g., MPC, CSE)</label>
            <input type="text" id="group" value={group} onChange={(e) => setGroup(e.target.value)} required disabled={isLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <select id="year" value={year} onChange={(e) => setYear(e.target.value)} required disabled={isLoading}>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
            </select>
          </div>
          {isLoading ? <Spinner /> : <button type="submit" className="submit-btn">Save and Continue</button>}
        </form>
      </div>
    </AnimatedPage>
  );
};

export default ProfileSetupPage;