import React, { createContext, useContext, useEffect, useReducer } from 'react';

const initialState = {
  user: null,
  token: sessionStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: true
};

const ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOADED: 'LOADED'
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      sessionStorage.setItem('token', action.payload.token);
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case ACTIONS.LOGOUT:
      sessionStorage.removeItem('token');
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case ACTIONS.LOADED:
      return { ...state, ...action.payload, loading: false };
    default:
      return state;
  }
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Minimal load: if token exists, set a default user; otherwise remain logged out
    if (state.token) {
      dispatch({ type: ACTIONS.LOADED, payload: { user: { name: 'User', userType: 'user' }, isAuthenticated: true } });
    } else {
      dispatch({ type: ACTIONS.LOADED, payload: { user: null, isAuthenticated: false } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    // Mock login: always succeed
    const token = 'mock-token';
    const user = { name: 'User', email, userType: 'user' };
    dispatch({ type: ACTIONS.LOGIN, payload: { token, user } });
    return { success: true };
  };

  const logout = () => dispatch({ type: ACTIONS.LOGOUT });

  const value = { ...state, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


