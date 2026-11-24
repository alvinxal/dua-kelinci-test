import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons'
import type { Insights, Row } from './analyze'
import { answer, QUESTIONS, type QId } from './chat'
import type { Lang } from './i18n'

type Msg = { from: 'bot' | 'me'; text: string }
type Props = { ins: Insights; rows: Row[]; lang: Lang; filtered: boolean; cleaning: Parameters<typeof answer>[1]['cleaning'] }

export default function Chat({ ins, rows, lang, filtered, cleaning }: Props) {
  const id = lang === 'id'
  const hello = id ? 'Halo! Saya bisa menjawab pertanyaan seputar data penjualan ini. Pilih salah satu pertanyaan di bawah.' : 'Hi! I can answer questions about this sales data. Pick one of the questions below.'
  const [open, setOpen] = useState(() => location.hash === '#chat')
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: hello }])
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs, open, busy])
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  function ask(q: QId, label: string) {
    if (busy) return
    setMsgs(m => [...m, { from: 'me', text: label }])
    setBusy(true)
    // Answer is computed when sent, from the data on screen at that moment.
    const text = answer(q, { ins, rows, lang, filtered, cleaning })
    setTimeout(() => { setMsgs(m => [...m, { from: 'bot', text }]); setBusy(false) }, 450)
  }

  return (
    <>
      {open && (
        <section className="chat" role="dialog" aria-label={id ? 'Tanya data' : 'Ask the data'}>
          <header className="chat-head">
            <b>{id ? 'Tanya data' : 'Ask the data'}</b>
            <button className="icon light" onClick={() => setOpen(false)} aria-label={id ? 'Tutup' : 'Close'}><FontAwesomeIcon icon={faTimes} /></button>
          </header>
          <div className="chat-body" aria-live="polite">
            {msgs.map((m, i) => <p key={i} className={'bubble ' + m.from}>{m.text}</p>)}
            {busy && <p className="bubble bot typing" aria-label="…"><span /><span /><span /></p>}
            <div ref={end} />
          </div>
          <div className="chat-chips">
            {QUESTIONS.map(q => {
              const label = id ? q.id_ : q.en
              return <button key={q.id} className="chip" disabled={busy} onClick={() => ask(q.id, label)}><FontAwesomeIcon icon={faPaperPlane} /> {label}</button>
            })}
          </div>
        </section>
      )}
      <button className="chat-fab" onClick={() => setOpen(o => !o)} aria-label={id ? 'Buka chat' : 'Open chat'} aria-expanded={open}>
        <FontAwesomeIcon icon={open ? faTimes : faComments} />
      </button>
    </>
  )
}
