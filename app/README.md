# AGENZIA MATRIMONIALE - BONOLDI ENRICO

L'applicazione è basata su nodejs.
Per ridurre il numero di dipendenze non sono implementati librerie (```cliProgress``` ...) quindi per il setup del database basta una semplice installazione di nodejs.

## REQUIREMENTS

- nodejs (testato con v.11)

- postgres (testato con pg v.11) 
  - estensione GIS postGIS 

# DB SETUP

1. Creare il database *agenzia_matrimoniale*;
2. eseguire il comando :``` ./db/create_db.js agenzia_matrimoniale```