# Bonoldi Enrico, Classe 5AI <!-- omit in toc -->

## ELABORATO INDIVIDUALE DI INFORMATICA E SISTEMI E RETI <!-- omit in toc -->

- [INFORMATICA](#informatica)
  - [1. Analisi](#1-analisi)
    - [Soluzione proposta](#soluzione-proposta)
    - [Tecnologie utilizzate](#tecnologie-utilizzate)
      - [lato server](#lato-server)
      - [lato client](#lato-client)
    - [Struttura](#struttura)
    - [Supposizioni](#supposizioni)
    - [Possibili sviluppi futuri](#possibili-sviluppi-futuri)
  - [2. Modello concettuale e logico](#2-modello-concettuale-e-logico)
      - [Modello ER](#modello-er)
      - [Modello logico](#modello-logico)
      - [note di realizzazione](#note-di-realizzazione)
  - [3. Implementazione database](#3-implementazione-database)
  - [4. Query significative](#4-query-significative)
      - [Ricerca dei partner](#ricerca-dei-partner)
      - [Orientamento sessuale](#orientamento-sessuale)
  - [5. Applicazione Web (implementazione completa)](#5-applicazione-web-implementazione-completa)
    - [Login/Registrazione](#loginregistrazione)
    - [Ricerca](#ricerca)
    - [Profilo account](#profilo-account)
    - [Profilo utente](#profilo-utente)
    - [Proxy immagini profilo](#proxy-immagini-profilo)
  - [6.a NoSql](#6a-nosql)
  - [6.b Sviluppo](#6b-sviluppo)
- [SISTEMI E RETI](#sistemi-e-reti)
  - [Navigazione web](#navigazione-web)
    - [Soluzione HTTP Secure](#soluzione-http-secure)
    - [Funzionamento](#funzionamento)
    - [Installazione](#installazione)

--- 
## *Descrizione* <!-- omit in toc -->
> Un’agenzia matrimoniale vuole gestire e pubblicare con un’applicazione web le informazioni per la
ricerca della propria anima gemella in un dato territorio.

# INFORMATICA

## 1. Analisi

Soggetto : Agenzia Matrimoniale  
Clienti : Chiunque (vedi supposizioni...)

L'applicativo deve fornire l'accesso alle azioni di ricerca in modo semplice e veloce.

> *Entrando in un ambito così personale è necessario tener conto della sicurezza relativa ai dati sensibili.*

### Soluzione proposta

La scelta dell'abiente è ricaduta su nodeJS e expressJS data la loro immediatezza e velocità di sviluppo.
Offrono stumenti (validator,session manager,...) che permettono di gestire in sicurezza le parti piu critiche della applicazione quali inserimento di dati e autenticazione.

###  Tecnologie utilizzate

#### lato server
- [NodeJS](https://nodejs.org/it/)
- [ExpressJS](https://expressjs.com/it/)
  - [express-session](https://www.npmjs.com/package/express-session)   
  - [EJS](https://ejs.co/) (templating) 
  - [pg](https://www.npmjs.com/package/pg)

#### lato client
- HTML
- CSS ([Bootstrap](https://getbootstrap.com/))
- Javascript
  - [Leaflet](https://leafletjs.com/) (mappe)
  - [Jquery](https://jquery.com/)

### Struttura

La struttura del progetto è la seguente:
- **Accesso**
  - **Registrazione**
  - **Login/Logout**
- **Ricerca**
- Gestione profilo

##### in grassetto i servizi implementati nella soluzione finale. <!-- omit in toc -->

### Supposizioni

1. gli iscritti al sistema siano maggiorenni.
2. l'orientamento sessuale di ogni utente può essere maschio e/o femmina.
3. ricerca
   1.  basata sulla distanza tra i comuni di residenza degli utenti dal quello dell'utente che ricerca.
   2.  basata sul orientamento sessuale

### Possibili sviluppi futuri

1. Ampliamento profilo e ricerca (carattere, aspetto,...)
2. Messaggistica istantanea.

## 2. Modello concettuale e logico

#### Modello ER

![ER](http://localhost:8080/assets/ER.png)

#### Modello logico

CITTA(<ins>istat_id</ins>,comune,provincia,regione,posizione)  
CAP(*<ins>istat_id</ins>*,<ins>CAP</ins>)  

SESSO(<ins>id</ins>,nome)  
UTENTE(<ins>id</ins>,*sesso_id*,*residenza_id*,email,password,nome,cognome,data_nascita,telefono)

ORIENTAMENTO(*<ins>	utente_id </ins>*,	*<ins>sesso_id </ins>*)

#### note di realizzazione

- La tabella ```CAP``` è attualmente inutilizzata ma è stata inserita per completezza.
- E' stata inserita una vista per facilitare l'accesso ai dati utente. 


## 3. Implementazione database

DDL disponibile [qui](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/db/agenzia_matrimoniale.ddl.sql)   
[app/db/agenzia_matrimoniale.ddl.sql](app/db/agenzia_matrimoniale.ddl.sql)

DUMP disponibile [qui](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/db/agenzia_matrimoniale.dump.sql)   
[app/db/agenzia_matrimoniale.dump.sql](app/db/agenzia_matrimoniale.dump.sql)

## 4. Query significative

#### [Ricerca dei partner](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/libs/user.js#L37-L47)
[app/libs/user.js](app/libs/user.js#L37)

> $1 - id utente  
> $2 - distanza dall'utente corrente (in metri) 

```sql
SELECT
   *,
   ST_AsText(posizione) as posizione_coordinate,
   ST_Distance(
      info_utente.posizione,
      (
         SELECT
            posizione
         from
            info_utente
         where
            info_utente.id = $1
      )
   ) as distance_between
from
   info_utente
where
   (
      ST_Distance(
         info_utente.posizione,
         (
            SELECT
               posizione
            from
               info_utente
            where
               info_utente.id = $1
         )
      ) < $2
      AND position(
         (
            SELECT
               sesso
            from
               info_utente
            where
               info_utente.id = $1
         ) in info_utente.orientamento_aggregato
      ) > 0
      AND position(
         info_utente.sesso in (
            SELECT
               orientamento_aggregato
            from
               info_utente
            where
               info_utente.id = $1
         )
      ) > 0
   )
   OR info_utente.id = $1
```

#### [Orientamento sessuale](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/db/agenzia_matrimoniale.ddl.sql#L111-L120)


[app/db/agenzia_matrimoniale.ddl.sql](app/db/agenzia_matrimoniale.ddl.sql#L111)

utilizzata nella costruzione della view ```info_utente```

```sql
SELECT
   orientamento.utente_id,
   array_to_string(array_agg(sesso.nome), ',' :: text)  
   AS orientamento_aggregato
FROM
   orientamento,
   sesso sesso
WHERE
   orientamento.sesso_id = sesso.id
GROUP BY
   orientamento.utente_id
```

## 5. Applicazione Web (implementazione completa)

path : ```app```

folders:
   - **libs** : utilities per accesso al db (registrazione,login,...)  
   - **db** : file per il setup e popolamento del db
   - **middlewares**
   - **public** : directory per servire file statici (js,css,assets,...)
   - **views** : templates e sections per *EJS*

entry file [**index.js**](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/index.json): 
  - setup di expressJS e registrazione routes.

env file [**env.json**](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/env.json)  

### Login/Registrazione

- [Login](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/index.js#L29-L58) e inizializzazione di una nuova sessione
- Controllo accesso via [middleware](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/middlewares/auth.js#L5) ([app/middlewares/auth.js](app/middlewares/auth.js))
- [Registrazione](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/index.js#L64-L103)

![login page](http://localhost:8080/assets/login.png)
![register page](http://localhost:8080/assets/registrazione.png)

### Ricerca

- [Ricerca dinamica](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/public/js/usersMap.js) dei possibili partner in un certo range (in km)
- l'[endpoint per la ricerca](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/index.js#L154-L161) è ```/api/find/{range in metri}```
  - ritornerà una lista di utenti compatibili

![find page](http://localhost:8080/assets/find.png)

### Profilo account

- Visionare i dati personali del proprio account
- Modificare l'immagine profilo (cliccando sull'immagine corrente)
  - [l'endpoint per la modifica dell'immagine profilo](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/index.js#L133-L145) è ```/users/img```

![profile page](http://localhost:8080/assets/profile.png)

### Profilo utente

- Visionare i dati dell'account di un utente iscritto alla piattaforma

![user page](http://localhost:8080/assets/user.png)


### Proxy immagini profilo
Per ritornare una immagine profilo di default è stata implementata una [**route "proxy"**](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/index.js#L113-L130)

## 6.a NoSql 

Una alternativa efficace a **postgres~postgis** è **mongodb~geoJSON**.  

**GeoJSON** ([RFC 7946](https://tools.ietf.org/html/rfc7946)) è una specifica che introduce nel tipo di file **JSON** i riferimenti geospaziali (Point,LineString,...) e il sistema di coordinate.

## 6.b Sviluppo

Per il mantenimento del codice è stato usato **GIT**

# SISTEMI E RETI 

## *Descrizione* <!-- omit in toc -->
>Esporre una possibile soluzione tecnologica, giustificandola, che consenta all’agenzia di offrire ai clienti la possibilità di accedere al servizio offerto in totale sicurezza e riservatezza. Illustrare in particolare gli aspetti di sicurezza delle comunicazioni a base web.

## Navigazione web

Quando navigiamo nella rete percorriamo "strade" non protette e gestite da terzi; questo solleva un problema di sicurezza visto che la nostra applicazione dovrà distribuire dati personali.

### Soluzione HTTP Secure

L'applicazione web usa **HTTP** e questo non garantisce nessuna sicurezza per quanto riguarda la riservatezza; non è presente **nessun meccanismo di crittografia** e i dati viaggiano in chiaro tra client e server.  

Per mettere in sicurezza HTTP si utilizza SSL(secure socket layer, TLS nella forma aggiornata) che si avvale di un meccanismo di certificati e crittografia asimmetrica per garantire la sicurezza.

### Funzionamento  
La crittografia a **chiave asimmetrica** ci garantisce la riservatezza della comunicazione ma dal momento che questa modalità ha bisogno di distribuire la chiave pubblica sorge un problema di autenticità che è risolto mediante l'utilizzo di **Enti certificatori** che garantiscono l'autenticità della chiave pubblica utilizzata per la comunicazione.  

> Questo tipo di autenticazione può essere one-way nel caso sia solo il server ad autenticarsi, two-way (mutual) nel caso sia anche il client a doversi autenticare; nel secondo caso il procedimento rimane lo stesso sia per il client che per il server.

1. **Client Hello**
   In questa fase il client richiede al serve la connessione protetta tramite TLS e invia una serie di informazioni (epoch time,session ID, chipers, server name)
2. **Server Hello**
   Contiene la risposta al client con informazioni relative a:
   1. Certificato
   2. Algoritmi ci cifratura
   3. Conferma di autenticazione (one-way o two-way)
3. **Controllo certificato**
   Il client (il browser) verifica l'autenticità del certificato 
   affidandosi agli enti certificatori e controlla l'impronta e l'hostname.
   Inoltre registra gli algoritmi accettati dal server.
4. Da qui in poi la comunicazione passa a livello applicazione in cui tutto il traffico HTTP viene criptato/decriptato da TLS.

### Installazione

1. Generiamo una chiave asimmetrica (RSA)   
   - ``` openssl genrsa -des3 -passout pass:admin -out agenzia_matrimoniale.key 2048 ```    
2. Generiamo la **CSR** (Certificate Signing Request), in questo modo chiediamo all'ente di approvare la nostra richiesta per la generazione di un certificato. In questo vanno inseriti una serie di informazioni circa il servizio che vogliamo certificare.
   -  ```openssl req -new -key agenzia_matrimoniale.key -out agenzia_matrimoniale.csr```
3. La nostra richiesta di certificato viene inviata all'ente e in caso di approvazione ottenia il certificato vero e proprio (```agenzia_matrimoniale.crt```).  
Nel nostro caso non avendo a disposizione un ente certificatore la csr è stata auto verificata con ```openssl``` con una durata di 365 giorni.   
**NOTA** : non  essendo noi un ente certificatore non possiamo dare nessuna garanzia sul certificato, che rimane comunque utilizzabile ma non "sicuro"
   - ```openssl x509 -req -days 365 -in agenzia_matrimoniale.csr -signkey agenzia_matrimoniale.key  -out agenzia_matrimoniale.crt```

Questo è il [risultato finale](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/tree/master/app/cert)

![cert](http://localhost:8080/assets/cert.png)

