import React, { useState, useEffect } from 'react';
import AnimatedPage from '../utils/AnimatedPage';
import { getIdeas, createIdea, updateIdea, deleteIdea } from '../services/api';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';

const IdeasPage = ({ user }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // State for new idea form
  const [newIdea, setNewIdea] = useState({ title: '', content: '' });

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const { data } = await getIdeas();
        setIdeas(data);
      } catch (err) {
        setError('Could not fetch ideas.');
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  const handleInputChange = (e) => {
    setNewIdea({ ...newIdea, [e.target.name]: e.target.value });
  };

  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    setIsLoadingAction(true);
    try {
      const { data: createdIdea } = await createIdea(newIdea);
      setIdeas([createdIdea, ...ideas]); // Add new idea to the top of the list
      setNewIdea({ title: '', content: '' }); // Clear the form
    } catch (err) {
      alert('Failed to submit idea. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDelete = async (ideaId) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await deleteIdea(ideaId);
        setIdeas(ideas.filter(idea => idea._id !== ideaId));
      } catch (err) {
        alert('Failed to delete idea.');
      }
    }
  };
  
  const openEditModal = (idea) => {
    setEditingIdea({ ...idea });
    setIsEditModalOpen(true);
  };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoadingAction(true);
    try {
        const {data: updatedIdea} = await updateIdea(editingIdea._id, {title: editingIdea.title, content: editingIdea.content});
        setIdeas(ideas.map(idea => idea._id === updatedIdea._id ? updatedIdea : idea));
        setIsEditModalOpen(false);
    } catch (err) {
        alert('Failed to update idea.');
    } finally {
        setIsLoadingAction(false);
    }
  };

  return (
    <AnimatedPage>
      <div style={{ padding: '1rem' }}>
        <h1 className="homepage-title">Ideas Wall</h1>
        {user && (
          <div className="idea-submission-container">
            <form onSubmit={handleSubmitIdea}>
              <h2>Share Your Idea's/Request's</h2>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" value={newIdea.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="content">Your Idea</label>
                <textarea id="content" name="content" value={newIdea.content} onChange={handleInputChange} required rows="4" style={{width: '100%', padding: '0.75rem', fontSize: '1rem'}}></textarea>
              </div>
              {isLoadingAction ? <Spinner /> : <button type="submit" className="submit-btn">Post Idea</button>}
            </form>
          </div>
        )}
        
        <div className="ideas-list">
          {loading ? <Spinner /> : error ? <p style={{color: 'red'}}>{error}</p> : (
            ideas.map(idea => (
              <div key={idea._id} className="idea-card">
                <div className="idea-header">
                  <div className="idea-author">
                    <img src={idea.author.profilePic} alt={idea.author.displayName} className="idea-author-pic" />
                    <span className="idea-author-name">{idea.author.displayName}</span>
                  </div>
                  {user && user._id === idea.author._id && (
                    <div className="idea-actions">
                      <button onClick={() => openEditModal(idea)} className="idea-action-btn idea-edit-btn">Edit</button>
                      <button onClick={() => handleDelete(idea._id)} className="idea-action-btn idea-delete-btn">Delete</button>
                    </div>
                  )}
                </div>
                <h3 className="idea-title">{idea.title}</h3>
                <p className="idea-content">{idea.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        {editingIdea && (
            <form onSubmit={handleUpdate}>
                <h2>Edit Your Idea</h2>
                <div className="form-group">
                    <label htmlFor="edit-title">Title</label>
                    <input type="text" id="edit-title" name="title" value={editingIdea.title} onChange={(e) => setEditingIdea({...editingIdea, title: e.target.value})} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="edit-content">Your Idea</label>
                    <textarea id="edit-content" name="content" value={editingIdea.content} onChange={(e) => setEditingIdea({...editingIdea, content: e.target.value})} required rows="4" style={{width: '100%', padding: '0.75rem', fontSize: '1rem'}}></textarea>
                </div>
                {isLoadingAction ? <Spinner /> : <button type="submit" className="submit-btn">Save Changes</button>}
            </form>
        )}
      </Modal>
    </AnimatedPage>
  );
};

export default IdeasPage;