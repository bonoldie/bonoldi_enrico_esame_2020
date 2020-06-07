const crypto = require("crypto")

module.exports.getHashPassword = password => {
   return crypto.createHash("sha256").update(password).digest("base64")
}
