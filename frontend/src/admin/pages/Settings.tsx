import { useState } from 'react'
import { getContent, updateSettings, DEFAULT_SETTINGS, type SiteSettings } from '../store'

type Tab = 'general' | 'reading' | 'discussion' | 'media' | 'aws'

export default function Settings() {
  const [tab, setTab] = useState<Tab>('general')
  const stored = getContent()
  const [settings, setSettings] = useState<SiteSettings>(stored?.settings ?? DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function set(key: keyof SiteSettings, value: string | number | boolean) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'Genel' },
    { id: 'reading', label: 'Okuma' },
    { id: 'discussion', label: 'Tartışma' },
    { id: 'media', label: 'Medya' },
    { id: 'aws', label: '☁ Amazon S3' },
  ]

  return (
    <>
      <div className="a-page-header">
        <h2>Ayarlar</h2>
        <button className="a-btn a-btn-primary" onClick={handleSave}>
          {saved ? '✓ Kaydedildi' : 'Değişiklikleri Kaydet'}
        </button>
      </div>

      <div className="a-filter-tabs" style={{ marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button key={t.id} className={`a-filter-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="a-card">
          <div className="a-card-head"><h3>Genel Ayarlar</h3></div>
          <div className="a-panel">
            <div className="a-form">
              <div className="a-form-row">
                <div className="a-field">
                  <label>Site Adı</label>
                  <input className="a-input" value={settings.siteName} onChange={e => set('siteName', e.target.value)} />
                </div>
                <div className="a-field">
                  <label>Slogan</label>
                  <input className="a-input" value={settings.tagline} onChange={e => set('tagline', e.target.value)} />
                </div>
              </div>
              <div className="a-field">
                <label>Site URL</label>
                <input className="a-input" value={settings.siteUrl} onChange={e => set('siteUrl', e.target.value)} placeholder="https://" />
              </div>
              <div className="a-field">
                <label>Yönetici E-postası</label>
                <input className="a-input" type="email" value={settings.adminEmail} onChange={e => set('adminEmail', e.target.value)} />
              </div>
              <div className="a-field">
                <label>Açıklama</label>
                <textarea className="a-input a-textarea" value={settings.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="a-form-row">
                <div className="a-field">
                  <label>Telefon</label>
                  <input className="a-input" value={settings.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="a-field">
                  <label>Dil</label>
                  <select className="a-input" value={settings.language} onChange={e => set('language', e.target.value)}>
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="a-field">
                <label>Adres</label>
                <textarea className="a-input a-textarea" style={{ minHeight: '60px' }} value={settings.address} onChange={e => set('address', e.target.value)} />
              </div>
              <hr className="a-divider" />
              <p className="a-sidebar-label" style={{ padding: 0 }}>Sosyal Medya</p>
              <div className="a-form-row">
                <div className="a-field"><label>Facebook</label><input className="a-input" value={settings.facebook} onChange={e => set('facebook', e.target.value)} placeholder="https://facebook.com/..." /></div>
                <div className="a-field"><label>Instagram</label><input className="a-input" value={settings.instagram} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/..." /></div>
              </div>
              <div className="a-form-row">
                <div className="a-field"><label>Twitter / X</label><input className="a-input" value={settings.twitter} onChange={e => set('twitter', e.target.value)} placeholder="https://x.com/..." /></div>
                <div className="a-field"><label>YouTube</label><input className="a-input" value={settings.youtube} onChange={e => set('youtube', e.target.value)} placeholder="https://youtube.com/..." /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'reading' && (
        <div className="a-card">
          <div className="a-card-head"><h3>Okuma Ayarları</h3></div>
          <div className="a-panel">
            <div className="a-form">
              <div className="a-field">
                <label>Sayfada Gösterilecek Yazı Sayısı</label>
                <input className="a-input" type="number" value={settings.postsPerPage}
                  onChange={e => set('postsPerPage', Number(e.target.value))} style={{ maxWidth: '120px' }} />
              </div>
              <div className="a-field">
                <label>Tarih Formatı</label>
                <select className="a-input" style={{ maxWidth: '200px' }} value={settings.dateFormat} onChange={e => set('dateFormat', e.target.value)}>
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
              <div className="a-field">
                <label>Saat Dilimi</label>
                <select className="a-input" style={{ maxWidth: '240px' }} value={settings.timeZone} onChange={e => set('timeZone', e.target.value)}>
                  <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'discussion' && (
        <div className="a-card">
          <div className="a-card-head"><h3>Tartışma Ayarları</h3></div>
          <div className="a-panel">
            <div className="a-form">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={settings.allowComments}
                  onChange={e => set('allowComments', e.target.checked)} />
                <span>Yeni yazılarda yorumlara izin ver</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginTop: '1rem' }}>
                <input type="checkbox" checked={settings.moderateComments}
                  onChange={e => set('moderateComments', e.target.checked)} />
                <span>Yorum onayı gereksin (moderasyon)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {tab === 'media' && (
        <div className="a-card">
          <div className="a-card-head"><h3>Medya Ayarları</h3></div>
          <div className="a-panel">
            <p style={{ color: 'rgba(200,215,255,0.5)', fontSize: '0.88rem', margin: '0 0 1rem' }}>
              Şu anda dosyalar tarayıcı belleğinde (base64) saklanmaktadır. Amazon S3 bağlandığında
              tüm dosyalar otomatik olarak buluta yönlendirilecek.
            </p>
            <div className="a-stat" style={{ display: 'inline-block' }}>
              <div className="a-stat-num">{stored?.media.length ?? 0}</div>
              <div className="a-stat-label">Medya Dosyası</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'aws' && (
        <div className="a-card">
          <div className="a-card-head"><h3>Amazon S3 Bağlantısı</h3></div>
          <div className="a-panel">
            <div style={{ padding: '1.5rem', border: '1px dashed rgba(100,180,255,0.25)', borderRadius: '1rem', textAlign: 'center', color: 'rgba(200,215,255,0.5)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>☁</div>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#a8d8ff' }}>Amazon S3 Entegrasyonu</p>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                Bu bölüme AWS Access Key, Secret Key, Bucket adı ve Region girildiğinde<br />
                tüm medya yüklemeleri otomatik olarak Amazon S3'e gönderilecek.<br /><br />
                <strong>Şu anda:</strong> Dosyalar tarayıcı belleğinde saklanıyor.
              </p>
            </div>
            <div className="a-form" style={{ marginTop: '1.5rem', opacity: 0.5, pointerEvents: 'none' }}>
              <div className="a-form-row">
                <div className="a-field"><label>AWS Access Key ID</label><input className="a-input" placeholder="Yakında..." disabled /></div>
                <div className="a-field"><label>AWS Secret Access Key</label><input className="a-input" placeholder="Yakında..." disabled /></div>
              </div>
              <div className="a-form-row">
                <div className="a-field"><label>Bucket Adı</label><input className="a-input" placeholder="parhad-media" disabled /></div>
                <div className="a-field"><label>Region</label><input className="a-input" placeholder="eu-central-1" disabled /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
