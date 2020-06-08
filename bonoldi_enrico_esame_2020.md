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
- [SISTEMI E RETI](#sistemi-e-reti)

--- 
## *Descrizione* 
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
   2.  basata sul orientamento sessuales

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

DDL disponibile [qui](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/db/agenzia_immobiliare.ddl.sql)   
[app/db/agenzia_immobiliare.ddl.sql](app/db/agenzia_immobiliare.ddl.sql)


## 4. Query significative

#### [Ricerca dei partner](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/libs/user.js#L37)
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

#### [Orientamento sessuale](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/db/agenzia_immobiliare.ddl.sql#L111)


[app/db/agenzia_immobiliare.ddl.sql](app/db/agenzia_immobiliare.ddl.sql#L111)

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

entry file **index.js** : 
  - setup di expressJS e registrazione routes.

### Login/Registrazione

- Inizializzazione di una nuova sessione
- Controllo accesso via [middleware](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/middlewares/auth.js#L5) ([app/middlewares/auth.js](app/middlewares/auth.js#L5))
- Validazione e registrazione

![login page](http://localhost:8080/assets/login.png)
![register page](http://localhost:8080/assets/registrazione.png)

### Ricerca

- [Ricerca dinamica](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/public/js/usersMap.js) dei possibili partner in un certo range (in km)
- l'endpoint per la ricerca è ```/api/find/{range in metri}```
  - ritornerà una lista di utenti compatibili

![find page](http://localhost:8080/assets/find.png)

### Profilo account

- Visionare i dati personali del proprio account
- Modificare l'immagine profilo (cliccando sull'immagine corrente)
  - l'endpoint per la modifica dell'immagine profilo è ```/users/img```

![profile page](http://localhost:8080/assets/profile.png)

### Profilo utente

- Visionare i dati dell'account di un utente iscritto alla piattaforma

![user page](http://localhost:8080/assets/user.png)

# SISTEMI E RETI 

