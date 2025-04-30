export type VersionType = {
    name?: string;
    id?: string;
    zip?: string;
    size?: string;
    changelog?: string;
    visible?: string;
    date?: string;
    clean?: string;
}

export type ModpackType = {
    id?: string;
    name?: string;
    index?: string;
    thumbnail?: string | File;
    background?: string | File;
    mainVersion?: VersionType;
    status?: string;
    jvmArgs?: string;
    versions?: VersionType[];    
}