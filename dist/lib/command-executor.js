import { spawn } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, appendFileSync } from 'fs';
/**
 * Get the shell history file path based on the current shell
 */
function getHistoryFile() {
    const shell = process.env.SHELL || '';
    const home = homedir();
    if (shell.includes('zsh')) {
        return join(home, '.zsh_history');
    }
    else if (shell.includes('bash')) {
        // Check for bash history in common locations
        const bashHistory = join(home, '.bash_history');
        if (existsSync(bashHistory)) {
            return bashHistory;
        }
        // Modern bash might use this location
        const modernBashHistory = join(home, '.local/share/bash/bash_history');
        if (existsSync(modernBashHistory)) {
            return modernBashHistory;
        }
        return bashHistory; // Default fallback
    }
    return null;
}
/**
 * Write command to shell history file
 */
function writeToHistory(command) {
    try {
        const historyFile = getHistoryFile();
        if (!historyFile) {
            return; // Shell not supported or history file not found
        }
        const shell = process.env.SHELL || '';
        const timestamp = Math.floor(Date.now() / 1000);
        if (shell.includes('zsh')) {
            // zsh history format: : timestamp:0;command
            const historyEntry = `: ${timestamp}:0;${command}\n`;
            appendFileSync(historyFile, historyEntry, { flag: 'a' });
        }
        else if (shell.includes('bash')) {
            // bash history format: command (or with timestamp if HISTTIMEFORMAT is set)
            // We'll use simple format for compatibility
            const historyEntry = `${command}\n`;
            appendFileSync(historyFile, historyEntry, { flag: 'a' });
        }
    }
    catch (error) {
        // Silently fail if we can't write to history (file locked, permissions, etc.)
        // This is expected in some cases and shouldn't break the main functionality
    }
}
export async function executeShopifyCommand(command, args, storeHandle, commandString // Full command string for history
) {
    return new Promise((resolve, reject) => {
        // If command is provided, prepend it to args
        const allArgs = command ? [command, ...args] : args;
        // Set up environment variables
        const env = { ...process.env };
        if (storeHandle) {
            env.SHOPIFY_SHOP = storeHandle;
        }
        const shopifyProcess = spawn('shopify', allArgs, {
            stdio: 'inherit',
            shell: false,
            env,
        });
        shopifyProcess.on('close', (code) => {
            // Write to history after command completes
            if (commandString) {
                writeToHistory(commandString);
            }
            resolve(code ?? 0);
        });
        shopifyProcess.on('error', (error) => {
            reject(error);
        });
    });
}
//# sourceMappingURL=command-executor.js.map