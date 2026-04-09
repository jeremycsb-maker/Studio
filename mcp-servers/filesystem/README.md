# Serveur MCP Filesystem

Ce serveur implémente le protocole Model Context Protocol (MCP) pour les opérations sur le système de fichiers.

## Installation

1. Ce serveur est déjà installé dans le projet
2. La configuration est ajoutée dans `cline_mcp_settings.json`

## Utilisation

Le serveur est configuré pour accéder au répertoire du projet Studio.

## Capacités

Ce serveur fournit les outils suivants :

- **read_text_file** - Lire le contenu d'un fichier en texte
- **read_media_file** - Lire un fichier image ou audio
- **read_multiple_files** - Lire plusieurs fichiers simultanément
- **write_file** - Créer ou écraser un fichier
- **edit_file** - Effectuer des éditions sélectives avec correspondance de motifs
- **create_directory** - Créer un nouveau répertoire
- **list_directory** - Lister le contenu d'un répertoire
- **list_directory_with_sizes** - Lister le contenu avec tailles de fichiers
- **move_file** - Déplacer ou renommer fichiers et répertoires
- **search_files** - Rechercher récursivement des fichiers
- **directory_tree** - Obtenir la structure arborescente JSON d'un répertoire
- **get_file_info** - Obtenir les métadonnées d'un fichier/dossier
- **list_allowed_directories** - Lister tous les répertoires accessibles

## Exemple

Pour utiliser ce serveur, assurez-vous que la configuration dans `cline_mcp_settings.json` est correcte :

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": [
        "c:\\Users\\jerem\\Documents\\Projet app\\Studio\\mcp-servers\\filesystem\\index.js"
      ]
    }
  }
}
```

## Notes

- Le serveur nécessite au moins un répertoire autorisé pour fonctionner
- Les opérations sont restreintes aux répertoires spécifiés
- Le serveur supporte le protocole Roots pour une gestion dynamique des répertoires