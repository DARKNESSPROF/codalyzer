import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let logFilePath: string;

export function initializeLogPath(): string {
    const documentsPath = path.join(os.homedir(), 'Documents');
    logFilePath = path.join(documentsPath, 'Activity-Session-Log.txt');
    return logFilePath;
}

export function getLogFilePath(): string {
    return logFilePath;
}

export function formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export function appendToLogFile(message: string) {
    try {
        // Ensure the documents directory exists
        const documentsDir = path.dirname(logFilePath);
        if (!fs.existsSync(documentsDir)) {
            fs.mkdirSync(documentsDir, { recursive: true });
        }

        // Append to log file
        fs.appendFileSync(logFilePath, message, 'utf8');
    } catch (error) {
        console.error('Error writing to log file:', error);
        vscode.window.showErrorMessage(`Failed to write to log file: ${error}`);
    }
}

export function openLogFile() {
    try {
        if (fs.existsSync(logFilePath)) {
            vscode.workspace.openTextDocument(logFilePath).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        } else {
            vscode.window.showInformationMessage('Log file does not exist yet. Start using VS Code to create it.');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to open log file: ${error}`);
    }
}