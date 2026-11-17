import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Search, SlidersHorizontal, Heart, Menu, X, Sparkles, ShoppingBag, BriefcaseBusiness, Laptop, Palette, Camera, Code2, Sofa, ChevronDown, Plus, ShieldCheck, UserRound, LogOut, CheckCircle2 } from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const categories = [
  { name: 'Everything', icon: Sparkles },
  { name: 'Physical goods', icon: ShoppingBag },
  { name: 'Digital products', icon: Laptop },
  { name: 'Services', icon: BriefcaseBusiness },
  { name: 'Websites & apps', icon: Code2 },
  { name: 'Art & design', icon: Palette },
]
const listings = [
  { id: 1, title: 'The Sunday Lounge Chair', category: 'Physical goods', type: 'Goods', price: 280, old: 340, seller: 'Studio North', rating: '4.9', reviews: 28, location: 'Nairobi, Kenya', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=85', tag: 'Handpicked', description: 'A beautifully made lounge chair with a sculptural silhouette, warm timber legs and soft neutral upholstery. A timeless piece for a thoughtful space.' },
  { id: 2, title: 'Minimal Portfolio Website', category: 'Websites & apps', type: 'Digital asset', price: 490, seller: 'pixelcraft', rating: '5.0', reviews: 16, location: 'Digital delivery', image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=900&q=85', tag: 'Ready to launch', description: 'A polished, responsive portfolio website for creatives and independent professionals. Includes source files and setup notes.' },
  { id: 3, title: 'Brand Identity Design', category: 'Services', type: 'Service', price: 180, seller: 'Maya Creates', rating: '5.0', reviews: 42, location: 'Remote', image: 'https://images.unsplash.com/photo-1634942536790-2537a3e8e7a5?w=900&q=85', tag: 'Top rated', description: 'A complete visual identity starter: logo direction, colour palette, typography pairing and a concise brand guide.' },
  { id: 4, title: 'Sony WH-1000XM5 Headphones', category: 'Physical goods', type: 'Goods', price: 265, seller: 'Gear Loop', rating: '4.8', reviews: 31, location: 'Nairobi, Kenya', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&q=85', tag: 'Great condition', description: 'Premium noise-cancelling headphones, carefully kept and ready for a new home. Message the seller for collection and delivery options.' },
  { id: 5, title: 'E-commerce Starter Store', category: 'Websites & apps', type: 'Digital asset', price: 850, seller: 'LaunchLab', rating: '4.9', reviews: 12, location: 'Digital transfer', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85', tag: 'Business ready', description: 'A clean starter storefront with product pages, cart UI and a simple admin workflow. Great foundation for a new online business.' },
  { id: 6, title: 'Hand-thrown Ceramic Set', category: 'Physical goods', type: 'Goods', price: 95, seller: 'Earth & Form', rating: '5.0', reviews: 19, location: 'Nairobi, Kenya', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&q=85', tag: 'Small batch', description: 'A small-batch ceramic set with subtle natural texture. Each piece is individually finished by hand.' },
  { id: 7, title: 'SaaS Dashboard UI Kit', category: 'Digital products', type: 'Digital product', price: 49, seller: 'Interface Dept.', rating: '4.9', reviews: 57, location: 'Instant download', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85', tag: 'Popular', description: 'A flexible dashboard UI kit with reusable components, clean layouts and thoughtful states for product teams.' },
  { id: 8, title: 'Product Photography Session', category: 'Services', type: 'Service', price: 220, seller: 'Frame & Light', rating: '5.0', reviews: 23, location: 'Nairobi / Remote', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=85', tag: 'Creative service', description: 'A focused product photography package for small brands. Includes a planning call, edited images and web-ready exports.' },
]
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export default function App() {
  const [category, setCategory] = useState('Everything')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('Featured')
  const [favorites, setFavorites] = useState([])
  const [selected, setSelected] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signup')
  const [role, setRole] = useState('buyer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authMessage, setAuthMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user || !supabase) { setProfile(null); return }
    supabase.from('profiles').select('display_name, role').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [session])

  const visible = useMemo(() => {
    let items = listings.filter(item => (category === 'Everything' || item.category === category) &&
      (item.title + item.seller + item.category + item.description).toLowerCase().includes(query.toLowerCase()))
    if (sort === 'Price: low to high') items = [...items].sort((a,b) => a.price-b.price)
    if (sort === 'Price: high to low') items = [...items].sort((a,b) => b.price-a.price)
    if (sort === 'Top rated') items = [...items].sort((a,b) => Number(b.rating)-Number(a.rating))
    return items
  }, [category, query, sort])

  const toggleFavorite = id => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id])
  const submitAuth = async event => {
    event.preventDefault()
    if (!supabase) { setAuthMessage('Authentication is not connected yet. Add your Supabase project URL and publishable key to the Vercel environment variables.'); return }
    setBusy(true); setAuthMessage('')
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: fullName, requested_role: role } },
        })
        if (error) throw error
        if (data.session) {
          const { error: profileError } = await supabase.from('profiles').upsert({ id: data.user.id, display_name: fullName, role })
          if (profileError) throw profileError
        }
        setAuthMessage(data.session ? 'Your MIXD account is ready. Welcome aboard!' : 'Check your email to confirm your account, then sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setAuthOpen(false)
      }
    } catch (error) { setAuthMessage(error.message || 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }
  const signOut = async () => { await supabase?.auth.signOut(); setSession(null); setProfile(null) }

  return <div className="app-shell">
    <div className="announcement"><span>THE MARKETPLACE FOR WHAT'S NEXT</span><span>Buy it. Build it. Make it yours. <ArrowRight size={13}/></span></div>
    <header className="site-header">
      <a className="wordmark" href="#" onClick={() => {setSelected(null);setCategory('Everything')}}>mixd<span>.</span></a>
      <nav className={mobileMenu ? 'main-nav open' : 'main-nav'}>
        <a href="#explore" onClick={() => setMobileMenu(false)}>Explore</a><a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a><a href="#sell" onClick={() => setMobileMenu(false)}>Start selling</a>
      </nav>
      <div className="header-actions">
        {session ? <><span className="welcome-user">Hi, {profile?.display_name || session.user.email?.split('@')[0]}</span><button className="icon-button" aria-label="Sign out" onClick={signOut}><LogOut size={18}/></button></> :
          <button className="login-link" onClick={() => {setAuthMode('login');setAuthOpen(true)}}>Log in</button>}
        <button className="sell-button" onClick={() => {setAuthMode('signup');setRole('seller');setAuthOpen(true)}}><Plus size={16}/> Sell on MIXD</button>
        <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X/> : <Menu/>}</button>
      </div>
    </header>

    {selected ? <main className="detail-page">
      <button className="back-link" onClick={() => setSelected(null)}>← Back to explore</button>
      <div className="detail-layout"><img className="detail-image" src={selected.image} alt={selected.title}/>
        <div className="detail-copy"><span className="eyebrow">{selected.category} · {selected.type}</span><h1>{selected.title}</h1><div className="rating">★ {selected.rating} <span>({selected.reviews} reviews)</span></div><div className="detail-price">{money(selected.price)}</div><p>{selected.description}</p><div className="seller-card"><div className="seller-avatar">{selected.seller.slice(0,1)}</div><div><b>{selected.seller}</b><small>{selected.location}</small></div><ShieldCheck size={19}/></div><button className="primary-button full" onClick={() => {setAuthMode('login');setAuthOpen(true)}}>Contact seller <ArrowRight size={17}/></button><small className="secure-note"><ShieldCheck size={14}/> Keep your conversations and transactions safe on MIXD.</small></div>
      </div></main> : <>
      <section className="hero"><div className="hero-copy"><div className="hero-kicker"><span className="sparkle-dot"/> A NEW KIND OF MARKETPLACE</div><h1>Find your next<br/><em>something.</em></h1><p>Good things, great talent, fresh ideas. Discover a world of things to buy, skills to hire and digital gems to own.</p><a className="hero-cta" href="#explore">Explore the marketplace <ArrowRight size={17}/></a><div className="hero-proof"><div className="avatar-stack"><i>J</i><i>M</i><i>A</i><i>+</i></div><span>A little bit of everything.<br/><b>All in one place.</b></span></div></div><div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="hero-card card-top"><span>THE GOOD STUFF</span><b>01 / 08</b></div><div className="hero-photo"><img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1000&q=90" alt="Curated modern home interior"/></div><div className="floating-note"><span className="note-icon"><Sparkles size={17}/></span><span><b>Unexpected finds.</b><small>Every scroll tells a story.</small></span></div><div className="hero-stamp">MIX<br/>YOUR<br/>WORLD</div></div><div className="hero-bottom"><span>01 — DISCOVER</span><span>02 — CONNECT</span><span>03 — MAKE IT YOURS</span></div></section>

      <section className="market-section" id="explore"><div className="section-heading"><div><span className="eyebrow">THE MIXD EDIT</span><h2>Explore the good stuff<span>.</span></h2><p>From one-of-a-kind finds to ideas ready to take off.</p></div><span className="result-count">{visible.length.toString().padStart(2,'0')} FINDS</span></div>
        <div className="search-row"><div className="search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search anything. Seriously, anything."/><kbd>⌕</kbd></div><label className="sort-box"><SlidersHorizontal size={17}/><select value={sort} onChange={e=>setSort(e.target.value)}><option>Featured</option><option>Price: low to high</option><option>Price: high to low</option><option>Top rated</option></select><ChevronDown size={15}/></label></div>
        <div className="category-row">{categories.map(({name,icon:Icon})=><button key={name} className={category===name?'category-chip active':'category-chip'} onClick={()=>setCategory(name)}><Icon size={16}/>{name}</button>)}</div>
        <div className="listing-grid">{visible.map(item=><article className="listing-card" key={item.id}><button className="listing-image" onClick={()=>setSelected(item)}><img src={item.image} alt={item.title}/><span className="image-tag">{item.tag}</span></button><button className={favorites.includes(item.id)?'favorite-button saved':'favorite-button'} aria-label="Save listing" onClick={()=>toggleFavorite(item.id)}><Heart size={17} fill={favorites.includes(item.id)?'currentColor':'none'}/></button><div className="listing-info"><div className="listing-meta"><span>{item.category}</span><span>★ {item.rating}</span></div><button className="listing-title" onClick={()=>setSelected(item)}>{item.title}</button><div className="listing-footer"><div><b>{money(item.price)}</b><small>by {item.seller}</small></div><button className="arrow-button" onClick={()=>setSelected(item)} aria-label={'View '+item.title}><ArrowRight size={18}/></button></div></div></article>)}</div>
        {visible.length===0&&<div className="empty-state"><Search size={28}/><h3>No matches just yet.</h3><p>Try another search or browse all categories.</p><button onClick={()=>{setQuery('');setCategory('Everything')}}>Clear filters</button></div>}
      </section>
      <section className="sell-banner" id="sell"><div className="banner-icon"><Sparkles size={24}/></div><div><span className="eyebrow">YOUR THING. YOUR TERMS.</span><h2>Have something worth sharing?</h2><p>Turn your products, skills or digital creations into your next opportunity.</p></div><button onClick={()=>{setAuthMode('signup');setRole('seller');setAuthOpen(true)}}>Start selling <ArrowRight size={17}/></button></section>
      <section className="how-section" id="how-it-works"><span className="eyebrow">SIMPLE BY DESIGN</span><h2>Good things happen when<br/>everything comes together.</h2><div className="how-grid"><div><span>01</span><ShoppingBag/><h3>Discover</h3><p>Browse physical goods, digital products, websites and services in one place.</p></div><div><span>02</span><UserRound/><h3>Connect</h3><p>Find the right person behind the listing and start a conversation.</p></div><div><span>03</span><CheckCircle2/><h3>Make it yours</h3><p>Bring a good find, a new skill or a fresh idea into your world.</p></div></div></section>
      </>}
    <footer className="site-footer"><a className="wordmark" href="#">mixd<span>.</span></a><span>One place. A thousand possibilities.</span><span>© 2026 MIXD Marketplace</span></footer>

    {authOpen&&<div className="modal-backdrop" onClick={()=>setAuthOpen(false)}><section className="auth-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAuthOpen(false)}><X size={19}/></button><div className="modal-mark">mixd<span>.</span></div><span className="eyebrow">{authMode==='signup'?'YOUR NEXT CHAPTER STARTS HERE':'GOOD TO HAVE YOU BACK'}</span><h2>{authMode==='signup'?'Join the mix.':'Welcome back.'}</h2><p>{authMode==='signup'?'Create an account to discover, connect and share.':'Sign in to pick up where you left off.'}</p><form onSubmit={submitAuth}>{authMode==='signup'&&<><label>Your name<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="How should we call you?"/></label><label>I want to<select value={role} onChange={e=>setRole(e.target.value)}><option value="buyer">Discover and buy</option><option value="seller">Sell and offer services</option><option value="both">A bit of both</option></select></label></>}<label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/></label><button className="primary-button full" disabled={busy}>{busy?'Please wait…':authMode==='signup'?'Create account':'Log in'} <ArrowRight size={17}/></button></form>{authMessage&&<div className="auth-message">{authMessage}</div>}<div className="auth-switch">{authMode==='signup'?'Already part of MIXD?':'New around here?'} <button onClick={()=>{setAuthMode(authMode==='signup'?'login':'signup');setAuthMessage('')}}>{authMode==='signup'?'Log in':'Create an account'}</button></div>{!isSupabaseConfigured&&<div className="setup-hint">Demo mode · Connect Supabase to activate secure accounts.</div>}</section></div>}
  </div>
}
