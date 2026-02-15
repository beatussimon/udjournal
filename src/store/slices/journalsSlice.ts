import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ojsApi } from '../../services/api'
import { Journal, Issue, Article } from '../../types'

interface JournalsState {
  journals: Journal[]
  currentJournal: Journal | null
  issues: Issue[]
  currentIssue: Issue | null
  loading: boolean
  error: string | null
}

const initialState: JournalsState = {
  journals: [],
  currentJournal: null,
  issues: [],
  currentIssue: null,
  loading: false,
  error: null,
}

export const fetchJournals = createAsyncThunk('journals/fetchJournals', async () => {
  // Fetch journals from OJS - typically from a journals endpoint or publications
  const response = await ojsApi.get('/innovative-minds/api/v1/submissions?status=published&apiToken=' + import.meta.env.VITE_OJS_API_TOKEN)
  return response.data as unknown as Journal[]
})

export const fetchJournalByPath = createAsyncThunk('journals/fetchJournalByPath', async (path: string) => {
  // For now, we'll fetch submissions and filter
  const response = await ojsApi.get(`/innovative-minds/api/v1/submissions?status=published&apiToken=${import.meta.env.VITE_OJS_API_TOKEN}`)
  return response.data as unknown as Journal
})

export const fetchIssues = createAsyncThunk('journals/fetchIssues', async (journalPath: string) => {
  const response = await ojsApi.get(`/${journalPath}/api/v1/issues?apiToken=${import.meta.env.VITE_OJS_API_TOKEN}`)
  return response.data as unknown as Issue[]
})

export const fetchIssueById = createAsyncThunk('journals/fetchIssueById', async ({ journalPath, issueId }: { journalPath: string; issueId: string }) => {
  const response = await ojsApi.get(`/${journalPath}/api/v1/issues/${issueId}?apiToken=${import.meta.env.VITE_OJS_API_TOKEN}`)
  return response.data as unknown as Issue
})

const journalsSlice = createSlice({
  name: 'journals',
  initialState,
  reducers: {
    setCurrentJournal: (state, action: PayloadAction<Journal | null>) => {
      state.currentJournal = action.payload
    },
    setCurrentIssue: (state, action: PayloadAction<Issue | null>) => {
      state.currentIssue = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Journals
      .addCase(fetchJournals.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJournals.fulfilled, (state, action) => {
        state.loading = false
        state.journals = action.payload
      })
      .addCase(fetchJournals.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch journals'
      })
      // Fetch Issues
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false
        state.issues = action.payload
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch issues'
      })
  },
})

export const { setCurrentJournal, setCurrentIssue, clearError } = journalsSlice.actions
export default journalsSlice.reducer
