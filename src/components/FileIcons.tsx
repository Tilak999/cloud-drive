import { Icon } from "@chakra-ui/react";
import { FaFileVideo, FaFileAudio, FaFileImage, FaFileArchive, FaFilePdf, FaMicrochip } from "react-icons/fa";
import { GoFile, GoFileDirectory } from "react-icons/go";

export default function FileIcon({ filename, mimeType }) {
    const videoFileExts = ["mkv", 'mp4', 'avi', 'mov', 'flv'];
    const audioFileExts = ["m4a", "flac", "wav", "mp3", "wma", "acc"];
    const archiveFileExts = ['7z', 'zip', 'bz2', 'tar', 'rar', 'deb'];
    const appFileExts = ['apk', 'ipa']
    const pdfFileExts = ['pdf']
    const imageFileExts = ['jpeg', 'png', 'svg', 'gif', 'avif'];
   
    const chunks = filename.split(".");
    const ext = chunks[chunks.length - 1].toLowerCase();

    if (mimeType.endsWith("folder"))
        return <Icon as={GoFileDirectory} boxSize="6" verticalAlign={"bottom"} />;
    else {
        let icon = GoFile;
        if (videoFileExts.indexOf(ext) > -1) icon = FaFileVideo;
        else if (audioFileExts.indexOf(ext) > -1) icon = FaFileAudio;
        else if (imageFileExts.indexOf(ext) > -1) icon = FaFileImage;
        else if (pdfFileExts.indexOf(ext) > -1) icon = FaFilePdf;
        else if (appFileExts.indexOf(ext) > -1) icon = FaMicrochip;
        else if (archiveFileExts.indexOf(ext) > -1) icon = FaFileArchive;
        return <Icon as={icon} boxSize="6" verticalAlign={"bottom"} />;
    }
}
