import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ojsProxyAPI } from '../../services/api'
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
  // Fetch journals from OJS via Django backend proxy
  const response = await ojsProxyAPI.getJournals()
  // Transform OJS response to Journal format
  const journalData = response.journals || response
  const items = journalData.items || journalData || []
  return items.map((item: { id: number; urlPath?: string; name?: { en_US?: string }; description?: { en_US?: string }; localizedDescription?: string }) => ({
    id: item.id,
    path: item.urlPath || '',
    name: item.name?.en_US || item.name || '',
    description: item.description?.en_US || item.description || '',
    articlesCount: 0,
    issuesCount: 0,
    views: 0,
    downloads: 0,
    citations: 0
  })) as Journal[]
})

export const fetchJournalByPath = createAsyncThunk('journals/fetchJournalByPath', async (path: string) => {
  // This would need to be implemented via the proxy
  // For now, we'll use the journal path to look up from the journals list
  const response = await ojsProxyAPI.getJournals()
  const journalData = response.journals || response
  const items = journalData.items || journalData || []
  const journal = items.find((j: { urlPath?: string }) => j.urlPath === path)
  return journal as unknown as Journal
})

export const fetchIssues = createAsyncThunk('journals/fetchIssues', async (journalPath: string) => {
  const response = await ojsProxyAPI.getIssues(journalPath)
  return response.items || response as unknown as Issue[]
})

export const fetchIssueById = createAsyncThunk('journals/fetchIssueById', async ({ journalPath, issueId }: { journalPath: string; issueId: string }) => {
  // Fetch issues and find the one matching the ID
  const response = await ojsProxyAPI.getIssues(journalPath)
  const items = response.items || response
  const issue = items.find((i: { id: number }) => i.id === parseInt(issueId))
  return issue as unknown as Issue
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
