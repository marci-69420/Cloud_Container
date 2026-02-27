import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../component_styles/docSharing.css';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';

// This file contains the DocSharing component which allows users to share a document with other users. 
// It fetches the list of users from the server and displays them in a list with a share button next to each user. 
// When the share button is clicked, it sends a request to the server to share the document with the selected user. 
// It also includes a search bar to filter users by username.

// Interfaces for User data fetched from the server, and props for the DocSharing component.
interface User {
    _id: string;
    username: string;
    profilePictureUrl?: string;
}

interface DocSharingProps {
    documentId: string;
}


function DocSharing({ documentId }: DocSharingProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const {t} = useTranslation();
    const [searchTerm, setSearchTerm] = useState<string>('');

    //Fetch all the users to show in the sharing list (except the current user) with profile pictures if they have one othervise a generated one with their username's first leetter. (implemented with the help of Copilot)
    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchUsers = async () => {
    
            try {
                const response = await fetch('http://localhost:3000/user/list', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Share document with a user
    const handleShare = async (userId: string, username: string) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`http://localhost:3000/documents/${documentId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userIdToShare: userId })
            });

            if (response.ok) {
                setMessage(t("Document shared with") + ` ${username}!`);
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(t("Failed to share document"));
            }
        } catch (error: any) {
            setMessage(t("Error sharing document") + ': ' + error.message);
        }
    };

    // Filter users based on search term (not case sensitive)
    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if(loading) return <div>Loading users...</div>;

    return (
        <div>
             <div className="users-list">
                <TextField className="search-input" id="filled-basic" label={t("Search users")} variant="filled" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {filteredUsers.length === 0 ? (
                    <p>No other users available</p>
                ) : (
                    <div className="profile-list">
                    <List sx={{ width: '100%', bgcolor: '#373737', borderRadius: 2, boxShadow: 1 }}>
                        <TransitionGroup>
                            {filteredUsers.map((user, index) => (
                                <Collapse key={user._id}>
                                    <ListItem
                                        key={user._id}
                                        divider={index !== filteredUsers.length - 1}
                                        secondaryAction={
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={() => handleShare(user._id, user.username)}
                                                sx={{ 
                                                    color: '#646cff',
                                                    borderColor: '#646cff',
                                                    '&:hover': {
                                                        borderColor: '#747bff',
                                                        backgroundColor: 'rgba(100, 108, 255, 0.1)'
                                                    }
                                                }}
                                            >
                                                {t("Share")}
                                            </Button>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar 
                                                src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`}
                                                alt={`${user.username}'s avatar`}
                                            />
                                        </ListItemAvatar>
                                        
                                        <ListItemText
                                            primary={user.username}
                                        />
                                    </ListItem>
                                </Collapse>
                            ))}
                        </TransitionGroup>
                    </List>
                    </div>
                )}
            </div>
            {message && <Typography sx={{ marginTop: 2, color: '#4caf50' }}>{message}</Typography>}
        </div>
    )
}

export default DocSharing;