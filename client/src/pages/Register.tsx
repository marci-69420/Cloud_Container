import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TextField from '@mui/material/TextField';
import LanguageMenu from '../components/LanguageMenu';
import '../component_styles/Register.css';
import { useTranslation } from 'react-i18next';
    
// This file contains the Register page which allows users to create a new account.

const getAuthErrorMessage = (err: any, fallback: string) => {
  const responseData = err?.response?.data

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0]?.msg || fallback
  }

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.email ||
    err?.message ||
    fallback
  )
}

const Register: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, password, username)
      navigate('/profile')
    } catch (err: any) {
      setError(getAuthErrorMessage(err, t("Registration failed")))
    }
  }

    return (
        <div className="register-page-wrapper">
           <nav>
              <div className="title">Cloud container</div>
              <LanguageMenu />
            </nav>
          <div className="register-container">
            <h2>{t("Register")}</h2>
            {error && <p className="register-error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <TextField className='textField' id="filled-basic" label={t("Username")} variant="filled" value={username} onChange={(e) => setUsername(e.target.value)} required />

              <TextField className='textField' id="filled-basic" label={t("email")} variant="filled" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <TextField className='textField' id="filled-basic" label={t("Password")} variant="filled" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              
              <button type="submit">{t("Register")}</button>
            </form>
            <p>
              {t("Already have an account?")} <Link to="/login">{t("Login")}</Link>
            </p>
          </div>
          <footer>
                <p>Created by Márton Magyar</p>
            </footer>
        </div>
    )
}

export default Register
