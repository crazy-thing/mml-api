import React, { useEffect, useState } from 'react';
import './App.scss';
import Toolbar from './components/Toolbar';
import ApiAuth from './components/ApiAuth';
import { createTemplateModpack, getAllModpacks } from './util/api';
import { authenticateApiKey } from './util/auth';
import Modpack from './components/Modpack';
import ModpackEditor from './components/ModpackEditor';
import VersionEditor from './components/VersionEditor';
import VersionsList from './components/VersionsList';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  const [showCreateModpack, setShowCreateModpack] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');

  const [modpacks, setModpacks] = useState([]);
  const [selectedModpack, setSelectedModpack] = useState(null);

  const fetchModpacks = async () => {
  const mps = await getAllModpacks(`${import.meta.env.VITE_IP}`);
    setModpacks(mps);
  };

  const handleApiAuth = async (apiKey) => {
    var result = await authenticateApiKey(apiKey, `${import.meta.env.VITE_IP}`);
    setAuthenticated(result);
  };

  useEffect(() => {  
    fetchModpacks();
    var apiKey = localStorage.getItem("api-key");
    handleApiAuth(apiKey);  
  }, []);

  const toggleShowCreateModpack = (mp = null) => {
    if (mp != null) {
      setSelectedModpack(mp);
    } else {
      setSelectedModpack(null);
    }
    setShowCreateModpack(!showCreateModpack);
    fetchModpacks();
  };

  const toggleShowVersions = (modpack = null) => {
    if (modpack != null) {
      setSelectedModpack(modpack);
    } else {
      setSelectedModpack(null);
    }
    setShowVersions(!showVersions);
    fetchModpacks();
  };

  const createModpackTemp = async () => {
    try {
      const newModpack = await createTemplateModpack(`${import.meta.env.VITE_IP}`, localStorage.getItem('api-key'));
      setModpacks([...modpacks, newModpack]);
      setSelectedModpack(newModpack);
      setShowCreateModpack(true);
    } catch (error) {
      console.error('Failed to create modpack template:', error);
    }
  };

  const getFilteredModpacks = () => {
    return modpacks.filter((modpack) =>
      modpack.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderModpackRows = (mps) => {
    return mps.map((modpack, index) => {
      if (index % 5 === 0) {
        return (
          <div className="app-modpacks-row" key={`row-${index}`}>
            {mps.slice(index, index + 5).map(renderModpack)}
          </div>
        );
      }
      return null;
    });
  };

  const renderModpack = (modpack) => (
    <Modpack
      key={modpack.id}
      modpack={modpack}
      toggleShowCreateModpack={toggleShowCreateModpack}
      toggleShowVersions={toggleShowVersions}
      fetchModpacks={fetchModpacks}
    />
  );

  return (
    <>
      {authenticated ? (
        <div className='app'>
          <Toolbar toggleShowCreateModpack={createModpackTemp} />

      
          {showCreateModpack && (
              <ModpackEditor toggleShowCreateModpack={toggleShowCreateModpack} modpack={selectedModpack && selectedModpack} setSelectedModpack={setSelectedModpack} />
               /*  <CreateModpack toggleShowCreateModpack={toggleShowCreateModpack} modpack={selectedModpack ? selectedModpack : null} />          */
          )}

          {showVersions && (
            <VersionsList modpack={selectedModpack} toggleVersions={toggleShowVersions} setSelectedModpack={setSelectedModpack} />
          )}



          <div className="app-modpacks">
            {modpacks.length > 0 ? (
              searchTerm ? renderModpackRows(getFilteredModpacks()) : renderModpackRows(modpacks)
            ) : (
              <p className='app-modpacks-none'>No modpacks available.</p>
            )}
          </div>

        </div>
      ) : (
        <ApiAuth setAuthenticated={setAuthenticated} />
      )}

    </>
  )
}

export default App
