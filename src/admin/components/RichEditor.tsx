import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'

type Props = {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichEditor({ content, onChange, placeholder }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Placeholder.configure({ placeholder: placeholder ?? 'İçeriğinizi buraya yazın...' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  function insertImage() {
    if (!imageUrl.trim()) return
    editor?.chain().focus().setImage({ src: imageUrl.trim() }).run()
    setImageUrl('')
    setShowImageInput(false)
  }

  function insertLink() {
    if (!linkUrl.trim()) { editor?.chain().focus().unsetLink().run(); setShowLinkInput(false); return }
    editor?.chain().focus().setLink({ href: linkUrl.trim() }).run()
    setLinkUrl('')
    setShowLinkInput(false)
  }

  function insertVideoEmbed() {
    const url = prompt('Video URL girin (YouTube, Vimeo veya MP4):')
    if (!url) return
    let embedHtml = ''
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]
      if (id) embedHtml = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`
    } else if (url.includes('vimeo.com')) {
      const id = url.match(/vimeo\.com\/(\d+)/)?.[1]
      if (id) embedHtml = `<iframe width="100%" height="400" src="https://player.vimeo.com/video/${id}" frameborder="0" allowfullscreen></iframe>`
    } else {
      embedHtml = `<video controls style="width:100%"><source src="${url}"></video>`
    }
    editor?.chain().focus().insertContent(embedHtml).run()
  }

  const btn = (active: boolean, onClick: () => void, label: string, title?: string) => (
    <button
      type="button"
      title={title ?? label}
      onClick={onClick}
      className={`re-btn${active ? ' re-btn-active' : ''}`}
    >{label}</button>
  )

  return (
    <div className="re-wrap">
      <div className="re-toolbar">
        <div className="re-group">
          {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
          {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'İ')}
          {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'U')}
          {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'S̶')}
          {btn(editor.isActive('highlight'), () => editor.chain().focus().toggleHighlight().run(), '▌', 'Vurgula')}
        </div>
        <div className="re-sep" />
        <div className="re-group">
          {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1')}
          {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2')}
          {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3')}
        </div>
        <div className="re-sep" />
        <div className="re-group">
          {btn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), '⬛', 'Sola Hizala')}
          {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), '▣', 'Ortala')}
          {btn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), '⬛', 'Sağa Hizala')}
        </div>
        <div className="re-sep" />
        <div className="re-group">
          {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '• Liste')}
          {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1. Liste')}
          {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), '❝', 'Alıntı')}
          {btn(editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run(), '</>', 'Kod Bloğu')}
        </div>
        <div className="re-sep" />
        <div className="re-group">
          <button type="button" className={`re-btn${editor.isActive('link') ? ' re-btn-active' : ''}`}
            onClick={() => { setShowLinkInput(v => !v); setShowImageInput(false) }}>🔗 Link</button>
          <button type="button" className="re-btn"
            onClick={() => { setShowImageInput(v => !v); setShowLinkInput(false) }}>🖼 Resim</button>
          <button type="button" className="re-btn" onClick={insertVideoEmbed}>▶ Video</button>
        </div>
        <div className="re-sep" />
        <div className="re-group">
          <button type="button" className="re-btn" onClick={() => editor.chain().focus().undo().run()} title="Geri Al">↩</button>
          <button type="button" className="re-btn" onClick={() => editor.chain().focus().redo().run()} title="Yinele">↪</button>
        </div>
      </div>

      {showLinkInput && (
        <div className="re-popover">
          <input className="a-input" placeholder="https://..." value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertLink()} autoFocus />
          <button className="a-btn a-btn-primary a-btn-sm" type="button" onClick={insertLink}>Ekle</button>
          <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => setShowLinkInput(false)}>İptal</button>
        </div>
      )}

      {showImageInput && (
        <div className="re-popover">
          <input className="a-input" placeholder="Resim URL'si veya Amazon S3 linki..." value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertImage()} autoFocus />
          <button className="a-btn a-btn-primary a-btn-sm" type="button" onClick={insertImage}>Ekle</button>
          <button className="a-btn a-btn-ghost a-btn-sm" type="button" onClick={() => setShowImageInput(false)}>İptal</button>
        </div>
      )}

      <EditorContent editor={editor} className="re-content" />
    </div>
  )
}
