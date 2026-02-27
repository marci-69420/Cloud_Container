import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DocumentList from '../components/DocumentList';
import ProfilePicture from '../components/ProfilePicture';
import LanguageMenu from '../components/LanguageMenu';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import '../component_styles/UserPage.css';
import '../component_styles/ProfileSection.css';

// This file contains the User page which serves as the main profile page for authenticated users.

function UserPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { t, } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <nav>
                <div className="title">Cloud container</div>
                <LanguageMenu />
            </nav>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 2 }}>
                    <div className="profile-section">
                    <ProfilePicture />
                    <button className="logout-button" onClick={handleLogout}>{t('Logout')}</button>
                    </div>
                </Grid>
                <Grid size={{ xs: 12, md: 10 }}>
                    <div className= "document-section">
                        <DocumentList/>
                    </div>
                </Grid>
            </Grid>
            <footer>
                <p>Created by Márton Magyar</p>
            </footer>
        </div>
    );
}

export default UserPage;