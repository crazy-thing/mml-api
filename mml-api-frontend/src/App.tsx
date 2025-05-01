import { useEffect, useState } from 'react'
import './App.scss'
import { add } from './assets/exports'
import Modpack from './components/Modpack';
import { ModpackType } from './types/Modpack';
import { createTemplateModpack, getAllModpacks } from './util/api';
import { authenticateApiKey } from './util/auth';
import ApiAuth from './components/ApiAuth';
import ModpackEditor from './components/ModpackEditor';
import Versions from './components/Versions';

function App() {
  const [authenticated, setAuthenticated] = useState<any>(false);

  const [modpacks, setModpacks] = useState<ModpackType[]>([]);
  const [selectedModpack, setSelectedModpack] = useState<ModpackType>({});
  const [showCreateModpack, setShowCreateModpack] = useState<boolean>(false);
  const [showVersions, setShowVersions] = useState<boolean>(false);


    const createModpackTemp = async () => {
      try {
        const newModpack = await createTemplateModpack(`${import.meta.env.VITE_IP}`, localStorage.getItem('apiKey') as string);
        setModpacks([...modpacks, newModpack]);
        setSelectedModpack(newModpack);
        setShowCreateModpack(true);
      } catch (error) {
        console.error('Failed to create modpack template:', error);
      }
    };

    const editModpack = (modpack: ModpackType) => {
      setSelectedModpack(modpack);
      setShowCreateModpack(true);
    };

    const editVersions = (modpack: ModpackType) => {
      setSelectedModpack(modpack);
      setShowVersions(true);
    };

    const handleApiAuth = async (apiKey: string) => {
      const result = await authenticateApiKey(apiKey, `${import.meta.env.VITE_IP}`);
      if (result) {
        setAuthenticated(true);
        localStorage.setItem('apiKey', apiKey);
      } else {
        setAuthenticated(false);
      }
    };

    const fetchModpacks = async () => {
      const mps = await getAllModpacks(`${import.meta.env.VITE_IP}`);
      setModpacks(mps);
      console.log(mps);
    };

    useEffect(() => {
      const apiKey = localStorage.getItem('apiKey');
      if (apiKey) {
        handleApiAuth(apiKey);
      } else {
        setAuthenticated(false);
      }
    }, []);

    useEffect(() => {
      fetchModpacks();
    }, [selectedModpack]);

    const renderModpack = (modpack: ModpackType) => (
      <Modpack modpack={modpack} key={modpack.id} fetchModpacks={fetchModpacks} editModpack={editModpack} editVersions={editVersions}  />
    );
  
    const renderModpackRows = (mps: ModpackType[]) => {
      const rows = [];
      for (let i = 0; i < mps.length; i += 4) {
        rows.push(
          <div className="app__modpacks-row" key={`row-${i}`}>
            {mps.slice(i, i + 4).map(renderModpack)}
          </div>
        );
      }
      return rows;
    };

  return (
    <>
      {authenticated ? (        
        <div className='app'>
          {showCreateModpack && (
            <ModpackEditor modpack={selectedModpack} fetchModpacks={fetchModpacks} setShowCreateModpack={setShowCreateModpack}  />  
          )}

          {showVersions && (
            <Versions versions={selectedModpack.versions || []} modpack={selectedModpack} setShowVersions={setShowVersions} setSelectedModpack={setSelectedModpack}/>
          )}
        <div className='app__topbar'>
          <div className='app__topbar-create' onClick={createModpackTemp}>
            <img className='app__topbar-create-icon' src={add} />
            <p className='app__topbar-create-text'>Create New Modpack</p>
          </div>

          <p className='app__topbar-header'>CHOOSE A MODPACK:</p>
        </div>

        <div className='app__modpacks'>
          {modpacks.length > 0 ? (
            renderModpackRows(modpacks)
          ) : (
            <p className='app__modpacks-empty'>No modpacks found.</p>
          )}
        </div>

        <p className='app-version'>MML Web API v3.0.0</p>
      </div>
      ) : (
        <ApiAuth setAuthenticated={setAuthenticated} />
      )}
    </>

  )
}

export default App
