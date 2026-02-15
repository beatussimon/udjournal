import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ojsProxyAPI } from '../../services/api'
import { Article } from '../../types'

interface ArticlesState {
  articles: Article[]
  currentArticle: Article | null
  featuredArticles: Article[]
  loading: boolean
  error: string | null
}

const initialState: ArticlesState = {
  articles: [],
  currentArticle: null,
  featuredArticles: [],
  loading: false,
  error: null,
}

export const fetchArticles = createAsyncThunk('articles/fetchArticles', async (journalPath: string) => {
  const response = await ojsProxyAPI.getSubmissions(journalPath, 'published')
  return response.items || response as unknown as Article[]
})

export const fetchArticleById = createAsyncThunk('articles/fetchArticleById', async ({ journalPath, articleId }: { journalPath: string; articleId: string }) => {
  const response = await ojsProxyAPI.getArticle(journalPath, parseInt(articleId))
  return response as unknown as Article
})

export const searchArticles = createAsyncThunk('articles/searchArticles', async (query: string) => {
  // Search across all published submissions
  const response = await ojsApi.get(`/innovative-minds/api/v1/submissions?status=published&apiToken=${import.meta.env.VITE_OJS_API_TOKEN}`)
  const allArticles = response.data as unknown as Article[]
  // Filter by query (in a real app, this would be done server-side)
  const filtered = allArticles.filter(article => 
    article.title.toLowerCase().includes(query.toLowerCase()) ||
    article.abstract?.toLowerCase().includes(query.toLowerCase())
  )
  return filtered
})

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setCurrentArticle: (state, action: PayloadAction<Article | null>) => {
      state.currentArticle = action.payload
    },
    setFeaturedArticles: (state, action: PayloadAction<Article[]>) => {
      state.featuredArticles = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false
        state.articles = action.payload
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch articles'
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.currentArticle = action.payload
      })
      .addCase(searchArticles.pending, (state) => {
        state.loading = true
      })
      .addCase(searchArticles.fulfilled, (state, action) => {
        state.loading = false
        state.articles = action.payload
      })
      .addCase(searchArticles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Search failed'
      })
  },
})

export const { setCurrentArticle, setFeaturedArticles, clearError } = articlesSlice.actions
export default articlesSlice.reducer
