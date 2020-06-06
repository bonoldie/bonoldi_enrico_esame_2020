const db = require("./db")
const crypto = require("crypto")

const getHashPassword = password => {
   return crypto.createHash("sha256").update(password).digest("base64")
}

const authenticate = async (email, password) => {
   const client = await db()

   
   return await client.query("SELECT * FROM utente WHERE email=$1 LIMIT 1", [email])
      .then(res => {
         console.log(res)
         if(res.rowCount == 1 && res.rows[0].password === getHashPassword(password)){
            return res.rows[0]
         }
      })
      .catch(err => {
         return false
      }).finally(()=>{
         client.release()
      })
}

module.exports.authenticate = authenticate