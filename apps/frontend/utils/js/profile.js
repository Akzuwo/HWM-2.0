import { resolveApiUrl } from './api-client.js';

/* Profile page logic: load /api/me, allow password updates, and account deletion */
(function () {
  'use strict'

  const i18nScope = window.hmI18n ? window.hmI18n.scope('profile') : null
  const locale = (window.hmI18n && typeof window.hmI18n.getLocale === 'function'
    ? window.hmI18n.getLocale()
    : document.documentElement.lang || 'en')

  const t = (key, fallback) => (i18nScope ? i18nScope(key, fallback) : fallback)

  async function apiFetch(path, method = 'GET', body = null) {
    const opts = { method, credentials: 'include', headers: {} }
    if (body !== null) {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
    const res = await fetch(resolveApiUrl(path), opts)
    const rawText = await res.text().catch(() => '')
    let parsed = null
    try {
      parsed = rawText ? JSON.parse(rawText) : null
    } catch (err) {
      parsed = null
    }

    if (!res.ok || !parsed) {
      const message = (parsed && parsed.message) || 'Request failed'
      const err = new Error(message)
      err.info = parsed || { raw: rawText, status: res.status }
      throw err
    }
    return parsed
  }

  const el = (id) => document.getElementById(id)

  const elements = {
    id: () => el('profile-id'),
    email: () => el('profile-email'),
    classLabel: () => el('profile-class'),
    classId: () => el('profile-class-id'),
    age: () => el('profile-age'),
    created: () => el('profile-created'),
    lastChange: () => el('profile-last-change'),
    passwordForm: () => document.getElementById('password-form'),
    deleteButton: () => el('delete-account-btn'),
    passwordButton: () => el('change-password-btn'),
    passwordEmailStatus: () => el('password-email-status'),
    currentPassword: () => el('current-password'),
    newPassword: () => el('new-password'),
    confirmPassword: () => el('confirm-password'),
    personalForm: () => el('personal-timetable-form'),
    personalList: () => el('personal-timetable-list'),
    personalCount: () => el('personal-timetable-count'),
    personalSave: () => el('personal-timetable-save'),
    personalCancel: () => el('personal-timetable-cancel'),
  }

  const weekdayLabels = { Monday: 'Montag', Tuesday: 'Dienstag', Wednesday: 'Mittwoch', Thursday: 'Donnerstag', Friday: 'Freitag', Saturday: 'Samstag', Sunday: 'Sonntag' }
  let personalEntries = []
  let personalLimit = 5
  let editingPersonalId = null

  function safeText(value) {
    return value === undefined || value === null || value === ''
      ? t('unknownValue', '–')
      : String(value)
  }

  function setText(node, value) {
    if (!node) return
    node.textContent = safeText(value)
  }

  function formatDate(value) {
    if (!value) return t('unknownValue', '–')
    try {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return t('unknownValue', '–')
      return new Intl.DateTimeFormat(locale || undefined, { dateStyle: 'medium' }).format(date)
    } catch (err) {
      return t('unknownValue', '–')
    }
  }

  function formatDays(count) {
    if (count === undefined || count === null || Number.isNaN(count)) {
      return t('unknownValue', '–')
    }
    const days = Math.max(0, Math.round(count))
    if (days === 1) return t('ageDay', '1 day')
    return t('ageDays', '{count} days').replace('{count}', days)
  }

  function formatClass(data) {
    if (!data) return t('unknownValue', '–')
    return data.class_slug || data.class_title || (data.class_id != null ? `#${data.class_id}` : t('unknownValue', '–'))
  }

  async function loadProfile() {
    try {
      const resp = await apiFetch('/api/me')
      if (resp.status !== 'ok') throw new Error(resp.message || 'failed')
      const data = resp.data || {}

      setText(elements.id(), data.id)
      setText(elements.email(), data.email)
      setText(elements.classLabel(), formatClass(data))
      setText(elements.classId(), data.class_id)
      setText(elements.age(), formatDays(data.account_age_days))
      setText(elements.created(), formatDate(data.created_at))
      setText(elements.lastChange(), formatDate(data.last_class_change))
    } catch (err) {
      const info = err && err.info ? err.info : {}
      const status = info.status
      const code = info.message
      if (status === 503 || code === 'database_unavailable') {
        window.showToast && window.showToast(t('loadUnavailable', 'Profile service is temporarily unavailable.'))
        return
      }
      console.error('Failed to load profile', err)
      window.showToast && window.showToast(t('loadError', 'Could not load your profile.'))
    }
  }

  function resetPersonalForm() {
    elements.personalForm()?.reset()
    const day = el('personal-day')
    if (day) day.value = 'Monday'
    editingPersonalId = null
    if (elements.personalSave()) elements.personalSave().textContent = 'Stunde hinzufügen'
    if (elements.personalCancel()) elements.personalCancel().hidden = true
  }

  function renderPersonalEntries() {
    const list = elements.personalList()
    if (!list) return
    list.innerHTML = ''
    if (elements.personalCount()) elements.personalCount().textContent = `${personalEntries.length} von ${personalLimit} Stunden`
    if (!personalEntries.length) {
      const empty = document.createElement('p')
      empty.className = 'profile-help'
      empty.textContent = 'Noch keine eigenen Stunden erfasst.'
      list.appendChild(empty)
      return
    }
    personalEntries.forEach((entry) => {
      const row = document.createElement('div')
      row.className = 'profile-personal-timetable__item'
      const content = document.createElement('div')
      const title = document.createElement('strong')
      title.textContent = entry.fach
      const meta = document.createElement('span')
      meta.textContent = `${weekdayLabels[entry.tag] || entry.tag}, ${(entry.start || '').slice(0, 5)}–${(entry.end || '').slice(0, 5)}${entry.raum ? ` · ${entry.raum}` : ''}`
      content.append(title, meta)
      const actions = document.createElement('div')
      actions.className = 'profile-actions'
      const edit = document.createElement('button')
      edit.type = 'button'; edit.className = 'button ripple'; edit.textContent = 'Bearbeiten'
      edit.addEventListener('click', () => editPersonalEntry(entry))
      const remove = document.createElement('button')
      remove.type = 'button'; remove.className = 'button button--danger ripple'; remove.textContent = 'Löschen'
      remove.addEventListener('click', () => deletePersonalEntry(entry.id))
      actions.append(edit, remove)
      row.append(content, actions)
      list.appendChild(row)
    })
  }

  async function loadPersonalEntries() {
    try {
      const response = await apiFetch('/api/personal-timetable')
      personalEntries = Array.isArray(response.data) ? response.data : []
      personalLimit = Number(response.limit) || 5
      renderPersonalEntries()
    } catch (error) {
      console.error('Failed to load personal timetable', error)
      window.showToast?.('Eigene Stunden konnten nicht geladen werden.')
    }
  }

  function editPersonalEntry(entry) {
    editingPersonalId = entry.id
    el('personal-day').value = entry.tag
    el('personal-subject').value = entry.fach || ''
    el('personal-start').value = (entry.start || '').slice(0, 5)
    el('personal-end').value = (entry.end || '').slice(0, 5)
    el('personal-room').value = entry.raum || ''
    if (elements.personalSave()) elements.personalSave().textContent = 'Änderungen speichern'
    if (elements.personalCancel()) elements.personalCancel().hidden = false
    elements.personalForm()?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }

  async function savePersonalEntry(event) {
    event.preventDefault()
    const payload = {
      tag: el('personal-day')?.value,
      fach: el('personal-subject')?.value.trim(),
      start: el('personal-start')?.value,
      end: el('personal-end')?.value,
      raum: el('personal-room')?.value.trim()
    }
    if (!editingPersonalId && personalEntries.length >= personalLimit) {
      window.showToast?.(`Du kannst höchstens ${personalLimit} eigene Stunden erfassen.`)
      return
    }
    try {
      await withButtonState(elements.personalSave(), () => apiFetch(
        editingPersonalId ? `/api/personal-timetable/${editingPersonalId}` : '/api/personal-timetable',
        editingPersonalId ? 'PUT' : 'POST',
        payload
      ))
      resetPersonalForm()
      await loadPersonalEntries()
      window.showToast?.('Eigene Stunde wurde gespeichert.')
    } catch (error) {
      const message = error.info?.message === 'personal_timetable_limit'
        ? `Du kannst höchstens ${personalLimit} eigene Stunden erfassen.`
        : 'Eigene Stunde konnte nicht gespeichert werden.'
      window.showToast?.(message)
    }
  }

  async function deletePersonalEntry(entryId) {
    if (!confirm('Eigene Stunde wirklich löschen?')) return
    try {
      await apiFetch(`/api/personal-timetable/${entryId}`, 'DELETE')
      if (editingPersonalId === entryId) resetPersonalForm()
      await loadPersonalEntries()
      window.showToast?.('Eigene Stunde wurde gelöscht.')
    } catch (error) {
      window.showToast?.('Eigene Stunde konnte nicht gelöscht werden.')
    }
  }

  function withButtonState(button, callback) {
    if (!button) return callback()
    const originalContent = button.innerHTML
    button.disabled = true
    return Promise.resolve()
      .then(callback)
      .finally(() => {
        button.disabled = false
        button.innerHTML = originalContent
      })
  }

  async function changePassword(event) {
    if (event) event.preventDefault()
    const current = elements.currentPassword() && elements.currentPassword().value.trim()
    const next = elements.newPassword() && elements.newPassword().value.trim()
    const confirm = elements.confirmPassword() && elements.confirmPassword().value.trim()
    const button = elements.passwordButton()
    const status = elements.passwordEmailStatus()
    if (status) status.textContent = ''

    if (!current || !next || !confirm) {
      window.showToast && window.showToast(t('passwordMissing', 'Please fill in all password fields.'))
      return
    }
    if (next !== confirm) {
      window.showToast && window.showToast(t('passwordMismatch', 'The new passwords do not match.'))
      return
    }
    if (next.length < 8) {
      window.showToast && window.showToast(t('passwordChangeWeak', 'The password is too weak.'))
      return
    }

    await withButtonState(button, async () => {
      try {
        const resp = await apiFetch('/api/me/password', 'POST', { current_password: current, new_password: next })
        const emailSent = resp && resp.email_sent !== false
        window.showToast && window.showToast(t('passwordChangeSuccess', 'Password updated successfully.'))
        if (status) {
          status.textContent = emailSent
            ? t('passwordEmailSuccess', 'We sent you a confirmation email.')
            : t('passwordEmailFailure', 'Password updated, but the confirmation email could not be sent.')
        }
        const form = elements.passwordForm()
        form && form.reset()
      } catch (err) {
        console.error('Failed to change password', err)
        const code = err.info && err.info.message
        let message = t('passwordChangeError', 'Could not change the password.')
        if (code === 'invalid_current_password') {
          message = t('passwordChangeInvalidCurrent', 'Current password is incorrect.')
        } else if (code === 'weak_password') {
          message = t('passwordChangeWeak', 'The password is too weak.')
        } else if (code === 'password_unchanged') {
          message = t('passwordChangeUnchanged', 'Please choose a different password.')
        } else if (code === 'password_required' || code === 'current_password_required') {
          message = t('passwordMissing', 'Please fill in all password fields.')
        }
        window.showToast && window.showToast(message)
      }
    })
  }

  async function deleteAccount() {
    const confirmation = t('deleteConfirm', 'Do you really want to permanently delete your account?')
    if (!confirm(confirmation)) return
    const button = elements.deleteButton()

    await withButtonState(button, async () => {
      try {
        await apiFetch('/api/me', 'DELETE')
        window.showToast && window.showToast(t('deleteSuccess', 'Account deleted.'))
        setTimeout(() => {
          if (typeof window.hmNavigate === 'function') window.hmNavigate('/')
          else window.location.href = '/'
        }, 800)
      } catch (err) {
        console.error('Failed to delete account', err)
        window.showToast && window.showToast(t('deleteError', 'Could not delete the account.'))
      }
    })
  }

  document.addEventListener('DOMContentLoaded', function () {
    const passwordForm = elements.passwordForm()
    const deleteBtn = elements.deleteButton()
    const personalForm = elements.personalForm()

    passwordForm && passwordForm.addEventListener('submit', changePassword)
    deleteBtn && deleteBtn.addEventListener('click', deleteAccount)
    personalForm && personalForm.addEventListener('submit', savePersonalEntry)
    elements.personalCancel()?.addEventListener('click', resetPersonalForm)

    loadProfile()
    loadPersonalEntries()
  })

})()
