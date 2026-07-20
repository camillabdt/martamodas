import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardList, Clock3, Home, MessageCircle, PackageCheck, Plus, Search, Scissors, Trash2, Users, X } from 'lucide-react'
import { api } from './api'
import logo from './assets-logo.png'

const statuses = {
  aguardando: { label: 'Aguardando', className: 'gray' },
  producao: { label: 'Em produção', className: 'yellow' },
  prova: { label: 'Para prova', className: 'blue' },
  pronta: { label: 'Pronta', className: 'green' },
  entregue: { label: 'Entregue', className: 'dark' },
}

const emptyForm = { customer_name: '', phone: '', piece: '', status: 'aguardando', due_date: '', notes: '', message_sent: false }

function App() {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ active: 0, waiting: 0, production: 0, trial: 0, ready: 0, delivered: 0 })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [ordersData, statsData] = await Promise.all([api.listOrders(search, filter), api.dashboard()])
      setOrders(ordersData)
      setStats(statsData)
    } catch (e) {
      setError(`${e.message} Verifique se o backend está ligado.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer) }, [search, filter])

  const selected = useMemo(() => orders.find(o => o.status === 'prova' || o.status === 'pronta') || orders[0], [orders])

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(order) {
    setEditingId(order.id)
    setForm({ ...order, due_date: order.due_date || '' })
    setModalOpen(true)
  }

  async function save(e) {
    e.preventDefault()
    try {
      const payload = { ...form, due_date: form.due_date || null }
      if (editingId) await api.updateOrder(editingId, payload)
      else await api.createOrder(payload)
      setModalOpen(false)
      await load()
    } catch (e) { setError(e.message) }
  }

  async function changeStatus(id, status) {
    try { await api.updateOrder(id, { status }); await load() } catch (e) { setError(e.message) }
  }

  async function remove(id) {
    if (!window.confirm('Excluir este pedido?')) return
    try { await api.deleteOrder(id); await load() } catch (e) { setError(e.message) }
  }

  function whatsapp(order) {
    const phone = order.phone.replace(/\D/g, '')
    const name = order.customer_name.split(' ')[0]
    const message = `Olá, ${name}! 😊\n\nSua peça (${order.piece}) na Marta Modas Ateliê está pronta para prova.\n\nQuando puder, passe na loja para experimentá-la. Estamos esperando você! ❤️`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const cards = [
    ['Clientes ativos', stats.active, Users], ['Em produção', stats.production, Scissors], ['Para prova', stats.trial, ClipboardList], ['Prontas', stats.ready, CheckCircle2], ['Entregues', stats.delivered, PackageCheck]
  ]

  return <div className="app-shell">
    <aside className="sidebar">
      <img src={logo} className="logo" alt="Marta Modas Ateliê" />
      <nav>
        <button className="nav-item active"><Home size={22}/> Início</button>
        <button className="nav-item" onClick={() => setFilter('')}><Users size={22}/> Clientes</button>
        <button className="nav-item" onClick={() => setFilter('producao')}><Scissors size={22}/> Em produção</button>
        <button className="nav-item" onClick={() => setFilter('prova')}><ClipboardList size={22}/> Para prova</button>
        <button className="nav-item" onClick={() => setFilter('pronta')}><CheckCircle2 size={22}/> Prontas</button>
        <button className="nav-item" onClick={() => setFilter('entregue')}><PackageCheck size={22}/> Entregues</button>
      </nav>
      <div className="sidebar-tip"><MessageCircle size={22}/><div><strong>Atendimento simples</strong><small>Um clique abre o WhatsApp.</small></div></div>
    </aside>

    <main>
      <header className="topbar">
        <div><h1>Olá, bem-vinda! ♡</h1><p>Veja o andamento dos pedidos do seu ateliê.</p></div>
        <button className="primary" onClick={openNew}><Plus/> Novo cliente</button>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="stats-grid">
        {cards.map(([label, value, Icon]) => <div className="stat-card" key={label}><Icon/><strong>{value}</strong><span>{label}</span></div>)}
      </section>

      <section className="content-grid">
        <div className="panel orders-panel">
          <div className="panel-header"><div><h2>Pedidos</h2><p>{filter ? `Filtro: ${statuses[filter]?.label}` : 'Todos os pedidos cadastrados'}</p></div><div className="search"><Search size={19}/><input placeholder="Buscar cliente ou peça" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
          <div className="table-wrap">
            <table><thead><tr><th>Cliente</th><th>Peça</th><th>Status</th><th>Data</th><th>Ações</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="5" className="empty">Carregando...</td></tr> : orders.length === 0 ? <tr><td colSpan="5" className="empty">Nenhum pedido encontrado.</td></tr> : orders.map(order => <tr key={order.id} onDoubleClick={() => openEdit(order)}>
                  <td><strong>{order.customer_name}</strong><small>{order.phone}</small></td><td>{order.piece}</td>
                  <td><select className={`status ${statuses[order.status].className}`} value={order.status} onChange={e => changeStatus(order.id, e.target.value)}>{Object.entries(statuses).map(([key, s]) => <option value={key} key={key}>{s.label}</option>)}</select></td>
                  <td>{order.due_date ? new Date(`${order.due_date}T12:00:00`).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="actions"><button title="WhatsApp" onClick={() => whatsapp(order)}><MessageCircle/></button><button title="Editar" onClick={() => openEdit(order)}><Clock3/></button><button title="Excluir" onClick={() => remove(order.id)}><Trash2/></button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel message-panel">
          <div className="message-title"><MessageCircle/><div><h2>Mensagem pronta</h2><p>Clique para abrir no WhatsApp</p></div></div>
          {selected ? <><div className="message-box">Olá, {selected.customer_name.split(' ')[0]}! 😊<br/><br/>Sua peça <strong>{selected.piece}</strong> na Marta Modas Ateliê está pronta para prova.<br/><br/>Quando puder, passe na loja para experimentá-la.<br/><br/>Estamos esperando você! ❤️</div><button className="primary full" onClick={() => whatsapp(selected)}><MessageCircle/> Enviar mensagem</button></> : <p>Nenhum cliente disponível.</p>}
          <div className="tip"><strong>Dica</strong><span>Confirme sempre a data e o horário com o cliente.</span></div>
        </aside>
      </section>
    </main>

    {modalOpen && <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}><div className="modal" onMouseDown={e => e.stopPropagation()}>
      <div className="modal-header"><div><h2>{editingId ? 'Editar pedido' : 'Novo cliente'}</h2><p>Preencha apenas as informações necessárias.</p></div><button className="icon-button" onClick={() => setModalOpen(false)}><X/></button></div>
      <form onSubmit={save}>
        <label>Nome do cliente<input required value={form.customer_name} onChange={e => setForm({...form, customer_name:e.target.value})}/></label>
        <label>Telefone / WhatsApp<input required placeholder="55999999999" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})}/></label>
        <label>Peça<input required placeholder="Ex.: vestido de festa" value={form.piece} onChange={e => setForm({...form, piece:e.target.value})}/></label>
        <div className="form-row"><label>Status<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}>{Object.entries(statuses).map(([key,s])=><option value={key} key={key}>{s.label}</option>)}</select></label><label>Data prevista<input type="date" value={form.due_date || ''} onChange={e => setForm({...form,due_date:e.target.value})}/></label></div>
        <label>Observações<textarea rows="4" value={form.notes || ''} onChange={e => setForm({...form,notes:e.target.value})}/></label>
        <button className="primary full" type="submit">Salvar</button>
      </form>
    </div></div>}
  </div>
}

export default App
