'use client'

import { useEffect, useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const PROVIDER_MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-5.4-mini', label: 'GPT-5.4 mini' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
  ],
  anthropic: [
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
  ],
}

export interface UserConfig {
  provider: string
  model: string
  apiKey: string
}

export function getResolvedConfig(config: UserConfig) {
  if (!config.apiKey || !config.apiKey.trim()) {
    return { active: false, summary: 'Platform default: OpenRouter · GPT-5.4 mini' }
  }
  const providerLabel = config.provider === 'anthropic' ? 'Anthropic' : 'OpenAI'
  return {
    active: true,
    provider: config.provider === 'anthropic' ? 'claude' : 'openai',
    model: config.model,
    apiKey: config.apiKey.trim(),
    summary: `${providerLabel} · ${config.model}`,
  }
}

export default function Configuration() {
  const [config, setConfig] = useLocalStorage<UserConfig>('redflag-user-config', {
    provider: 'openai',
    model: 'gpt-5.4-mini',
    apiKey: '',
  })
  const [statusMsg, setStatusMsg] = useState('')
  const [statusSaved, setStatusSaved] = useState(false)

  const models = PROVIDER_MODELS[config.provider] || PROVIDER_MODELS.openai

  const handleProviderChange = (provider: string) => {
    const newModels = PROVIDER_MODELS[provider] || PROVIDER_MODELS.openai
    setConfig({ provider, model: newModels[0].value, apiKey: config.apiKey })
  }

  const handleSave = () => {
    setConfig({ ...config })
    setStatusMsg(config.apiKey.trim() ? 'Saved. Your own provider will be used for future runs.' : 'Saved. Platform default is active because no API key is set.')
    setStatusSaved(true)
  }

  const handleReset = () => {
    setConfig({ provider: 'openai', model: 'gpt-5.4-mini', apiKey: '' })
    setStatusMsg('Platform default restored.')
    setStatusSaved(true)
  }

  return (
    <section className="py-[80px] pb-[100px]" id="configuration-view">
      <div className="max-w-[1200px] mx-auto px-[40px]">
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-[2px] items-start max-md:grid-cols-1">
          <div className="border-2 border-[var(--border)] bg-[var(--bg)] p-[32px]">
            <div className="caption">Configuration</div>
            <h2 className="font-serif text-[36px] font-[400] leading-[1.2] mb-[12px] max-md:text-[26px]" style={{ fontFamily: "'Instrument Serif', serif" }}>Select your favourite AI model</h2>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-light)] max-w-[56ch] mb-[28px]">
              RedFlag runs on the platform default out of the box. If you want your own credentials, add an API key and choose a model from OpenAI or Anthropic. Your settings are saved locally in this browser.
            </p>
            <div className="flex flex-col gap-[18px]">
              <div>
                <label className="block text-[10px] uppercase tracking-[2px] text-[var(--ink-muted)] mb-[8px]">Provider</label>
                <select
                  value={config.provider}
                  onChange={e => handleProviderChange(e.target.value)}
                  className="w-full bg-[var(--bg)] border-2 border-[var(--border)] px-[14px] py-[12px] font-mono text-[13px] text-[var(--ink)]"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[2px] text-[var(--ink-muted)] mb-[8px]">Model</label>
                <select
                  value={config.model}
                  onChange={e => setConfig({ ...config, model: e.target.value })}
                  className="w-full bg-[var(--bg)] border-2 border-[var(--border)] px-[14px] py-[12px] font-mono text-[13px] text-[var(--ink)]"
                >
                  {models.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[2px] text-[var(--ink-muted)] mb-[8px]">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Leave blank to use the platform default"
                  className="w-full bg-[var(--bg)] border-2 border-[var(--border)] px-[14px] py-[12px] font-mono text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                />
                <div className="text-[11px] text-[var(--ink-muted)] mt-[8px] leading-[1.6]">
                  When this field is empty, RedFlag falls back to the hosted default: OpenRouter with GPT-5.4 mini.
                </div>
              </div>
              <div className="flex gap-[12px] flex-wrap mt-[4px]">
                <button onClick={handleSave} className="bg-[var(--red)] text-[var(--bg)] border-2 border-[var(--red)] px-[18px] py-[12px] font-mono text-[11px] font-[600] uppercase tracking-[1.6px] cursor-pointer transition-all hover:bg-[var(--red-dark)] hover:border-[var(--red-dark)]">Save Configuration</button>
                <button onClick={handleReset} className="bg-transparent text-[var(--ink)] border-2 border-[var(--ink)] px-[18px] py-[12px] font-mono text-[11px] font-[600] uppercase tracking-[1.6px] cursor-pointer transition-all hover:bg-[var(--ink)] hover:text-[var(--bg)]">Use Platform Default</button>
              </div>
              <div className={`min-h-[20px] text-[11px] ${statusSaved ? 'text-[var(--success)]' : 'text-[var(--ink-muted)]'}`}>
                {statusMsg || '\u00A0'}
              </div>
            </div>
          </div>
          <div className="border-2 border-[var(--border)] bg-[var(--bg-alt)] p-[32px]">
            <div className="text-[11px] uppercase tracking-[1.6px] text-[var(--ink-muted)] mb-[16px]">How It Works</div>
            <div className="flex flex-col gap-[10px]">
              <div className="pl-[14px] relative text-[12px] text-[var(--ink-light)] leading-[1.6] before:content-[''] before:absolute before:top-[9px] before:left-0 before:w-[5px] before:h-[5px] before:bg-[var(--red)]">
                OpenAI and Anthropic are available as user-managed providers from this page.
              </div>
              <div className="pl-[14px] relative text-[12px] text-[var(--ink-light)] leading-[1.6] before:content-[''] before:absolute before:top-[9px] before:left-0 before:w-[5px] before:h-[5px] before:bg-[var(--red)]">
                Your API key never leaves this browser except when sent directly to the RedFlag backend for your run.
              </div>
              <div className="pl-[14px] relative text-[12px] text-[var(--ink-light)] leading-[1.6] before:content-[''] before:absolute before:top-[9px] before:left-0 before:w-[5px] before:h-[5px] before:bg-[var(--red)]">
                If you clear the key, RedFlag uses the hosted default model automatically.
              </div>
            </div>
            <div className="mt-[16px] pt-[16px] border-t border-[var(--border)] text-[12px] text-[var(--ink-light)]">
              <strong>Platform default</strong><br />
              OpenRouter · GPT-5.4 mini
              <dl className="mt-[18px] grid grid-cols-[120px_1fr] gap-[8px_14px] text-[12px] leading-[1.6]">
                <dt className="text-[var(--ink-muted)] uppercase tracking-[1px] text-[10px]">Provider</dt>
                <dd className="text-[var(--ink)]">OpenRouter</dd>
                <dt className="text-[var(--ink-muted)] uppercase tracking-[1px] text-[10px]">Model</dt>
                <dd className="text-[var(--ink)]">openai/gpt-5.4-mini</dd>
                <dt className="text-[var(--ink-muted)] uppercase tracking-[1px] text-[10px]">Access</dt>
                <dd className="text-[var(--ink)]">Hosted by default with no user API key required.</dd>
                <dt className="text-[var(--ink-muted)] uppercase tracking-[1px] text-[10px]">Use case</dt>
                <dd className="text-[var(--ink)]">General document reasoning and contradiction analysis in RedFlag.</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
