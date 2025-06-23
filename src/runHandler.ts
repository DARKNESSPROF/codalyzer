import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { formatDateTime, appendToLogFile } from './utils';

const runnableExtensions = ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.go', '.rs', '.rb', '.php', '.pl'];

const lastExecutionTime: Map<string, number> = new Map();

let runMode = false;

export function onActiveFileRun(): vscode.Disposable {
  vscode.debug.onDidStartDebugSession(() => {
    runMode = true;
  });

  return vscode.workspace.onDidSaveTextDocument((document) => {
    const filePath = document.fileName;
    const now = Date.now();
    const lastTime = lastExecutionTime.get(filePath) || 0;

    if (now - lastTime > 5000) {
      const fileExtension = path.extname(filePath).toLowerCase();

      if (runnableExtensions.includes(fileExtension)) {
        executeFile(filePath, fileExtension).then(result => {
          logExecution(filePath, result, runMode);
          lastExecutionTime.set(filePath, now);
        }).catch(() => {
        });
      }
    }
  });
}

async function executeFile(
  filePath: string,
  extension: string
): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    let command = '';
    let args: string[] = [];
    const workingDir = path.dirname(filePath);
    const fileName = path.basename(filePath);

    switch (extension) {
      case '.py':
        command = 'python';
        args = [fileName];
        break;
      case '.js':
        command = 'node';
        args = [fileName];
        break;
      case '.ts':
        command = 'ts-node';
        args = [fileName];
        break;
      case '.java':
        command = 'javac';
        args = [fileName];
        break;
      case '.cpp':
      case '.cc':
      case '.cxx':
        command = 'g++';
        args = [fileName, '-o', fileName.replace(extension, '.exe')];
        break;
      case '.c':
        command = 'gcc';
        args = [fileName, '-o', fileName.replace('.c', '.exe')];
        break;
      case '.go':
        command = 'go';
        args = ['run', fileName];
        break;
      case '.rs':
        command = 'rustc';
        args = [fileName];
        break;
      case '.rb':
        command = 'ruby';
        args = [fileName];
        break;
      case '.php':
        command = 'php';
        args = [fileName];
        break;
      case '.pl':
        command = 'perl';
        args = [fileName];
        break;
      default:
        resolve({ success: false, output: `Unsupported file type: ${extension}` });
        return;
    }

    const process = spawn(command, args, {
      cwd: workingDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      const success = code === 0;
      const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
      resolve({ success, output: output || `Process exited with code ${code}` });
    });

    process.on('error', (error) => {
      resolve({ success: false, output: `Execution error: ${error.message}` });
    });

    setTimeout(() => {
      process.kill();
      resolve({ success: false, output: 'Execution timeout' });
    }, 30000);
  });
}

function logExecution(
  filePath: string,
  result: { success: boolean; output: string },
  isDebug: boolean
): void {
  const now = new Date();
  const dateTimeString = formatDateTime(now);
  const username = os.userInfo().username;
  const mode = isDebug ? 'debug' : 'normal';
  const resultStatus = result.success ? 'success' : 'error';

  const message = `${username} ran file: ${filePath} in ${mode} mode with result: ${resultStatus} at ${dateTimeString}\n`;

  appendToLogFile(message);
}
