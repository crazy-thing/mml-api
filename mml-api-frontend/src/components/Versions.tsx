import React from 'react'
import "../styles/Versions.scss"
import { ModpackType, VersionType } from '../types/Modpack'
import { edit, eye, eyeDark, star, starWhite, trash2 } from '../assets/exports'
import { editModpack } from '../util/api'
import VersionEditor from './VersionEditor'

interface VersionsProps {
    versions: VersionType[]
    modpack: ModpackType
    setShowVersions: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedModpack: React.Dispatch<React.SetStateAction<ModpackType>>
}
// fix handleMain and toggleVisibility

const Versions = ({modpack, setShowVersions, setSelectedModpack }: VersionsProps) => {

    const [selectedVersion, setSelectedVersion] = React.useState<VersionType | null>(null);
    const [, setProgress] = React.useState<number>(0);
    const [, setVers] = React.useState<VersionType[]>([]);
    const [showVersionEditor, setShowVersionEditor] = React.useState<boolean>(false);


    const sortedVersions = [...(modpack.versions ?? [])].sort((a, b) => {
        try {
            if (modpack.mainVersion && a.id === modpack.mainVersion.id) return -1;
            if (modpack.mainVersion && b.id === modpack.mainVersion.id) return 1;
        
            const versionA = (a.name ?? '').split('.').map(Number);
            const versionB = (b.name ?? '').split('.').map(Number);
        
            for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
                if ((versionA[i] || 0) > (versionB[i] || 0)) return -1;
                if ((versionA[i] || 0) < (versionB[i] || 0)) return 1;
            }
            return 0;            
        } catch (error) {
            console.error(error);
            return 0; // Default return value in case of an error
        }
    });


    const handleSave = async (item: keyof ModpackType, value: string | File | VersionType | VersionType[] | null) => {
        console.log("Saving", { [item]: value });
        const res = await editModpack(
            modpack.id as string,
            { [item]: value },
            `${import.meta.env.VITE_IP}/`,
            localStorage.getItem('api-key') as string,
            setProgress
        ) as { updatedModpack: ModpackType };

        setSelectedModpack(res.updatedModpack);

        console.log("New pack", res.updatedModpack);
    }

    const handleDelete = async (e: any, versionId: string) => {
        e.stopPropagation();
        const confirmDelete = window.confirm("Are you sure you want to delete this version?");
        if (!confirmDelete) return;
    
        try {
            const updatedVersions = (modpack.versions ?? []).filter((version) => version.id !== versionId);
    
            await handleSave('versions', updatedVersions);
    
            setVers(updatedVersions);
    
            if (selectedVersion?.id === versionId) {
                setSelectedVersion(null);
            }
            
            console.log(`Version with ID ${versionId} deleted successfully.`);
        } catch (error) {
            console.error("Failed to delete version:", error);
        }
    };
    
    
    const handleMainVersion = async (e: any, version: VersionType) => {
        e.stopPropagation();
        if (modpack && modpack.mainVersion && modpack.mainVersion.id == version.id) {
            await handleSave('mainVersion', null); 
        } else {
            await handleSave('mainVersion', version);
        }
    }

    const toggleVisibility = async (e: any, versionId: string) => {
        e.stopPropagation();
        const updatedVersions = (modpack.versions ?? []).map((version) => {
            if (version.id === versionId) {
                const updatedVersion = { ...version, visible: version.visible === "true" ? "false" : "true" };
                setSelectedVersion(updatedVersion);
                return updatedVersion;
            }
            return version;
        });
    
        await handleSave('versions', updatedVersions);
    };

    const addNewVersion = () => {
        setSelectedVersion(null);
        setShowVersionEditor(true);
    }

    const editVersion = (version: VersionType) => {
        setSelectedVersion(version);
        setShowVersionEditor(true);
    }

    return (
        <div className='versions'>

            {showVersionEditor && <VersionEditor setShowVersionEditor={setShowVersionEditor} modpackId={modpack.id} setSelectedModpack={setSelectedModpack} modpack={modpack} ver={selectedVersion || undefined} setSelectedVersion={setSelectedVersion} />}

            <div className='versions__top'>
                <span className='versions__top-button' onClick={() => setShowVersions(false)}>GO BACK</span>
                <span className='versions__top-button blue' onClick={() => addNewVersion()}>ADD NEW VERSION</span>
            </div>

            <div className='versions__bottom'>
                <div className='versions__bottom__left'>
                    <div className='versions__bottom__left-table-wrapper'>
                    <table className='versions__bottom__left-table'>
                        <thead>
                            <tr className='versions__bottom__left-table-head'>
                                <th className='empty-left'></th>
                                <th className='left-round'></th>
                                <th>Version #</th>
                                <th>Version Zip</th>
                                <th className='right-round'>Pin</th>
                                <th className='empty-right'></th>
                            </tr>
                        </thead>
                        <tbody className='versions__bottom__left-table-body'>
                            {(sortedVersions ?? []).map((ver, index) => (
                                <tr key={index} className='versions__bottom__left-table-body-row' onClick={() => setSelectedVersion(ver)}>
                                    <td className='empty eye' >
                                        <img 
                                            src={ver.visible === "true" ? eye : eyeDark}
                                            className='versions__bottom__left-table-body-row-left'
                                            onClick={(e) => toggleVisibility(e, ver.id ?? '')}
                                            alt="Visibility"                                            
                                        />
                                    </td>
                                    <td onClick={() => setSelectedVersion(ver)}>
                                        <img src={edit} alt="Edit" onClick={() => editVersion(ver)}/>
                                    </td>
                                    <td>{ver.name}</td>
                                    <td >{ver.zip}</td>
                                    <td className='right-round'>
                                        <img 
                                            src={modpack && modpack.mainVersion && modpack.mainVersion.zip === ver.zip  ? star  : starWhite}
                                            onClick={(e) => handleMainVersion(e, ver)}
                                            alt="Pin"
                                        />
                                    </td>
                                    <td className='empty trash' >
                                        <img 
                                            src={trash2}
                                            className='versions__bottom__left-table-body-row-right'
                                            alt="Delete"
                                            onClick={(e) => handleDelete(e, ver.id ?? '')}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className='versions__bottom__right'>
                    <div className='versions__bottom__right-changelog'>
                        <span className='versions__bottom__right-changelog-title'>Changelog</span>
                        <div className='versions__bottom__right-changelog-text'>
                            <span 
                                className='versions__bottom__right-changelog-text-content'
                                dangerouslySetInnerHTML={{ __html: selectedVersion?.changelog || '' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

                /* 
        <div className='versions'>
            <div className='versions__top'>
                <span className='versions__top-button'>GO BACK</span>
                <span className='versions__top-button blue'>ADD NEW VERSION</span>
            </div>

            <div className='versions__bottom'>
                <div className='versions__bottom__left'>
                    <table className='versions__bottom__left-table'>
                        <thead>
                            <tr className='versions__bottom__left-table-head'>
                                <th className='empty-left'></th>
                                <th className='left-round'></th>
                                <th>Version #</th>
                                <th>File</th>
                                <th className='right-round'>Pin</th>
                                <th className='empty-right'></th>
                            </tr>
                        </thead>
                        <tbody className='versions__bottom__left-table-body'>
                            {sortedVersions.map((version, index) => (
                                <tr key={index} className='versions__bottom__left-table-body-row' onClick={() => setSelectedVersion(version)}>
                                    <td className='empty'><img src={version.visible == "true" ? eye : eyeDark} className='versions__bottom__left-table-body-row-left' /></td>
                                    <td><img src={edit} alt="Edit" /></td>
                                    <td>{version.name}</td>
                                    <td>{version.zip}</td>
                                    <td className='right-round'>
                                        <img  src={isMainVersion(version.id ?? '') ? star : starWhite} alt="Pin" />
                                    </td>
                                    <td className='empty'><img src={trash2} className='versions__bottom__left-table-body-row-right'/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='versions__bottom__right'>
                    <div className='versions__bottom__right-changelog'>
                        <span className='versions__bottom__right-changelog-title'>Changelog</span>
                        <div className='versions__bottom__right-changelog-text'>
                            <span className='versions__bottom__right-changelog-text-content' dangerouslySetInnerHTML={{__html: selectedVersion?.changelog || '' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        */
    )
}

export default Versions
