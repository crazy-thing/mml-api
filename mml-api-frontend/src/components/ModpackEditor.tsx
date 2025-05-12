import { useEffect, useState } from 'react'
import { ModpackType } from '../types/Modpack'
import '../styles/ModpackEditor.scss'
import { star, trash2 } from '../assets/exports'
import { editModpack } from '../util/api'

interface ModpackEditorProps {
    modpack: ModpackType
    fetchModpacks: () => void
    setShowCreateModpack: (show: boolean) => void
}

const ModpackEditor = ({ modpack, fetchModpacks, setShowCreateModpack }: ModpackEditorProps) => {
    const [mp, setMp] = useState<ModpackType>(modpack);
    const [, setProgress] = useState<number>(0);
    const [, setBackgroundFile] = useState<File | null>(null);
    const [, setThumbnailFile] = useState<File | null>(null);

    const handleSave = async (item: keyof ModpackType, value: string | File) => {
        console.log("Saving", { [item]: value });
        const res = await editModpack(
            modpack.id as string,
            { [item]: value },
            `${import.meta.env.VITE_IP}/`,
            localStorage.getItem('apiKey') as string,
            setProgress
        ) as { updatedModpack: ModpackType };

        console.log("New pack", res.updatedModpack);
        setMp(res.updatedModpack);
        fetchModpacks();
    }

    const handleStatusChange = async (status: string) => {
        await handleSave("status", status);
    }

    const handleBackgroundChange = async (event: any) => {
        const file = event.target.files[0];
        const newFile = new File([file], `${file.name}-${Date.now()}`);
        setBackgroundFile(newFile);
        await handleSave("background", newFile);
    };

    const handleThumbnailChange = async (event: any) => {
        const file = event.target.files[0];
        const newFile = new File([file], `${file.name}-${Date.now()}`);
        setThumbnailFile(newFile);
        await handleSave("thumbnail", newFile);
    };

    useEffect(() => {
        if (modpack) {
            setMp(modpack);
        }
        console.log("ModpackEditor mounted", modpack);
    }, [modpack]);

    return (
        <div className='modpack-editor'>
            <div className='modpack-editor__top'>
                <span className='modpack-editor__top-button' onClick={() => setShowCreateModpack(false)}> GO BACK </span>
                <span className='modpack-editor__top-button blue' onClick={() => setShowCreateModpack(false)}> SAVE </span>
            </div>

            <span className='modpack-editor-bg-text'>
                {mp && mp.background ? (
                    <img
                        className='modpack-editor-bg-delete'
                        src={trash2}
                        onClick={() => handleSave("background", "")}
                    />
                ) : (
                    <p
                        onClick={() => {
                            const background = document.getElementById('backgroundInput');
                            if (background) (background as HTMLInputElement).click();
                        }}
                    >
                        CLICK TO UPLOAD
                    </p>
                )}

            </span>


            <div className='modpack-editor__bottom'>
                {mp && mp.background && (
                    <div className='modpack-editor__background-wrapper'>
                        <img
                            className='modpack-editor__background'
                            src={`${import.meta.env.VITE_UPLOADS}/backgrounds/${mp.background}`}
                        />
                    </div>
                )}

                <div className='modpack-editor__bottom-name-wrapper'>
                    <input
                        className='modpack-editor__bottom-name'
                        type="text"
                        placeholder='ADD TITLE'
                        value={mp.name}
                        onBlur={() => handleSave("name", mp.name || "")}
                        onChange={(e) => setMp({ ...mp, name: e.target.value })}
                    />
                </div>

                <div className='modpack-editor__bottom__thumbnail'>

                    <span
                        className='modpack-editor__bottom__thumbnail-button'
                        onClick={() => {
                            const thumbnail = document.getElementById('thumbnailInput');
                            if (thumbnail) (thumbnail as HTMLInputElement).click();
                        }}
                    >
                        {mp && mp.thumbnail ? (
                        <img
                            className='modpack-editor__bottom__thumbnail-image'
                            src={`${import.meta.env.VITE_UPLOADS}/thumbnails/${mp.thumbnail}`}
                        />
                        ) : (
                            <p>CLICK TO UPLOAD</p>
                        )}
                    </span>
                    {mp && mp.thumbnail && (<img src={trash2} className='modpack-editor__bottom__thumbnail-delete' onClick={() => handleSave("thumbnail", "")} /> )}
                </div>

                <div className='modpack-editor__bottom__status'>
                    <p className='modpack-editor__bottom__status-text'> Status</p>
                    {["released", "dev", "unreleased"].map((s) => (
                        <span key={s} className='modpack-editor__bottom__status-option-wrapper'>
                            <span
                                className={`modpack-editor__bottom__status-option ${s === "released" ? "green" : s === "dev" ? "yellow" : ""}`}
                                onClick={() => handleStatusChange(s)}
                            >
                                {s === "released" ? "Released" : s === "dev" ? "Dev Build" : "Un-Released"}
                            </span>
                            {mp.status === s && <img className="modpack-editor__bottom__status-option-icon" src={star} />}
                        </span>
                    ))}
                </div>

                <div className='modpack-editor__bottom__jvm'>
                    <p className='modpack-editor__bottom__jvm-text'>Custom Java Arguments</p>
                    <input
                        className='modpack-editor__bottom__jvm-input'
                        type="text"
                        value={mp.jvmArgs}
                        onBlur={() => handleSave("jvmArgs", mp.jvmArgs || "")}
                        onChange={(e) => setMp({ ...mp, jvmArgs: e.target.value })}
                    />
                </div>

                <input id="thumbnailInput" type="file" onChange={handleThumbnailChange} style={{ display: 'none' }} />
                <input id="backgroundInput" type="file" onChange={handleBackgroundChange} style={{ display: 'none' }} />
            </div>
        </div>
    )
}

export default ModpackEditor
