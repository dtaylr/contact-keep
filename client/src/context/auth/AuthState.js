import React, { useReducer } from 'react';
import axios from 'axios';
import AuthContext from './authContext';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';
import { trackEvent } from '../../utils/analytics';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS
} from '../types';

const AuthState = props => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  const persistToken = token => {
    localStorage.setItem('token', token);
    setAuthToken(token);
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    setAuthToken();
  };

  const getUserIdFromToken = token => {
    try {
      const encodedPayload = token
        .split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const payload = JSON.parse(atob(encodedPayload));
      return payload.user && payload.user.id;
    } catch (err) {
      return undefined;
    }
  };

  // Load User
  const loadUser = async token => {
    setAuthToken(token || localStorage.getItem('token'));

    try {
      const res = await axios.get('/api/auth');

      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      clearToken();
      dispatch({ type: AUTH_ERROR });
    }
  };

  // Register User
  const register = async formData => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/users', formData, config);
      persistToken(res.data.token);

      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      });
      trackEvent('auth_register_success', {
        userId: getUserIdFromToken(res.data.token)
      });

      loadUser(res.data.token);
    } catch (err) {
      clearToken();
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response.data.msg
      });
    }
  };

  // Login User
  const login = async formData => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/auth', formData, config);
      persistToken(res.data.token);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });
      trackEvent('auth_login_success', {
        userId: getUserIdFromToken(res.data.token)
      });

      loadUser(res.data.token);
    } catch (err) {
      clearToken();
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response.data.msg
      });
    }
  };

  // Logout
  const logout = () => {
    clearToken();
    dispatch({ type: LOGOUT });
  };

  // Clear Errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        loadUser,
        login,
        logout,
        clearErrors
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
