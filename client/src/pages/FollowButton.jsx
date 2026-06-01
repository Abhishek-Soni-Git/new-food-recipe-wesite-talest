import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_BACKEND_URL;

const FollowButton = ({ userId, targetUserId, isFollowing }) => {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(isFollowing);
  }, []);

  const handleFollow = async () => {
    try {
      await axios.post(`${API}/auth/follow/${targetUserId}`, { id: userId });
      setFollowing(true);
    } catch (error) {
      console.error('Error following user', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`${API}/auth/unfollow/${targetUserId}`, { id: userId });
      setFollowing(false);
    } catch (error) {
      console.error('Error unfollowing user', error);
    }
  };

  return (
    <div>
      {!following ? (
        <button className='bg-blue-500 rounded-[10px] px-2 py-1 text-white' onClick={handleFollow}>Follow</button>
      ) : (
        <button className='bg-blue-500 rounded-[10px] px-2 py-1 text-white' onClick={handleUnfollow}>Unfollow</button>
      )}
    </div>
  );
};

export default FollowButton;