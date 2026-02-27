import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// This file contains the ProfilePicture component which allows users to upload and update their profile picture.
// It fetches the current profile picture from the server on component mount and displays it. 
// Users can choose a new image file which is converted to a Base64 string and sent to the server for uploading or updating the profile picture (implemnted with the help of Copilot).

// Interfaces for Picture data fetched from the server.
interface Picture {
    _id : string;
    url: string;
    ownerId: string;
}

function ProfilePicture() {
    const [picture, setPicture] = useState<Picture | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const {t} = useTranslation();
    const {user} = useAuth();

    //Fetch the current profile picture on component mount
    const token = localStorage.getItem('token');
    useEffect(() => {
        fetchProfilePicture();
    }, []);
    const fetchProfilePicture = async () => {
        try {
            setLoading(true);
        
            const response = await fetch('http://localhost:3000/pictures', {
                method: 'GET',
                headers: {
                'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.pictures && data.pictures.length > 0) {
                setPicture(data.pictures[0]);
                setImageUrl(data.pictures[0].url);
                }
            } else {
                console.error('Failed to fetch picture');
            }
    } catch (error: any) {
        console.error('Fetch error:', error);
    } finally {
        setLoading(false);
    }
  };

   // Convert the chosen file into a Base64 string for fitting into the json and send it to the server for uploading or updating the profile picture(implemented with Copilot).
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setImageUrl(base64String); // This sets the Base64 image string
        
        // Automatically upload after file is selected
        const token = localStorage.getItem('token');
        try {
          setLoading(true);
          
          // Check if updating existing picture or uploading new one
          const endpoint = picture ? 'http://localhost:3000/pictures/update' : 'http://localhost:3000/pictures/upload';
          const method = picture ? 'PUT' : 'POST';
          
          const response = await fetch(endpoint, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              url: base64String,
              ownerId: user?._id
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            setPicture(data.newPicture || data.updatedPicture);
            console.log('Picture uploaded successfully');
          } else {
            console.error('Failed to upload picture');
          }
        } catch (error: any) {
          console.error('Upload error:', error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
        <div style={{ padding: '20px', maxWidth: '300px', textAlign: 'center' }}>
            <h2>{t("Hi")} {user?.username || t("User")}!</h2>

            <div style={{ marginBottom: '15px' }}>
                <img
                    src={imageUrl || picture?.url || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`}
                    alt="User Profile"
                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }}
                />
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/*Edit button to upload pictures */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
            >
                {t("Edit")}
            </button>
        </div>
    );

};



export default ProfilePicture;