#!/bin/bash
set -ex

BACKUP_DIR=backups/$(date "+%Y-%m-%d %H:%M")
mkdir -p "${BACKUP_DIR}"
mongodump -o "${BACKUP_DIR}"

