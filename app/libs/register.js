const db = require("./db")
const { getHashPassword } = require("./utils")


const register = async ({ email, password, nome, cognome, data_nascita, telefono, residenza_id, sesso_id }) => {
   const client = await db()

   return await client.query(
      "INSERT INTO utente (email, password, nome, cognome, data_nascita, telefono, residenza_id, sesso_id ) VALUES ($1 ,$2 ,$3 ,$4 ,$5 ,$6 ,$7 ,$8)",
      [email, getHashPassword(password), nome, cognome, data_nascita, telefono, residenza_id, sesso_id])
      .then(res => {
         return res
      })
      .catch(err => {
         return false
      }).finally(() => {
         client.release()
      })
}

module.exports.register = register