import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string[];
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
};

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!response.ok || !data.authenticated) {
        return rejectWithValue(data.message || 'Session check failed');
      }
      return data.user;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to check session');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.status = 'succeeded';
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkSession.rejected, (state) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
