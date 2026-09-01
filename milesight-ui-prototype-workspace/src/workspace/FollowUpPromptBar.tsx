import { useState, type FormEvent } from 'react'

export function FollowUpPromptBar() {
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')
  const submit = (event: FormEvent) => { event.preventDefault(); if (!value.trim()) return; setMessage('Manual update mode — AI generation is not connected yet.') }
  return <footer className="follow-up-bar"><form onSubmit={submit}><span>FOLLOW-UP</span><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Tell AI what to change…" /><button type="submit">Update</button></form>{message ? <p>{message}</p> : null}</footer>
}
