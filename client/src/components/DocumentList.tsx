import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CreateDocument from './CreateDocument';
import EditDocument from './EditDocument';
import '../component_styles/DocumentList.css';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import DescriptionIcon from '@mui/icons-material/Description'; 
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';

// This file contains the DocumentList component which is responsible for fetching and displaying the list of documents for the authenticated user. 
// It also handles the logic for creating a new document and editing existing documents. 
// When a document is selected for editing, it renders the EditDocument component instead of the list.

//The interaface is created since the he servers Document type clashed with the DOM document type
interface Document {
    _id: string
    title: string
    content: string
    createdAt: string
    updatedAt: string
}


function DocumentList() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateDocument, setShowCreateDocument] = useState<boolean>(false);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);
    const {t} = useTranslation();
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Fetch documents on component mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:3000/documents', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            } else {
                setError(t('Failed to fetch documents'));
            }

        } catch (error: any) {
            setError(t('Server error') + ': ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Switch back to list view and refresh documents after a new document is created
    const handleDocumentCreated = () => {
        setShowCreateDocument(false);
        fetchDocuments(); 
    };

    // Handle edit button click
    const handleEditClick = (id: string) => {
        setEditingDocId(id);

    };

    // Handle closing edit view
    const handleCloseEdit = () => {
        setEditingDocId(null);
        fetchDocuments(); // Refresh the list
    };

    // Filter documents based on search term (not case sensitive)
    const filteredDocuments = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading documents...</div>;
    if (error) return <div>{error}</div>;

    // If editing a document, show EditDocument instead of the list
    if (editingDocId) {
        return <EditDocument documentId={editingDocId} onClose={handleCloseEdit} />;
    }

    // Else show the main view
    return (
        <div>
            <button onClick={() => setShowCreateDocument(!showCreateDocument)}>
                {showCreateDocument ? t('Cancel') : t('Create new')}
            </button>
            
            {showCreateDocument ? (
                <CreateDocument onDocumentCreated={handleDocumentCreated} />
            ) : (
                <>
                    <h2>{t("My Documents")}</h2>
                    <TextField className="search-input" id="filled-basic" label={t("Search documents")} variant="filled" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {filteredDocuments.length === 0 ? (
                        <p>{t("No documents yet. Create your first one!")}</p>
                    ) : ( 
                        <div className="documents-list">
                            <List sx={{ width: '100%', bgcolor: '#373737', borderRadius: 2, boxShadow: 1 }}>
                                <TransitionGroup>
                                    {filteredDocuments.map((doc, index) => {
                                        const createdDate = new Date(doc.createdAt);
                                        const updatedDate = new Date(doc.updatedAt);
                                        const displayDate = updatedDate > createdDate ? updatedDate : createdDate;
                                        const dateLabel = updatedDate > createdDate ? t('Updated') : t('Created');
                                        
                                        return (
                                            <Collapse key={doc._id}>
                                                <ListItem
                                                    key={doc._id}
                                                    divider={index !== filteredDocuments.length - 1}
                                                    secondaryAction={
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small" 
                                                            onClick={() => handleEditClick(doc._id)}
                                                            sx={{ 
                                                                color: '#646cff',           
                                                                '&:hover': {
                                                                    borderColor: '#747bff',
                                                                    backgroundColor: 'rgba(100, 108, 255, 0.1)'
                                                                }
                                                            }}
                                                        >
                                                            {t("Edit")}
                                                        </Button>
                                                    }
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: '#646cff' }}>
                                                            <DescriptionIcon />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    
                                                    <ListItemText
                                                        primary={doc.title}
                                                        secondary={
                                                            <Typography variant="caption" color="#646cff">
                                                                {dateLabel}: {displayDate.toLocaleDateString()}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                            </Collapse>
                                        );
                                    })}
                                </TransitionGroup>
                            </List>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default DocumentList