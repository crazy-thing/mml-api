import { deleteIcon } from '../assets/exports'
import { ModpackType } from '../types/Modpack'
import '../styles/Modpack.scss'
import { deleteModpack } from '../util/api'

type ModpackProps = {
  modpack: ModpackType
  fetchModpacks: () => void
  editModpack: (modpack: ModpackType) => void
  editVersions: (modpack: ModpackType) => void
}
const Modpack = ({ modpack, fetchModpacks, editModpack, editVersions }: ModpackProps) => {


  const handleDelete = async (e: any) => {
    e.stopPropagation();
    const confirmDelete = window.confirm('Are you sure you want to delete this modpack?');
    if (confirmDelete) {
        await deleteModpack(modpack.id as string, `${import.meta.env.VITE_IP}`, localStorage.getItem('apiKey') as string);
        console.log("deleted modpack");
        fetchModpacks();
    }
  };

  return (
    <div className='modpack'>
        <div className='modpack__top'>
          <span className={`modpack__top-status ${modpack && modpack.status == "dev" ? "dev" : modpack && modpack.status == "released" ? "released" : "unreleased"}`}> {modpack && modpack.status == "dev" ? "Dev Build" : modpack && modpack.status == "released" ? "Released" : "Un-Released"} </span>
          <img className='modpack__top-delete' src={deleteIcon} onClick={handleDelete} />    
          <img className='modpack__top-thumbnail' src={`${import.meta.env.VITE_UPLOADS}/thumbnails/${modpack && modpack.thumbnail}`} />
        </div>
        <div className='modpack__bottom'>
            <div className='modpack__bottom-button' onClick={() => editModpack(modpack)}> EDIT </div>
            <div className='modpack__bottom-button' onClick={() => editVersions(modpack)}> VERSION </div>
        </div>
    </div>
  )
}

export default Modpack