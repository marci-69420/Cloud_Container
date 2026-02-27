import { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import '../component_styles/CreateDocument.css';
import { useTranslation } from 'react-i18next';

// This file contains the CreateDocument component which allows users to create a new document.
// It uses EditorJS for more advanced text editing and handles form submission to save the document to the server.

interface CreateDocumentProps {
    onDocumentCreated?: () => void;  // Callback after document is created
}

function CreateDocument({ onDocumentCreated }: CreateDocumentProps) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const editorRef = useRef<EditorJS | null>(null);
    const {t} = useTranslation();

    useEffect(() => {
        //Initialize EditorJS (implemented with the help of Copilot)
         editorRef.current = new EditorJS({
            holder: 'editorjs',
            tools: {
                header: Header,
                list: List,
            }
        });

        // Cleanup on unmount
        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Get token from localStorage

        try {
            const editorData = await editorRef.current?.save();
            const contentJSON = JSON.stringify(editorData);
            const response = await fetch('http://localhost:3000/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // Send token
                },
                body: JSON.stringify({ title, content: contentJSON })
            });
            const msg = await response.json();
            setMessage(msg.message || t("Document created successfully"));
            setTitle('');
            
            // Call the callback to refresh list and switch back to list view
            if (onDocumentCreated) {
                setTimeout(() => onDocumentCreated(), 500); 
            }
        } catch (error: any) {
            setMessage(t("Error creating document") + ': ' + error.message);
        }
    }

    return (
        <div>
            <h2>{t("Create Document")}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder={t("Title")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div id="editorjs" style={{ textAlign: 'left', border: '1px solid #ccc', minHeight: '300px', marginTop: '10px' }}></div>
                <button className ="create-document-btn" type="submit">{t("Create Document")}</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    )
}

export default CreateDocument