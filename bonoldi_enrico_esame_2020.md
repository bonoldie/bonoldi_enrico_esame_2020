# Bonoldi Enrico, Classe 5AI <!-- omit in toc -->

## ELABORATO INDIVIDUALE DI INFORMATICA E SISTEMI E RETI <!-- omit in toc -->


- [INFORMATICA](#informatica)
  - [1. *Analisi*](#1-analisi)
    - [Soluzione proposta](#soluzione-proposta)
    - [Tecnologie utilizzate](#tecnologie-utilizzate)
      - [lato server](#lato-server)
      - [lato client](#lato-client)
    - [Struttura](#struttura)
    - [*Supposizioni*](#supposizioni)
    - [*Possibili sviluppi futuri*](#possibili-sviluppi-futuri)
  - [2. *Modello concettuale e logico*](#2-modello-concettuale-e-logico)
      - [MODELLO ER](#modello-er)
      - [MODELLO LOGICO](#modello-logico)
      - [NOTE DI REALIZZAZIONE](#note-di-realizzazione)
  - [3. IMPLEMENTAZIONE DATABASE](#3-implementazione-database)
  - [4. QUERY SIGNIFICATIVE](#4-query-significative)
      - [RICERCA DEI POSSIBILI PARTNER NELLA ZONE](#ricerca-dei-possibili-partner-nella-zone)
- [SISTEMI E RETI](#sistemi-e-reti)



--- 
## *Descrizione* 
> Un’agenzia matrimoniale vuole gestire e pubblicare con un’applicazione web le informazioni per la
ricerca della propria anima gemella in un dato territorio.

# INFORMATICA

## 1. *Analisi*

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
- CSS
- Javascript

### Struttura

La struttura del progetto è la seguente:
- **Accesso**
  - **Registrazione**
  - **Login/Logout**
- **Ricerca**
- Gestione profilo

##### in grassetto i servizi implementati nella soluzione finale. <!-- omit in toc -->

### *Supposizioni*

1. gli iscritti al sistema siano maggiorenni.
2. l'orientamento sessuale di ogni utente può essere maschio e/o femmina.
3. ricerca
   1.  basata sulla distanza tra i comuni di residenza degli utenti dal quello dell'utente che ricerca.
   2.  basata sul orientamento sessuales

### *Possibili sviluppi futuri*

1. Ampliamento profilo e ricerca (carattere, aspetto,...)
2. Messaggistica istantanea.

## 2. *Modello concettuale e logico*

#### MODELLO ER

![ER](ELABORATO.png)

#### MODELLO LOGICO

CITTA(<ins>istat_id</ins>,comune,provincia,regione,posizione)  
CAP(*<ins>istat_id</ins>*,<ins>CAP</ins>)  

SESSO(<ins>id</ins>,nome)  
UTENTE(<ins>id</ins>,*sesso_id*,*residenza_id*,email,password,nome,cognome,data_nascita,telefono)

ORIENTAMENTO(*<ins>	utente_id </ins>*,	*<ins>sesso_id </ins>*)

#### NOTE DI REALIZZAZIONE

- La tabella ```CAP``` è attualmente inutilizzata ma è stata inserita per completezza.
- E' stata inserita una vista per facilitare l'accesso ai dati utente. 


## 3. IMPLEMENTAZIONE DATABASE

DDL disponibile [qui](https://github.com/Bonoldiz/bonoldi_enrico_esame_2020/blob/master/app/db/agenzia_immobiliare.ddl.sql) ( local path : ```app/db/agenzia_immobiliare.ddl.sql``` )


## 4. QUERY SIGNIFICATIVE

#### RICERCA DEI POSSIBILI PARTNER NELLA ZONE

$1 - id utente  
$2 - distanza dall'utente corrente (in metri) 

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
````


# SISTEMI E RETI 
