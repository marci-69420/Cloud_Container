# Cloud Container - Collaborative Document Management System

Cloud Container is a collaborative document management system where authenticated users can create, edit, delete, 
and download documents as PDFs, as well as store them in the cloud to save valuable disk space.

Documents can be formatted using headings, ordered and unordered lists, and checklists provided by EditorJS. 
After registering, users can upload a profile picture to make their profile more identifiable. 
To collaborate, users can share documents directly with other registered users or generate a read-only link for non-authenticated users.
The user friendly clean UI is translated into three languages: English, Finnish, and Hungarian.

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn package manager

### Installation
 - Tos start the server in production mode run npm run prod in the root folder.


## Technical Details

#### Frontend Dependencies
- react (^19.2.0)
- react-dom (^19.2.0)
- @editorjs/editorjs (^2.31.3)
- @editorjs/header (^2.8.8)
- @editorjs/list (^2.0.9)
- @mui/material (^7.3.8)
- @mui/icons-material (^7.3.8)
- @emotion/react (^11.14.0)
- @emotion/styled (^11.14.1)
- react-router-dom (^7.13.0)
- i18next (^25.8.13)
- react-i18next (^16.5.4)
- i18next-browser-languagedetector (^8.2.1)
- i18next-http-backend (^3.0.2)
- axios (^1.13.5)
- html2pdf.js (^0.14.0)
- editorjs-html (^4.0.5)
- editorjs-paragraph-with-alignment (^3.0.0)

Frontend Dev Dependencies:
- vite (^7.3.1)
- typescript (~5.9.3)
- eslint (^9.39.1)
- @vitejs/plugin-react (^5.1.1)
- typescript-eslint (^8.48.0)

#### Backend Dependencies
- express (^5.2.1)
- mongoose (^9.2.0)
- jsonwebtoken (^9.0.3)
- bcryptjs (^3.0.3)
- express-validator (^7.3.1)
- cors (^2.8.6)
- dotenv (^17.2.4)
- morgan (^1.10.1)

Backend Dev Dependencies:
- typescript
- tsc-watch (^7.2.0)
- nodemon (^3.1.11)
- @types/* (various TypeScript type definitions)


### File Structure

Cloud_Container/
├── client/              # Frontend React application
│   ├── public/
│   │   └── locales/    # Translation files (en, fi, hu)
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page-level components
│   │   ├── context/    # React Context providers
│   │   └── component_styles/ # CSS modules
│   └── package.json
│
├── server/              # Backend Express application
│   ├── src/
│   │   ├── models/     # Mongoose schemas
│   │   ├── routes/     # API route handlers
│   │   ├── middlewares/# Authentication middleware
│   │   └── validators/ # Input validation rules
│   └── package.json
│
└── package.json         # Root workspace configuration
```

## Implemented features
 - Mandatory Requirements - 25 points
 - Utilization of a frontside framework, I usedReact - 3 points
 - The document editor includes wysiwyg editor of some sort, EditorJS - 2 points
 - Document can be download as PDF - 3 points
 - The drive shows besides the name of the document also the creation and last updated timestamp
   (it shows the creation initially, then it displays the last updated date if the document is updated) - 1 points
 - Users are able to select a profile picture for themselves, the image is stored in the server  - 2 points
 - Translation of the whole UI in two or more languages - 2 points
 - Add search functionality of some sort - 2 points
 Total estimated points: 40
