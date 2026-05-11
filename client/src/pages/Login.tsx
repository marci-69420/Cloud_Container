import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LanguageMenu from '../components/LanguageMenu'
import {useTranslation} from 'react-i18next';
import '../component_styles/Login.css';
import TextField from '@mui/material/TextField';

const getAuthErrorMessage = (err: any) => {
  const responseData = err?.response?.data

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0]?.msg || 'Login failed'
  }

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.email ||
    err?.message ||
    'Login failed'
  )
}

// This file contains the Login component which allows users to log in to their account. 
// It uses the useAuth hook to access the login function from the AuthContext and handles form submission to authenticate the user. 
const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth() // Access login function from AuthContext
  const navigate = useNavigate()
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/profile')
    } catch (err: any) {
      setError(getAuthErrorMessage(err))
    }
  }

  return (
    <div className="login-page-wrapper">
       <nav>
          <div className="title">Cloud container</div>
          <LanguageMenu />
        </nav>
      <div className="login-container">
        <h2>{t("Login")}</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <TextField className='textField' id="filled-basic" label={t("Email")} variant="filled" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField className='textField' id="filled-basic" label={t("Password")} variant="filled" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">
            {t("Login")}
          </button>
        </form>
        <p className="login-footer">
          {t("Don't have an account?")} <Link to="/register">{t("Register")}</Link>
        </p>
      </div>
      <footer>
        <p>Created by Márton Magyar</p>
      </footer>
    </div>
  )
}

export default Login