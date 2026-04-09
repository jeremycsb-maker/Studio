#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lancer le serveur MCP filesystem avec le répertoire du projet comme racine
const projectRoot = join(__dirname, '..', '..');
const args = [
    'npx',
    '-y',
    '@modelcontextprotocol/server-filesystem',
    projectRoot
];

const server = spawn('npx', args, {
    stdio: ['inherit', 'inherit', 'inherit'],
    shell: true
});

server.on('error', (error) => {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    if (code !== 0) {
        console.error(`Le serveur a quitté avec le code ${code}`);
    }
});

// Gérer les signaux de terminaison
process.on('SIGINT', () => server.kill());
process.on('SIGTERM', () => server.kill());