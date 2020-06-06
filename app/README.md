# AGENZIA MATRIMONIALE - BONOLDI ENRICO

L'applicazione è basata su nodejs.
Per ridurre il numero di dipendenze non sono implementati librerie (```cliProgress``` ...) quindi per il setup del database basta una semplice installazione di nodejs.

## REQUIREMENTS

- nodejs (versione >= 12.0.0)

- postgres (testato con pg v.11)
  - estensione GIS postGIS 

# DB SETUP
La prodecura creerà le tabelle necessarie e lo popolerà con i dati contenuti in ```./db/{nome_risorsa}```

1. Creare il database *agenzia_matrimoniale*;
2. eseguire il comando :``` ./db/create_db.js agenzia_matrimoniale```


# APP SETUP

1. configurare il file ```env.json``` con la propria configurazione
1. eseguire il comando ```npm install```
   - dovrebbe risolvere tutte le dipendenze... in caso di errore controllare i privilegi delle directory e riprovare.
2. eseguire il comando ```node index.js [porta]```
   - di default la porta è la 8080 ma si puo configurare in caso di problemi di binding.

