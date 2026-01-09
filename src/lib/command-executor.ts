import {spawn} from 'child_process';

export async function executeShopifyCommand(
  command: string,
  args: string[]
): Promise<number> {
  return new Promise((resolve, reject) => {
    // If command is provided, prepend it to args
    const allArgs = command ? [command, ...args] : args;
    
    const process = spawn('shopify', allArgs, {
      stdio: 'inherit',
      shell: false,
    });

    process.on('close', (code) => {
      resolve(code ?? 0);
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}
