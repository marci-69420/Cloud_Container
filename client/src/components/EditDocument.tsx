import { useState, useEffect, useRef } from 'react';
import DocSharing from './DocSharing';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import html2pdf from 'html2pdf.js';
import { useTranslation } from 'react-i18next';
import '../component_styles/EditDocument.css';

// This file contains the EditDocument component which allows users to edit an existing document.
// It fetches the document data from the server and initializes EditorJS with the content for editing.
// It also handles form submission to update the document on the server, and includes functionality for deleting the document, generating a shareable link, and downloading the document as a PDF.

interface EditDocumentProps {
    documentId: string;
    onClose: () => void;  // Callback to go back to list
}

function EditDocument({ documentId, onClose }: EditDocumentProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const editorRef = useRef<EditorJS | null>(null);
    const {t} = useTranslation();
    
    // Fetch document details for editing (the data then is used as a placeholder for the input fields)
    const fetchDocument = async () => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`http://localhost:3000/documents/${documentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            //Sends the user back to the dashboard if the document is being edited by someone else (403 response)
            if (response.status === 403) {
                    alert(t("This document is currently being edited by someone else."));
                    onClose();
                    return;
                }

            if (response.ok) {
                const data = await response.json();
                setTitle(data.title);     
                setContent(data.content);
            } else {
                setMessage(t('Document not found'));
            }
        } catch (error: any) {
            setMessage(t('Error loading document') + ': ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Call fetchDocument when component mounts
    useEffect(() => {
        fetchDocument();
    }, [documentId]);

    // Unlock document when component unmounts 
    useEffect(() => {
        return () => {
            const unlockDocument = async () => {
                const token = localStorage.getItem('token');
                try {
                    await fetch(`http://localhost:3000/documents/${documentId}/unlock`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    console.log('Document unlocked on component unmount');
                } catch (error) {
                    console.error('Failed to unlock document on unmount:', error);
                }
            };
            unlockDocument();
        };
    }, [documentId]);

    // Initialize EditorJS with the fetched content  (EditorJS is implemented with the help of Copilot)
    useEffect(() => {
     if (!loading && !editorRef.current) {
        let parsedContent;
        
        // Parse content or use empty structure for new documents
        if (content && content.trim()) {
            parsedContent = JSON.parse(content);
        } else {
            parsedContent = { blocks: [] };
        }
        
        editorRef.current = new EditorJS({
            holder: 'editorjs',
            tools: {
                header: Header,
                list: List,
            },
            data: parsedContent
        });
    }

    return () => {
        if (editorRef.current && editorRef.current.destroy) {
            editorRef.current.destroy();
            editorRef.current = null;
        }
    };
    }, [loading, content]);



    // Update document on form submit
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editorRef.current) return;

        const token = localStorage.getItem('token'); // Get token from localStorage

        try {
             const editorData = await editorRef.current.save();
            const contentJSON = JSON.stringify(editorData);  // Convert to JSON string (since the backend expects a string, prob i will chaneg it in the future)

            const response = await fetch(`http://localhost:3000/documents/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ title, content: contentJSON })
            });
            
            if (response.ok) {
                setMessage(t('Document updated successfully!'));
                setTimeout(() => onClose(), 200); //Navigate back to the list
            } else {
                setMessage(t('Error updating document'));
            }
            setTitle('');
            setContent('');
        } catch (error: any) {
            setMessage(t('Error updating document') + ': ' + error.message);
        }
    }

    //Delete document (only if the user is the owner, otherwise revoke access for the shared user)
    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/documents/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setMessage(t('Document deleted successfully!'));
                setTimeout(() => onClose(), 200); // Navigate back to the list
            } else {
                setMessage(t('Error deleting document'));
            }
        } catch (error: any) {
            setMessage(t('Error deleting document') + ': ' + error.message);
        }
    }

    // Cancel editing - document will be unlocked automatically when component unmounts
    const handleCancel = () => {
        onClose(); // The cleanup effect will handle unlocking
    }

    // Generate shareable link for the document (for sharing with non-authenticated users)
    const shareableLink = `${window.location.origin}/public-view/${documentId}`;
    const shareableLinkBtn = (shareableLink: string) => {
        navigator.clipboard.writeText(shareableLink)
    }

    // Download document as PDF (implemented with the help of Copilot)
    const handleDownloadPDF = async () => {
        if (!editorRef.current) return;

        try {
            const editorData = await editorRef.current.save();
            let rawHTML = '';
            
            if (editorData.blocks && editorData.blocks.length > 0) {
                editorData.blocks.forEach((block: any) => {
                    const alignment = block.tunes?.alignmentTune?.alignment || 'left';
                    
                    if (block.type === 'paragraph') {
                        rawHTML += `<p style="text-align: ${alignment}; margin-bottom: 12px; font-size: 14px; line-height: 1.5; color: black;">${block.data.text}</p>`;
                    } 
                    else if (block.type === 'header') {
                        rawHTML += `<h${block.data.level} style="text-align: ${alignment}; margin-top: 18px; margin-bottom: 12px; color: black;">${block.data.text}</h${block.data.level}>`;
                    } 
                    else if (block.type === 'list') {
                        const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                        const listItems = block.data.items.map((item: any) => {
                        const itemText = typeof item === 'object' ? item.content : item;
                        return `<li style="margin-bottom: 5px;">${itemText}</li>`;
                        }).join('');
    
                        rawHTML += `<${listTag} style="margin-bottom: 12px; padding-left: 20px; color: black; font-size: 14px;">${listItems}</${listTag}>`;
                    }
                });
            } else {
                rawHTML = '<p style="color: gray;"><em>Document is empty</em></p>';
            }

            // 3. Create  HTML structure
            const printContent = `
                <div style="padding: 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: white; color: black;">
                    <h1 style="color: black; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
                        ${title || 'Untitled Document'}
                    </h1>
                    ${rawHTML}
                </div>
            `;

            // 4. Configure the PDF
            const opt = {
                margin:       15,
                filename:     `${title || 'document'}.pdf`,
                image:        { type: 'jpeg' as const, quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            // 5. Generate PDF
            await html2pdf().set(opt).from(printContent).save();
            
            setMessage(t('PDF downloaded successfully!'));
        } catch (error: any) {
            console.error("Error generating PDF:", error);
            setMessage(t('Error generating PDF') + ': ' + error.message);
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>{t("Edit Document")}</h2>
            <form onSubmit={handleUpdate}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                {/*EditorJS*/}
                <div id="editorjs" style={{ textAlign: 'left', border: '1px solid #ccc', minHeight: '300px', marginTop: '10px' }}></div>
                <button type="submit">{t("Save")}</button>
                <div className='EditorJS-buttons'>
                    <button id="cancel-btn" type="button" onClick={handleCancel}>{t("Cancel")}</button>
                    <button id="delete-btn" type="button" onClick={handleDelete}>{t("Delete")}</button>
                    <button id="download-pdf-btn" type="button" onClick={handleDownloadPDF}>{t("Download PDF")}</button>
                </div>
            </form>
            {message && <p>{message}</p>}
            <div className="shareable-link-container">
                <h3>{t("Shareable Link")}:</h3>
                <span className="shareable-link-text">{shareableLink}</span>
                <button id="copy-link-btn" onClick={() => shareableLinkBtn(shareableLink)}>❐ </button>
            </div>
            <DocSharing documentId={documentId} />
        </div>
    )
}

export default EditDocument