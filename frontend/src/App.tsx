import { useState } from 'react';
import SideBar from "./layout/SideBar"
import DashboardLayout from "./layout/DashboardLayout"

function App() {
  const [selectedOption, setSelectedOption] = useState('home');

  return (
    <div className="flex h-screen bg-slate-950">
      <SideBar onSelectOption={setSelectedOption} />
      <div className="flex-1 overflow-auto">
        <DashboardLayout /> 
      </div>
    </div>
  )
}

export default App
