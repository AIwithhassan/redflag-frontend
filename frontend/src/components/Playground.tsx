'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { navigateTo } from '@/components/Nav'
import type { UserConfig } from '@/components/Configuration'
import { getResolvedConfig } from '@/components/Configuration'

const API_ENDPOINTS = [
  'http://187.124.23.208:8000',
  'https://api.redflag-ai.com',
  'http://localhost:8000',
]
const MAX_SESSIONS = 3
const CAPACITY_INTERVAL = 30000

interface FileInfo {
  name: string
}

interface StepLog {
  type: string
  text: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isThinking?: boolean
  steps?: StepLog[]
  stats?: string
}

interface ChatSession {
  idx: number
  backendSessionId: string | null
  files: FileInfo[]
  messages: ChatMessage[]
  title: string
}

const toolIcons: Record<string, string> = {
  scan_folder: '📂',
  preview_file: '👁',
  parse_file: '📖',
  read_section: '📑',
  read: '📄',
  grep: '🔍',
  glob: '🔎',
}

function newChatSession(idx: number): ChatSession {
  return { idx, backendSessionId: null, files: [], messages: [], title: 'New Chat' }
}

function wrapSection(html: string, headerText: string): string {
  const sectionId = 'sec-' + Math.random().toString(36).substr(2, 9)
  const regex = new RegExp(`(<h[23][^>]*>\\s*${headerText}[^<]*<\\/h[23]>)((?:(?!<h[23]).|\\n)*)`, 'gi')
  return html.replace(regex, (_match, header, content) => {
    return `
      <div class="chat-steps-log section-collapsible" style="margin-bottom:12px">
        <button class="chat-steps-toggle" onclick="(function(){var el=document.getElementById('${sectionId}'),btn=this;if(!el)return;var show=el.style.display==='none';el.style.display=show?'block':'none';var txt=btn.textContent.split(' — ')[0].slice(2);btn.textContent=show?'▾ '+txt+' — hide':'▸ '+txt+' — show';})()" style="background:none;border:none;font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--ink-muted);cursor:pointer;padding:0">▸ ${headerText} — show</button>
        <div class="chat-steps-list sub-section-content" id="${sectionId}" style="display:none;padding-left:10px;border-left:2px solid var(--border);margin-top:10px;">
          ${content}
        </div>
      </div>`
  })
}

function renderAnswer(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[Source:[^\]]+\]/g, m => `<span class="chat-citation" style="background:var(--red-light);color:var(--red-dark);padding:1px 5px;font-size:11px">${m}</span>`)

  html = wrapSection(html, 'Sources Consulted')
  html = wrapSection(html, 'Information Gaps')
  html = wrapSection(html, 'Citations')

  return html
}

