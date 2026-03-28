import { useState } from 'react'
import TopBar   from './components/TopBar'
import Sidebar  from './components/Sidebar'
import Builder  from './components/Builder'
import Preview  from './components/Preview'
import Catalog  from './components/Catalog'
import AddModal from './components/AddModal'

export default function App() {
  const [tab,        setTab]        = useState('builder')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editSvc,    setEditSvc]    = useState(null)

  const openModal = (svc = null) => { setEditSvc(svc); setModalOpen(true)  }
  const closeModal = ()            => { setEditSvc(null); setModalOpen(false) }

  return (
    <div className="app">
      <TopBar tab={tab} setTab={setTab} />

      <div className="app-body">
        {/* Sidebar tylko w trybie Kreator */}
        {tab === 'builder' && (
          <Sidebar onAddService={() => openModal(null)} />
        )}

        {/* Główna treść */}
        {tab === 'builder' && (
          <Builder onGoPreview={() => setTab('preview')} />
        )}
        {tab === 'preview' && (
          <Preview onBack={() => setTab('builder')} />
        )}
        {tab === 'catalog' && (
          <Catalog onEdit={openModal} />
        )}
      </div>

      {/* Modal dodawania / edycji usługi */}
      {modalOpen && (
        <AddModal service={editSvc} onClose={closeModal} />
      )}
    </div>
  )
}
