const db = require("./db")
const { getHashPassword } = require("./utils")

const getCities = async (email, password) => {
   const client = await db()

   return await client.query("SELECT * FROM citta")
      .then(res => res.rows)
      .catch(err => {
         return false
      }).finally(() => {
         client.release()
      })
}

module.exports.getCities = getCities