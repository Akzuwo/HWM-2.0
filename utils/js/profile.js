/* Profile page logic: load /api/me, allow class change and account deletion */
(function () {
  'use strict'

  async function apiFetch(path, method = 'GET', body = null) {
    const opts = { method, credentials: 'include', headers: {} }
    if (body !== null) {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
    const res = await fetch(path, opts)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      const err = new Error(j.message || 'Request failed')
      err.info = j
      throw err
    }
    return res.json()
  }

  function el(id) { return document.getElementById(id) }

  async function loadProfile() {
    try {
      const resp = await apiFetch('/api/me')
      if (resp.status !== 'ok') throw new Error(resp.message || 'failed')
      const data = resp.data
      el('profile-email').textContent = data.email || '—'
      if (data.account_age_days != null) {
        el('profile-age').textContent = `${data.account_age_days} Tage`
      } else {
        el('profile-age').textContent = '–'
      }
      el('profile-class-input').value = data.class_id || ''

      if (data.last_class_change) {
        const last = new Date(data.last_class_change)
        const nextAllowed = new Date(last.getTime() + 30 * 24 * 3600 * 1000)
        const now = new Date()
        if (now < nextAllowed) {
          const days = Math.ceil((nextAllowed - now) / (24 * 3600 * 1000))
          el('class-cooldown-msg').textContent = `Klasse kann erst in ${days} Tagen erneut geändert werden.`
          el('change-class-btn').disabled = true
        } else {
          el('class-cooldown-msg').textContent = ''
          el('change-class-btn').disabled = false
        }
      } else {
        el('class-cooldown-msg').textContent = ''
        el('change-class-btn').disabled = false
      }
    } catch (err) {
      console.error('Failed to load profile', err)
      window.showToast && window.showToast('Fehler beim Laden des Profils')
    }
  }

  async function changeClass() {
    const val = el('profile-class-input').value.trim() || null
    if (!val) {
      window.showToast && window.showToast('Bitte eine Klasse angeben')
      return
    }
    try {
      await apiFetch('/api/me', 'PUT', { class_id: val })
      window.showToast && window.showToast('Klasse erfolgreich geändert')
      setTimeout(() => loadProfile(), 400)
    } catch (err) {
      console.error('Failed to change class', err)
      const msg = err.info && err.info.message ? err.info.message : err.message
      window.showToast && window.showToast(`Fehler: ${msg}`)
    }
  }

  async function deleteAccount() {
    if (!confirm('Möchten Sie Ihr Konto wirklich dauerhaft löschen?')) return
    try {
      await apiFetch('/api/me', 'DELETE')
      window.showToast && window.showToast('Account gelöscht')
      // redirect to home
      setTimeout(() => { window.location.href = '/' }, 800)
    } catch (err) {
      console.error('Failed to delete account', err)
      window.showToast && window.showToast('Fehler beim Löschen des Accounts')
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const changeBtn = el('change-class-btn')
    const deleteBtn = el('delete-account-btn')
    changeBtn && changeBtn.addEventListener('click', changeClass)
    deleteBtn && deleteBtn.addEventListener('click', deleteAccount)
    loadProfile()
  })

})()
