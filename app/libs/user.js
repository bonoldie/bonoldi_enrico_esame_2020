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

   return await client.query("select *,ST_AsText(posizione) as posizione_coordinate, ST_Distance(info_utente.posizione, (select posizione from info_utente where info_utente.id = $1)) as distance_between from info_utente where ST_Distance(info_utente.posizione, (select posizione from info_utente where info_utente.id = $1)) < $2 ", [userID, distance])
      .then(res => {
         return res.rows
      })
      .catch(err => {
         return false
      }).finally(() => {
         client.release()
      })
}

module.exports = { getUser, getUsers, findUsers }