export default function Playground() {
  const [config] = useLocalStorage<UserConfig>('redflag-user-config', {
    provider: 'openai',
    model: 'gpt-5.4-mini',
    apiKey: '',
  })
  const [apiBase, setApiBase] = useState('')
  const [sessions, setSessions] = useState<(ChatSession | null)[]>([newChatSession(0), null, null])
  const [activeIdx, setActiveIdx] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pendingMsgIdx, setPendingMsgIdx] = useState(-1)
  const [compactMode, setCompactMode] = useState(false)
  const [filesModalOpen, setFilesModalOpen] = useState(false)
  const [humanModalOpen, setHumanModalOpen] = useState(false)
  const [humanQuestion, setHumanQuestion] = useState('')
  const [humanResponse, setHumanResponse] = useState('')
  const [dragOver, setDragOver] = useState(0)
  const [capacity, setCapacity] = useState<{ available: number; max: number; active: number } | null>(null)
  const [backendReady, setBackendReady] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const awaitRef = useRef<{ resolve: (val: string) => void; reject: () => void } | null>(null)

  const activeSession = sessions[activeIdx]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const track = (event: string) => {
    try {
      if (typeof (window as any).plausible !== 'undefined') {
        (window as any).plausible(event)
      }
    } catch { /* ignore */ }
  }

  // Backend discovery
  useEffect(() => {
    let cancelled = false
    async function discover() {
      for (const url of API_ENDPOINTS) {
        if (cancelled) return
        try {
          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 3000)
          const resp = await fetch(`${url}/api/playground/status`, { signal: ctrl.signal })
          clearTimeout(timer)
          if (resp.ok) {
            setApiBase(url)
            setBackendReady(true)
            return
          }
        } catch { /* try next */ }
      }
      setBackendReady(false)
    }
    discover()
    return () => { cancelled = true }
  }, [])

  // Capacity polling
  useEffect(() => {
    if (!apiBase) return
    const check = async () => {
      try {
        const resp = await fetch(`${apiBase}/api/playground/status`)
        const data = await resp.json()
        setCapacity({
          available: data.available_slots ?? 0,
          max: data.max_sessions ?? 0,
          active: data.active_sessions ?? 0,
        })
      } catch { /* ignore */ }
    }
    check()
    const interval = setInterval(check, CAPACITY_INTERVAL)
    return () => clearInterval(interval)
  }, [apiBase])

  // Scroll on messages change
  useEffect(() => { scrollToBottom() }, [activeSession?.messages])

  // beforeunload beacon
  useEffect(() => {
    const handler = () => {
      for (const s of sessions) {
        if (s && s.backendSessionId) {
          navigator.sendBeacon(`${apiBase}/api/playground/session/end`, JSON.stringify({ session_id: s.backendSessionId }))
        }
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [sessions, apiBase])

  const activeS = (): ChatSession | null => sessions[activeIdx] as ChatSession | null

  const updateSession = (idx: number, upd: Partial<ChatSession> | ((s: ChatSession) => ChatSession)) => {
    setSessions(prev => {
      const next = [...prev]
      const s = next[idx]
      if (!s) return prev
      next[idx] = typeof upd === 'function' ? upd(s) : { ...s, ...upd }
      return next as (ChatSession | null)[]
    })
  }

  const chatNewSession = useCallback(() => {
    const slot = sessions.findIndex(s => s === null)
    if (slot === -1) return
    setSessions(prev => {
      const next = [...prev]
      next[slot] = newChatSession(slot)
      return next as (ChatSession | null)[]
    })
    setActiveIdx(slot)
  }, [sessions])

  const chatSwitchSession = useCallback((idx: number) => {
    if (isRunning || !sessions[idx]) return
    setActiveIdx(idx)
  }, [isRunning, sessions])

  const chatDeleteSession = useCallback(async (idx: number) => {
    const s = sessions[idx]
    if (!s) return
    if (s.backendSessionId) {
      try {
        await fetch(`${apiBase}/api/playground/session`, {
          method: 'DELETE',
        headers: { 'X-Session-ID': s.backendSessionId ?? '' },
        })
      } catch { /* ignore */ }
    }
    setSessions(prev => {
      const next = [...prev]
      next[idx] = null
      if (activeIdx === idx) {
        const other = next.findIndex(x => x !== null)
        if (other === -1) {
          next[0] = newChatSession(0)
          setActiveIdx(0)
        } else {
          setActiveIdx(other)
        }
      }
      return next as (ChatSession | null)[]
    })
  }, [sessions, apiBase, activeIdx])

  const chatStartRename = (idx: number) => {
    const s = sessions[idx]
    if (!s) return
    const input = prompt('Rename session:', s.title)
    if (input && input.trim()) {
      updateSession(idx, { title: input.trim() })
    }
  }

  // File handlers
  const pgFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !apiBase) return
    const s = activeS()
    if (!s) return

    if (!s.backendSessionId) {
      try {
        const res = await fetch(`${apiBase}/api/playground/session`, { method: 'POST' })
        if (res.status === 503) { alert('Playground is full. Try again shortly.'); return }
        const data = await res.json()
        s.backendSessionId = data.session_id
        updateSession(s.idx, { backendSessionId: data.session_id })
        track('playground-start')
      } catch (e: any) {
        alert('Could not connect to backend at ' + apiBase + '.\n\n' + e.message)
        return
      }
    }

    const formData = new FormData()
    const toAdd: FileInfo[] = []
    for (const f of Array.from(fileList)) {
      if (f.size > 50 * 1024 * 1024) { alert(`"${f.name}" exceeds 50MB.`); continue }
      formData.append('files', f)
      toAdd.push({ name: f.name })
    }
    if (toAdd.length === 0) return

    try {
      const res = await fetch(`${apiBase}/api/playground/upload`, {
        method: 'POST',
        headers: { 'X-Session-ID': s.backendSessionId ?? '' },
        body: formData,
      })
      const data = await res.json()
      if (data.errors && data.errors.length > 0) console.warn('Upload errors:', data.errors)
      for (const incoming of toAdd) {
        const existing = s.files.findIndex(f => f.name === incoming.name)
        if (existing !== -1) {
          s.files[existing] = incoming
        } else {
          s.files.push(incoming)
        }
      }
      updateSession(s.idx, { files: [...s.files] })
      track('playground-upload')
    } catch (e: any) {
      alert('Upload failed: ' + e.message)
    }
  }

  const chatRemoveFile = (idx: number) => {
    const s = activeS()
    if (!s) return
    s.files.splice(idx, 1)
    updateSession(s.idx, { files: [...s.files] })
  }

  const chatUseQuestion = (text: string) => {
    const input = document.getElementById('pg-query-input') as HTMLTextAreaElement
    if (input) {
      input.value = text
      input.focus()
    }
  }

  // WebSocket message handling
  const pgHandleMessage = useCallback((msg: any) => {
    const s = activeS()
    if (!s || pendingMsgIdx < 0) return
    const pending = s.messages[pendingMsgIdx]
    if (!pending) return

    switch (msg.type) {
      case 'start':
        break
      case 'ingest': {
        const n = msg.data?.documents_found || '?'
        pending.steps = [...(pending.steps || []), { type: 'ingest', text: `📂 ${msg.data?.message || 'Ingesting...'} Found ${n} documents.` }]
        updateSession(s.idx, { messages: [...s.messages] })
        break
      }
      case 'tool_call': {
        const d = msg.data || {}
        const inp = d.tool_input || {}
        const tgt = inp.file_path || inp.directory || inp.path || inp.query || ''
        pending.steps = [...(pending.steps || []), { type: 'tool', text: `${toolIcons[d.tool_name] || '📄'} ${d.tool_name}${tgt ? ': ' + tgt : ''}` }]
        updateSession(s.idx, { messages: [...s.messages] })
        break
      }
      case 'go_deeper': {
        pending.steps = [...(pending.steps || []), { type: 'tool', text: `📁 Navigate: ${msg.data?.directory || ''}` }]
        updateSession(s.idx, { messages: [...s.messages] })
        break
      }
      case 'verifying': {
        pending.steps = [...(pending.steps || []), { type: 'verify', text: `✓ ${msg.data?.message || 'Verifying citations...'}` }]
        updateSession(s.idx, { messages: [...s.messages] })
        break
      }
      case 'complete':
        pgHandleComplete(msg.data)
        break
      case 'error':
        pgFinishWithError(msg.data?.message || 'Unknown error')
        break
      case 'cancelled': {
        pending.isThinking = false
        pending.content = 'Cancelled.'
        updateSession(s.idx, { messages: [...s.messages] })
        pgFinish()
        break
      }
      case 'ask_human':
        pgShowHumanModal(msg.data)
        break
    }
  }, [activeIdx, sessions, pendingMsgIdx])

  const pgHandleComplete = useCallback((data: any) => {
    if (data?.error) { pgFinishWithError(data.error); return }
    const s = activeS()
    if (!s || pendingMsgIdx < 0) return

    const elapsed = startTime ? pgFormatDuration((Date.now() - startTime) / 1000) : ''
    const st = data?.stats
    let statsLine = ''
    if (st) {
      if (st.mode === 'chat') {
        statsLine = `${st.api_calls || 1} API call · $${(st.estimated_cost || 0).toFixed(4)} · ${elapsed}`
      } else {
        statsLine = `${st.steps} steps · ${st.documents_scanned || 0} docs · $${(st.estimated_cost || 0).toFixed(4)} · ${elapsed}`
      }
    }

    s.messages[pendingMsgIdx] = {
      role: 'assistant',
      isThinking: false,
      content: data?.final_result || 'No result returned.',
      steps: s.messages[pendingMsgIdx]?.steps || [],
      stats: statsLine,
    }
    updateSession(s.idx, { messages: [...s.messages] })
    pgFinish()
    track('playground-complete')
  }, [activeIdx, sessions, pendingMsgIdx, startTime])

  const pgFinishWithError = useCallback((msg: string) => {
    const s = activeS()
    if (!s || pendingMsgIdx < 0) return
    let displayMsg = msg
    if (typeof msg === 'string' && (msg.includes('Invalid or expired session') || msg.includes('No files uploaded yet'))) {
      updateSession(s.idx, { backendSessionId: null, files: [] })
      displayMsg = 'Your uploaded session expired or was reset on the backend. Please upload your documents again, then rerun the question.'
    }
    s.messages[pendingMsgIdx] = { role: 'assistant', isThinking: false, content: `⚠ Error: ${displayMsg}`, steps: [], stats: '' }
    updateSession(s.idx, { messages: [...s.messages] })
    pgFinish()
  }, [activeIdx, sessions, pendingMsgIdx])

  const pgFinish = useCallback(() => {
    setIsRunning(false)
    setPendingMsgIdx(-1)
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
  }, [])

  // Human input modal
  const pgShowHumanModal = (data: any) => {
    setHumanQuestion(data?.question || data?.reason || 'Input required.')
    setHumanResponse('')
    setHumanModalOpen(true)
  }

  const pgSubmitHuman = () => {
    if (!humanResponse.trim()) return
    setHumanModalOpen(false)
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'human_response', response: humanResponse.trim() }))
    }
    setHumanResponse('')
  }

  // Run analysis
  const pgRunAnalysis = useCallback(() => {
    const queryEl = document.getElementById('pg-query-input') as HTMLTextAreaElement
    const query = queryEl?.value?.trim() || ''
    if (!query || isRunning) return

    const s = activeS()
    if (!s || !apiBase) return

    if (s.files.length === 0) {
      s.messages.push({ role: 'user', content: query })
      s.messages.push({ role: 'assistant', isThinking: false, content: 'Please upload documents first before asking questions.', steps: [], stats: '' })
      queryEl!.value = ''
      updateSession(s.idx, { messages: [...s.messages], title: s.title === 'New Chat' ? query.slice(0, 32) + (query.length > 32 ? '…' : '') : s.title })
      return
    }

    const resolvedConfig = getResolvedConfig(config)

    queryEl!.value = ''

    s.messages.push({ role: 'user', content: query })
    if (s.title === 'New Chat') {
      updateSession(s.idx, { title: query.slice(0, 32) + (query.length > 32 ? '…' : '') })
    }

    const thinkingIdx = s.messages.length
    s.messages.push({ role: 'assistant', isThinking: true, content: '', steps: [] })
    setPendingMsgIdx(thinkingIdx)
    setIsRunning(true)
    setStartTime(Date.now())

    updateSession(s.idx, { messages: [...s.messages] })

    const wsHost = apiBase.replace(/^https?:\/\//, '')
    const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws'
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }

    const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws/explore`)
    wsRef.current = ws

    ws.onopen = () => {
      const payload: any = {
        task: query,
        session_id: s.backendSessionId,
        chat_only: false,
        compact_context: compactMode,
      }
      if (resolvedConfig.active) {
        payload.provider = resolvedConfig.provider
        payload.model = resolvedConfig.model
        payload.api_key = resolvedConfig.apiKey
      }
      ws.send(JSON.stringify(payload))
    }

    ws.onmessage = (e) => {
      try {
        pgHandleMessage(JSON.parse(e.data))
      } catch { /* ignore */ }
    }

    ws.onerror = () => pgFinishWithError('Connection failed. Is the server running?')
    ws.onclose = () => { if (isRunning) pgFinish() }

    track('playground-query')
  }, [activeIdx, sessions, apiBase, config, compactMode, isRunning])

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      pgRunAnalysis()
    }
  }

  // Drag-drop
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener('dragover', prevent)
    document.addEventListener('drop', prevent)
    return () => {
      document.removeEventListener('dragover', prevent)
      document.removeEventListener('drop', prevent)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(prev => prev + 1)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(prev => Math.max(0, prev - 1))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(0)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      pgFilesSelected(e.dataTransfer.files)
    }
  }

  const filledSessions = sessions.filter(s => s !== null).length

  const resolvedConfig = getResolvedConfig(config)

  const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`

  return (
    <div className="h-screen pt-[60px] box-border bg-[var(--bg)] overflow-hidden" id="playground-view">
      <div className="flex w-full h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-[240px] min-w-[240px] flex flex-col border-r-2 border-[var(--border)] bg-[var(--bg-alt)] overflow-hidden max-md:hidden">
          <div className="flex items-center justify-between px-[16px] py-[14px] border-b border-[var(--border)] shrink-0">
            <span className="text-[10px] uppercase tracking-[2px] text-[var(--ink-muted)]">Sessions</span>
            <button
              onClick={chatNewSession}
              disabled={filledSessions >= MAX_SESSIONS}
              className="bg-[var(--red)] text-[var(--bg)] border-none px-[10px] py-[4px] font-mono text-[10px] cursor-pointer tracking-[1px] hover:bg-[var(--red-dark)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-[6px]">
            {sessions.map((s, i) => {
              if (!s) return null
              const active = i === activeIdx
              return (
                <div
                  key={i}
                  onClick={() => chatSwitchSession(i)}
                  className={`flex items-center gap-[8px] px-[16px] py-[10px] cursor-pointer border-l-3 border-transparent transition-all ${active ? 'border-l-[var(--red)] bg-[var(--bg)]' : 'hover:bg-[var(--bg)]'}`}
                >
                  <div className={`w-[6px] h-[6px] shrink-0 ${active ? 'bg-[var(--red)]' : 'bg-[var(--border)]'}`} />
                  <div className="flex-1 text-[12px] text-[var(--ink)] overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
                    {s.title}
                  </div>
                  {s.files.length > 0 && (
                    <span className="text-[10px] text-[var(--ink-muted)] whitespace-nowrap">{s.files.length}f</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); chatStartRename(i) }} className="bg-none border-none text-[var(--ink-muted)] cursor-pointer text-[11px] p-0 font-mono opacity-0 group-hover:opacity-100 hover:text-[var(--red)]" title="Rename">✏</button>
                  <button onClick={(e) => { e.stopPropagation(); chatDeleteSession(i) }} className="bg-none border-none text-[var(--ink-muted)] cursor-pointer text-[12px] p-0 font-mono opacity-0 group-hover:opacity-100 hover:text-[var(--red)]" title="Delete">✕</button>
                </div>
              )
            })}
          </div>
          <div className="border-t border-[var(--border)] px-[16px] py-[14px] shrink-0">
            <div className="text-[10px] uppercase tracking-[2px] text-[var(--ink-muted)] mb-[10px]">Model</div>
            <div className="text-[11px] text-[var(--ink-light)] leading-[1.6]">
              {resolvedConfig.active ? (
                <strong className="text-[var(--ink)]">{resolvedConfig.summary}</strong>
              ) : (
                <>
                  <strong className="text-[var(--ink)]">OpenRouter · GPT-5.4 mini</strong><br />
                  <span>Using the hosted default until you add your own API key.</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-[var(--ink-muted)] leading-[1.6] mt-[10px]">No saved key means the platform default is used automatically.</div>
            <button
              onClick={() => navigateTo('configuration', '#configuration')}
              className="w-full bg-[var(--bg)] text-[var(--ink)] border border-[var(--border)] px-[10px] py-[8px] font-mono text-[10px] font-[600] uppercase tracking-[1.4px] cursor-pointer mt-[10px] hover:border-[var(--red)] hover:text-[var(--red)] transition-all"
            >
              Open Configuration
            </button>
          </div>
        </div>

        {/* Chat Main */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative"
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drop overlay */}
          {dragOver > 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(196,93,58,0.08)', border: '3px dashed var(--red)' }}
            >
              <span className="font-serif text-[22px] italic text-[var(--red)]" style={{ fontFamily: "'Instrument Serif', serif" }}>Drop files to upload</span>
            </div>
          )}

          {/* Top bar */}
          <div className="h-[38px] shrink-0 border-b border-[var(--border)] flex items-center px-[20px] gap-[8px] bg-[var(--bg-alt)] text-[11px] text-[var(--ink-muted)] justify-between">
            <div className="flex items-center gap-[8px]">
              <div className={`w-[6px] h-[6px] shrink-0 ${capacity?.available === 0 ? 'bg-[var(--red)]' : 'bg-[var(--success)]'}`} />
              <span>
                {capacity
                  ? capacity.available === 0
                    ? `○ Playground is full (${capacity.active}/${capacity.max}).`
                    : `● ${capacity.available} of ${capacity.max} spots available`
                  : backendReady ? 'Checking availability...' : 'Backend unreachable'}
              </span>
            </div>
            {activeSession && activeSession.files.length > 0 && (
              <button onClick={() => setFilesModalOpen(true)} className="bg-none border border-[var(--border)] font-mono text-[10px] text-[var(--ink-muted)] px-[10px] py-[3px] cursor-pointer flex items-center gap-[4px] hover:border-[var(--red)] hover:text-[var(--red)]">
                📄 <span>{activeSession.files.length}</span> files
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-[32px] py-[24px] flex flex-col gap-[18px] chat-messages">
            {!activeSession || activeSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center px-[40px] py-[60px]">
                <div className="font-serif text-[22px] italic text-[var(--ink-light)] mb-[8px]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {activeSession?.files?.length ? '' : 'Upload documents or start chatting.'}
                </div>
                <div className="text-[12px] text-[var(--ink-muted)]">{activeSession?.files?.length ? '' : 'Drag & drop files here, or use 📎 below.'}</div>
                <div className="flex flex-col gap-[4px] mt-[20px]" style={{ width: '100%', maxWidth: '400px' }}>
                  {['Find cross-reference irregularities', 'Summarize the key findings', 'Identify missing or inconsistent data', 'What are the main risks or red flags?', 'Extract all dates and deadlines'].map((q, i) => (
                    <button key={i} onClick={() => chatUseQuestion(q)}
                      className="bg-transparent border border-[var(--border)] px-[14px] py-[8px] font-mono text-[12px] text-[var(--ink-light)] cursor-pointer text-left transition-all hover:bg-[var(--red-light)] hover:border-[var(--red)] hover:text-[var(--red-dark)]"
                      style={{ '::before': { content: '"→ "', color: 'var(--red)' } } as any}
                    >
                      <span className="text-[var(--red)]">→ </span>{q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeSession.messages.map((msg, mi) => (
                <div key={mi} className={`flex items-start gap-[10px] animate-[msg-in_0.15s_ease] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-[28px] h-[28px] shrink-0 flex items-center justify-center text-[10px] font-[700] ${msg.role === 'user' ? 'bg-[var(--ink)] text-[var(--bg)]' : 'bg-[var(--red)] text-[var(--bg)]'}`}>
                    {msg.role === 'user' ? 'U' : 'RF'}
                  </div>
                  <div className={`max-w-[74%] px-[16px] py-[13px] text-[13px] leading-[1.75] border ${msg.role === 'user'
                    ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]'
                    : 'bg-[var(--bg)] border-l-3 border-[var(--red)] border border-[var(--border)]'
                  }`}>
                    {msg.role === 'assistant' && msg.isThinking ? (
                      <>
                        <div className="flex gap-[4px] items-center py-[4px]">
                          <div className="w-[5px] h-[5px] bg-[var(--ink-muted)] animate-[blink_1.2s_infinite]"></div>
                          <div className="w-[5px] h-[5px] bg-[var(--ink-muted)] animate-[blink_1.2s_infinite]" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-[5px] h-[5px] bg-[var(--ink-muted)] animate-[blink_1.2s_infinite]" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        {msg.steps && msg.steps.length > 0 && (
                          <div className="flex flex-col gap-[3px] mt-[8px]">
                            {msg.steps.map((st, si) => (
                              <div key={si} className={`text-[11px] text-[var(--ink-muted)] px-[8px] py-[2px] border-l-2 ${st.type === 'tool' ? 'border-l-[var(--success)]' : st.type === 'ingest' ? 'border-l-[#0969da]' : st.type === 'verify' ? 'border-l-[var(--success)]' : 'border-l-[var(--border)]'}`}>
                                {st.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : msg.role === 'assistant' ? (
                      <>
                        <div className="chat-bubble-content [&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif [&_h2]:text-[14px] [&_h3]:text-[13px] [&_h1]:text-[16px] [&_h2]:my-[12px] [&_h1]:my-[12px] [&_h3]:my-[12px] [&_h2]:mb-[5px] [&_h1]:mb-[5px] [&_h3]:mb-[5px] [&_h2]:leading-[1.3] [&_h1]:leading-[1.3] [&_h3]:leading-[1.3] [&_ul]:ml-[18px] [&_ol]:ml-[18px] [&_ul]:my-[4px] [&_ol]:my-[4px] [&_ul]:mb-[8px] [&_ol]:mb-[8px] [&_li]:mb-[3px] [&_p]:mb-[8px] [&_p:last-child]:mb-0 [&_hr]:border-none [&_hr]:border-t [&_hr]:border-[var(--border)] [&_hr]:my-[10px] [&_strong]:font-[700] [&_em]:italic [&_code]:bg-[var(--bg-alt)] [&_code]:px-[4px] [&_code]:py-[1px] [&_code]:text-[11px] [&_code]:font-mono"
                          dangerouslySetInnerHTML={{ __html: renderAnswer(msg.content) }}
                        />
                        {msg.steps && msg.steps.length > 0 && (
                          <div className="mt-[12px] pt-[10px] border-t border-[var(--border)]">
                            <button
                              onClick={(e) => {
                                const el = document.getElementById(`steps-log-${mi}`)
                                if (!el) return
                                const show = el.style.display === 'none' || !el.style.display
                                el.style.display = show ? 'flex' : 'none'
                                if (show) el.style.flexDirection = 'column'
                                const btn = e.currentTarget
                                btn.textContent = show ? `▾ ${msg.steps?.length || 0} steps — hide log` : `▸ ${msg.steps?.length || 0} steps — show log`
                              }}
                              className="bg-none border-none font-mono text-[10px] uppercase tracking-[1px] text-[var(--ink-muted)] cursor-pointer p-0 hover:text-[var(--red)]"
                            >
                              ▸ {msg.steps.length} steps — show log
                            </button>
                            <div id={`steps-log-${mi}`} className="flex-col gap-[3px] mt-[8px]" style={{ display: 'none' }}>
                              {msg.steps.map((st, si) => (
                                <div key={si} className={`text-[11px] text-[var(--ink-muted)] px-[8px] py-[2px] border-l-2 ${st.type === 'tool' ? 'border-l-[var(--success)]' : st.type === 'ingest' ? 'border-l-[#0969da]' : st.type === 'verify' ? 'border-l-[var(--success)]' : 'border-l-[var(--border)]'}`}>
                                  {st.text}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {msg.stats && (
                          <div className="mt-[10px] pt-[8px] border-t border-[var(--border)] text-[10px] text-[var(--ink-muted)]">{msg.stats}</div>
                        )}
                      </>
                    ) : (
                      <div>{msg.content}</div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t-2 border-[var(--border)] px-[20px] pt-[12px] pb-[14px] bg-[var(--bg)] shrink-0">
            {activeSession && activeSession.files.length > 0 && (
              <div className="flex flex-wrap gap-[6px] mb-[8px]">
                {activeSession.files.map((f, i) => (
                  <div key={i} className="flex items-center gap-[5px] bg-[var(--bg-alt)] border border-[var(--border)] px-[8px] py-[3px] text-[11px] text-[var(--ink)]">
                    <span>📄 {f.name}</span>
                    <button onClick={() => chatRemoveFile(i)} className="bg-none border-none text-[var(--ink-muted)] cursor-pointer text-[12px] p-0 leading-none font-mono hover:text-[var(--red)]">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-[8px] items-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-none border border-[var(--border)] px-[10px] text-[16px] cursor-pointer text-[var(--ink-muted)] shrink-0 h-[40px] font-mono hover:border-[var(--red)] hover:text-[var(--red)]"
                title="Upload documents"
              >
                📎
              </button>
              <textarea
                id="pg-query-input"
                rows={2}
                placeholder="Ask about your documents, or chat directly… (Enter to send, Shift+Enter for newline)"
                onKeyDown={handleKeyDown}
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] px-[14px] py-[10px] font-mono text-[13px] text-[var(--ink)] resize-none min-h-[40px] max-h-[160px] leading-[1.5] overflow-y-auto placeholder:text-[var(--ink-muted)] placeholder:italic focus:outline-none focus:border-[var(--ink)]"
              />
              <div className="flex flex-col gap-[4px] shrink-0">
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  className={`compact-toggle h-[32px] px-[10px] font-mono text-[9px] uppercase tracking-[1px] cursor-pointer whitespace-nowrap transition-all ${compactMode ? 'bg-[var(--red-light)] border-[var(--red)] text-[var(--red-dark)]' : 'bg-transparent text-[var(--ink-muted)] border border-[var(--border)] hover:bg-[var(--bg-alt)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
                  title={compactMode ? 'Compact ON: trimmed summaries sent to LLM (faster, lower quality). Click to disable.' : 'Compact context: send trimmed document summaries to save LLM tokens. Off = send full context (better quality).'}
                >
                  ⊟ Compact
                </button>
                <button
                  onClick={pgRunAnalysis}
                  disabled={isRunning}
                  className="h-[32px] bg-[var(--red)] text-[var(--bg)] border-none px-[14px] font-mono text-[10px] uppercase tracking-[1px] cursor-pointer whitespace-nowrap hover:bg-[var(--red-dark)] disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Full agent analysis of documents"
                >
                  ⚙ Analyze
                </button>
              </div>
            </div>
            <div className="text-[10px] text-[var(--ink-muted)] mt-[6px] tracking-[0.3px]">⚙ Full agent analysis · 📎 Upload files · ⊟ Compact context (off by default)</div>
          </div>
        </div>
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.zip"
        style={{ display: 'none' }}
        onChange={e => pgFilesSelected(e.target.files)}
      />

      {/* Files Modal */}
      {filesModalOpen && (
        <div
          className="fixed inset-0 z-[3000] flex items-start justify-end"
          style={{ background: 'rgba(26,26,26,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setFilesModalOpen(false) }}
        >
          <div className="mt-[50px] mr-[20px] bg-[var(--bg)] border-2 border-[var(--ink)] min-w-[260px] max-w-[340px] shadow-[4px_4px_0_var(--ink)]">
            <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-[var(--border)] bg-[var(--bg-alt)]">
              <span className="text-[10px] uppercase tracking-[2px] text-[var(--ink-muted)]">Uploaded Files</span>
              <div className="flex gap-[8px] items-center">
                <button onClick={() => fileInputRef.current?.click()} className="bg-none border-none text-[var(--ink-muted)] cursor-pointer text-[14px] px-[10px] py-[4px] font-mono hover:text-[var(--red)]">+ Add</button>
                <button onClick={() => setFilesModalOpen(false)} className="bg-none border-none text-[var(--ink-muted)] cursor-pointer text-[14px] p-0 font-mono hover:text-[var(--red)]">✕</button>
              </div>
            </div>
            <div className="py-[10px] max-h-[300px] overflow-y-auto">
              {activeSession && activeSession.files.length > 0 ? (
                activeSession.files.map((f, i) => (
                  <div key={i} className="flex items-center gap-[8px] px-[14px] py-[7px] text-[12px] border-b border-[var(--border)] last:border-b-0">
                    <span style={{ flex: 1 }}>📄 {f.name}</span>
                    <button onClick={() => { chatRemoveFile(i); }} className="bg-none border-none text-[var(--ink-muted)] cursor-pointer text-[12px] font-mono hover:text-[var(--red)]">✕</button>
                  </div>
                ))
              ) : (
                <div className="px-[14px] py-[20px] text-[12px] text-[var(--ink-muted)]">No files uploaded yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Human Input Modal */}
      {humanModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center" style={{ background: 'rgba(244,241,235,0.96)' }}>
          <div className="bg-[var(--bg)] border-2 border-[var(--ink)] p-[40px] max-w-[520px] w-[90%] shadow-[6px_6px_0_var(--ink)]">
            <div className="font-serif text-[22px] mb-[20px]" style={{ fontFamily: "'Instrument Serif', serif" }}>Input Required</div>
            <div className="bg-[var(--bg-alt)] border-l-3 border-[var(--red)] px-[16px] py-[14px] mb-[20px] text-[14px] leading-[1.6]">{humanQuestion}</div>
            <textarea
              value={humanResponse}
              onChange={e => setHumanResponse(e.target.value)}
              placeholder="Your response..."
              className="w-full bg-[var(--bg)] border-2 border-[var(--ink)] px-[16px] py-[12px] font-mono text-[14px] resize-y min-h-[80px] mb-[16px] focus:outline-none"
            />
            <button onClick={pgSubmitHuman} className="w-full bg-[var(--red)] text-[var(--bg)] border-2 border-[var(--red)] px-[24px] py-[12px] font-mono text-[11px] uppercase tracking-[2px] cursor-pointer hover:bg-[var(--red-dark)] hover:border-[var(--red-dark)]">Submit Response</button>
          </div>
        </div>
      )}
    </div>
  )
}

function pgFormatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
}
