import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import LanguageMenu from '../components/LanguageMenu';
import { useTranslation } from 'react-i18next';
import '../component_styles/PublicView.css';

// This file contains the PublicView page a document without editing capabilities (for non authenticated users).

// The interaface is created since the he servers Document type clashed with the DOM document type
interface DocumentData {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}


function PublicView() {
    const { documentId } = useParams(); 
    const [doc, setDoc] = useState<DocumentData | null>(null);  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const editorRef = useRef<EditorJS | null>(null);
    const {t} = useTranslation();

    // Fetch the document with the right ID
    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await fetch(`http://localhost:3000/documents/public/${documentId}`);

                if (response.ok) {
                    const data = await response.json();
                    setDoc(data);
                } else {
                    setError(t('Document not found or not shared'));
                }
            } catch (error: any) {
                setError(t('Error fetching document') + ': ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchDocument();  
    }, [documentId]);

    // Initialize EditorJS in read-only mode
    useEffect(() => {
        if (!loading && doc && !editorRef.current) {
            let parsedContent;
            
            // Parse content or use empty structure for new documents
            if (doc.content && doc.content.trim()) {
                parsedContent = JSON.parse(doc.content);
            } else {
                parsedContent = { blocks: [] };
            }
            
            //Read only EditorJS instance
            editorRef.current = new EditorJS({
                holder: 'editorjs-readonly',
                tools: {
                    header: Header,
                    list: List,
                },
                data: parsedContent,
                readOnly: true,  
                minHeight: 0
            });
        }

        return () => {
            <nav>
                <div className="title">Cloud container</div>
                <LanguageMenu />
            </nav>
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [loading, doc]);

    return (
        <div className="public-view-page-wrapper">
            <nav>
                <div className="title">Cloud container</div>
                <LanguageMenu />
            </nav>
            <div className="public-view-container">
            {loading && <p>{t("Loading document...")}</p>}
            {error && <p className="error">{error}</p>}
            {doc && (
                <div>
                    <h1>{doc.title}</h1>
                    <div id="editorjs-readonly"></div>
                    <p className="readonly-note">
                        {t("This is a read-only view")}
                    </p>
                </div>
            )}
            </div>
            <footer>
                <p>Created by Márton Magyar</p>
            </footer>
        </div>
    );
}

export default PublicView;