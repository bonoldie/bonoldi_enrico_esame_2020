const db = require("./db")

const getUser = async (userID) => {
   const client = await db()

   return await client.query("SELECT *,ST_AsText(posizione) as posizione_coordinate FROM info_utente WHERE id=$1 LIMIT 1", [userID])
      .then(res => {
         if (res.rowCount == 1) {
            return res.rows[0]
         }
      })
      .catch(err => {
         console.log(err)
         return false
      }).finally(() => {
         client.release()
      })
}

const getUsers = async () => {
   const client = await db()

   return await client.query("SELECT *,ST_AsText(posizione) as posizione_coordinate FROM info_utente")
      .then(res => {
         return res.rows
      })
      .catch(err => {
         return false
      }).finally(() => {
         client.release()
      })
}

const findUsers = async (userID, distance) => {
   const client = await db()

   return await client.query(`select *,
   ST_AsText(posizione) as posizione_coordinate, 
   ST_Distance(
      info_utente.posizione, 
      (select posizione from info_utente where info_utente.id = $1)) as distance_between 
   from info_utente 
   where 
      (ST_Distance(info_utente.posizione, (select posizione from info_utente where info_utente.id = $1)) < $2
      AND position((select sesso from info_utente where info_utente.id = $1) in info_utente.orientamento_aggregato) > 0
     AND position(info_utente.sesso in (select orientamento_aggregato from info_utente where info_utente.id = $1)) > 0) OR info_utente.id = $1`,
      [userID, distance])

      .then(res => {
         return res.rows
      })
      .catch(err => {
         return false
      }).finally(() => {
         client.release()
      })
}


const updateorientamentoSesso = async (userID, { sesso_maschio, sesso_femmina }) => {
   const client = await db()
   let status = true
   await client.query("DELETE FROM orientamento WHERE utente_id = $1", [userID])

   if (sesso_maschio) {
      status = status && await client.query("INSERT INTO orientamento (utente_id,sesso_id) VALUES($1,(SELECT id FROM sesso WHERE nome = 'maschio'))", [userID])
         .then(res => true)
         .catch(err => false)
   }

   if (sesso_femmina) {
      status = status && await client.query("INSERT INTO orientamento (utente_id,sesso_id) VALUES($1,(SELECT id FROM sesso WHERE nome = 'femmina'))", [userID])
         .then(res => true)
         .catch(err => false)
   }

   client.release()

   return status
}


module.exports = { getUser, getUsers, findUsers, updateorientamentoSesso }