import * as vscode from 'vscode';
import * as os from 'os';
import { formatDateTime, appendToLogFile } from './utils';

let lastActiveFile: string | undefined;

export function setLastActiveFile(filePath: string | undefined) {
    lastActiveFile = filePath;
}

export function getLastActiveFile(): string | undefined {
    return lastActiveFile;
}

export function onActiveEditorSwitch(editor: vscode.TextEditor | undefined) {
    if (!editor) {
        return;
    }

    const currentFile = editor.document.uri.fsPath;
    
    // Only log if the file has actually changed
    if (currentFile !== lastActiveFile) {
        lastActiveFile = currentFile;
        logSwitchActivity(currentFile);
    }
}

export function logSwitchActivity(filePath: string) {
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    
    const message = `${os.userInfo().username} has switched into the following file: ${filePath}, at this time: ${dateTimeString}\n`;
    
    appendToLogFile(message);
}